import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation } from '@/types';
import { mockMessages, mockConversations } from '@/mocks/messages';

interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  allMessages: Message[]; // Global message store
  isLoading: boolean;
  error: string | null;
  
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
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
      const state = get();
      if (state.allMessages.length === 0) {
        set({ allMessages: [...mockMessages] });
      }
    },
  
  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const state = get();
      
      // Get user conversations
      const userConversations = mockConversations.filter(
        conversation => conversation.participants.includes(userId)
      );
      
      // Update conversations with latest messages from global store
      const updatedConversations = userConversations.map(conversation => {
        const conversationMessages = state.allMessages.filter(message => 
          conversation.participants.includes(message.senderId) && 
          conversation.participants.includes(message.receiverId)
        );
        
        const lastMessage = conversationMessages.length > 0 
          ? conversationMessages[conversationMessages.length - 1]
          : conversation.lastMessage;
          
        const unreadCount = conversationMessages.filter(
          message => !message.read && message.receiverId === userId
        ).length;
        
        return {
          ...conversation,
          lastMessage,
          unreadCount,
        };
      });
      
      set({ 
        conversations: updatedConversations,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch conversations', 
        isLoading: false 
      });
    }
  },
  
  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const conversation = mockConversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Filter messages from global store based on participants
      const state = get();
      const conversationMessages = state.allMessages.filter(message => 
        conversation.participants.includes(message.senderId) && 
        conversation.participants.includes(message.receiverId)
      );
      
      set({ 
        currentConversation: conversation,
        messages: conversationMessages,
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMessage: Message = {
        ...messageData,
        id: `new-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      set(state => {
        // Add message to global messages array
        const updatedAllMessages = [...state.allMessages, newMessage];
        
        // Add message to current conversation messages
        const updatedMessages = [...state.messages, newMessage];
        
        // Update current conversation's last message
        let updatedCurrentConversation = state.currentConversation;
        if (updatedCurrentConversation) {
          updatedCurrentConversation = {
            ...updatedCurrentConversation,
            lastMessage: newMessage,
          };
        }
        
        // Update conversation in conversations array
        const updatedConversations = state.conversations.map(conversation => {
          if (conversation.id === state.currentConversation?.id) {
            return {
              ...conversation,
              lastMessage: newMessage,
            };
          }
          return conversation;
        });
        
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
  
  markAsRead: async (messageIds: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      set(state => {
        // Update messages in global store
        const updatedAllMessages = state.allMessages.map(message => 
          messageIds.includes(message.id) ? { ...message, read: true } : message
        );
        
        // Update current conversation messages
        const updatedMessages = state.messages.map(message => 
          messageIds.includes(message.id) ? { ...message, read: true } : message
        );
        
        // Update unread count in current conversation
        let updatedCurrentConversation = state.currentConversation;
        if (updatedCurrentConversation) {
          updatedCurrentConversation = {
            ...updatedCurrentConversation,
            unreadCount: 0,
          };
        }
        
        // Update unread count in conversations array
        const updatedConversations = state.conversations.map(conversation => {
          if (conversation.id === state.currentConversation?.id) {
            return {
              ...conversation,
              unreadCount: 0,
            };
          }
          return conversation;
        });
        
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
        error: error instanceof Error ? error.message : 'Failed to mark messages as read', 
        isLoading: false 
      });
    }
  },
  
  createConversation: async (participants: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if conversation already exists
      const existingConversation = get().conversations.find(
        conversation => 
          participants.every(p => conversation.participants.includes(p)) &&
          conversation.participants.length === participants.length
      );
      
      if (existingConversation) {
        set({ isLoading: false });
        return existingConversation.id;
      }
      
      // Create new conversation
      const newConversation: Conversation = {
        id: `new-${Date.now()}`,
        participants,
        unreadCount: 0,
      };
      
      set(state => ({
        conversations: [...state.conversations, newConversation],
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