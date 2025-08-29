import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation } from '@/types';
import { messageService } from '@/lib/database';

function getConversationId(a: string, b: string): string {
  return [a, b].sort().join(':');
}

interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  allMessages: Message[]; // Global message store
  isLoading: boolean;
  error: string | null;
  
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (userId1: string, userId2: string) => Promise<void>;
  sendMessage: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAsRead: (userId: string, otherUserId: string) => Promise<void>;
  createConversation: (participants: string[]) => Promise<string>;
  initializeMessages: () => void;
}

export const useMessagingStore = create<MessagingState>()(persist(
  (set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    allMessages: [],
    isLoading: false,
    error: null,
    
    initializeMessages: () => {
      // Messages will be loaded from Supabase when needed
      console.log('Messaging store initialized');
    },
  
  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const raw = await AsyncStorage.getItem('messages');
      const all: Message[] = raw ? JSON.parse(raw) as Message[] : [];

      const byConversation: Record<string, { participants: [string, string]; messages: Message[] }> = {};

      all.forEach((m: Message) => {
        const isMine = m.senderId === userId || m.receiverId === userId;
        if (!isMine) return;
        const otherId = m.senderId === userId ? m.receiverId : m.senderId;
        const key = getConversationId(userId, otherId);
        if (!byConversation[key]) {
          byConversation[key] = { participants: [userId, otherId], messages: [] };
        }
        byConversation[key].messages.push(m);
      });

      const conversations: Conversation[] = Object.entries(byConversation).map(([id, data]) => {
        const sorted = data.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const last = sorted[sorted.length - 1];
        const unreadCount = sorted.filter((m) => !m.read && m.receiverId === userId).length;
        return {
          id,
          participants: data.participants,
          lastMessage: last,
          unreadCount,
        } as Conversation;
      }).sort((a, b) => {
        const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bt - at;
      });

      set({ conversations, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations', 
        isLoading: false 
      });
    }
  },
  
  fetchMessages: async (userId1: string, userId2: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch messages between two users
      const messages = await messageService.getMessagesBetweenUsers(userId1, userId2);
      
      // Create or find conversation
      const conversationId = getConversationId(userId1, userId2);
      const conversation: Conversation = {
        id: conversationId,
        participants: [userId1, userId2],
        lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
        unreadCount: messages.filter((m: Message) => !m.read && m.receiverId === userId1).length
      };
      
      set({ 
        currentConversation: conversation,
        messages,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages', 
        isLoading: false 
      });
    }
  },
  
  sendMessage: async (messageData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Send message to Supabase
      const newMessage = await messageService.sendMessage(
        messageData.senderId,
        messageData.receiverId,
        messageData.content
      );
      
      set(state => {
        // Add message to global messages array
        const updatedAllMessages = [...state.allMessages, newMessage];

        // Determine conversation id and participants
        const convId = getConversationId(newMessage.senderId, newMessage.receiverId);
        const participants: [string, string] = [newMessage.senderId, newMessage.receiverId];

        // Add message to current conversation messages (or start a new thread in UI)
        const updatedMessages = [...state.messages, newMessage];

        // Ensure there's a current conversation
        let updatedCurrentConversation: Conversation | null = state.currentConversation;
        if (!updatedCurrentConversation || updatedCurrentConversation.id !== convId) {
          updatedCurrentConversation = {
            id: convId,
            participants,
            lastMessage: newMessage,
            unreadCount: 0,
          } as Conversation;
        } else {
          updatedCurrentConversation = {
            ...updatedCurrentConversation,
            lastMessage: newMessage,
          } as Conversation;
        }

        // Upsert conversation in conversations array
        const existingIdx = state.conversations.findIndex(c => c.id === convId);
        let updatedConversations: Conversation[];
        if (existingIdx >= 0) {
          updatedConversations = state.conversations.map((c, i) => i === existingIdx ? { ...c, lastMessage: newMessage } as Conversation : c);
        } else {
          updatedConversations = [
            { id: convId, participants, lastMessage: newMessage, unreadCount: 0 } as Conversation,
            ...state.conversations,
          ];
        }

        return {
          allMessages: updatedAllMessages,
          messages: updatedMessages,
          currentConversation: updatedCurrentConversation,
          conversations: updatedConversations,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message', 
        isLoading: false 
      });
    }
  },
  
  markAsRead: async (userId: string, otherUserId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mark messages as read in Supabase
      await messageService.markMessagesAsRead(userId, otherUserId);
      
      set(state => {
        // Update messages in local state
        const updatedAllMessages = state.allMessages.map(message => 
          message.senderId === otherUserId && message.receiverId === userId
            ? { ...message, read: true } 
            : message
        );
        
        // Update current conversation messages
        const updatedMessages = state.messages.map(message => 
          message.senderId === otherUserId && message.receiverId === userId
            ? { ...message, read: true } 
            : message
        );
        
        // Update unread count in current conversation
        let updatedCurrentConversation = state.currentConversation;
        if (updatedCurrentConversation) {
          updatedCurrentConversation = {
            ...updatedCurrentConversation,
            unreadCount: 0,
          };
        }
        
        return {
          allMessages: updatedAllMessages,
          messages: updatedMessages,
          currentConversation: updatedCurrentConversation,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark messages as read', 
        isLoading: false 
      });
    }
  },
  
  createConversation: async (participants: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      const state = get();
      
      // Check if conversation already exists
      const existingConversation = state.conversations.find(
        conversation => 
          participants.every(p => conversation.participants.includes(p)) &&
          conversation.participants.length === participants.length
      );
      
      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        set({ 
          currentConversation: existingConversation,
          isLoading: false 
        });
        return existingConversation.id;
      }
      
      // Create new conversation
      const newConversation: Conversation = {
        id: getConversationId(participants[0], participants[1]),
        participants,
        unreadCount: 0,
      };
      
      console.log('Created new conversation:', newConversation.id);
      
      set(state => ({
        conversations: [...state.conversations, newConversation],
        currentConversation: newConversation,
        messages: [],
        isLoading: false,
      }));
      
      return newConversation.id;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create conversation', 
        isLoading: false 
      });
      return '';
    }
  },
}),
{
  name: 'messaging-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({ allMessages: state.allMessages }),
}
));