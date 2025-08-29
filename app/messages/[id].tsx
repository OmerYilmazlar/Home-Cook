import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Send } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useMessagingStore } from '@/store/messaging-store';
import Colors from '@/constants/colors';
import MessageBubble from '@/components/MessageBubble';
import { mockCooks, mockCustomers } from '@/mocks/users';

export default function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  
  const { user } = useAuthStore();
  const { currentConversation, messages, fetchMessages, sendMessage, markAsRead, initializeMessages } = useMessagingStore();
  
  const [messageText, setMessageText] = useState('');

  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    // Initialize messages on first load
    initializeMessages();
    
    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        // Scroll to bottom when keyboard shows
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Keyboard hidden
      }
    );
    
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);
  
  // Refresh messages when screen comes into focus or when id/user changes
  useFocusEffect(
    React.useCallback(() => {
      if (id && typeof id === 'string' && user?.id) {
        fetchMessages(user.id, id);
      }
    }, [id, user?.id])
  );
  
  useEffect(() => {
    if (messages.length > 0 && user?.id && typeof id === 'string') {
      const hasUnread = messages.some(m => !m.read && m.receiverId === user.id);
      if (hasUnread) {
        markAsRead(user.id, id);
      }
    }
  }, [messages, user?.id, id]);
  
  const getOtherUser = () => {
    if (!id || typeof id !== 'string') return null;
    const allUsers = [...mockCooks, ...mockCustomers];
    return allUsers.find(u => u.id === id) ?? null;
  };
  
  const otherUser = getOtherUser();
  
  const handleSend = async () => {
    if (!messageText.trim() || !user?.id || typeof id !== 'string') return;

    console.log('Attempting to send message:', {
      messageText: messageText.trim(),
      user: user.id,
      otherUserId: id,
      currentConversation: currentConversation?.id,
    });

    try {
      await sendMessage({
        senderId: user.id,
        receiverId: id,
        content: messageText.trim(),
      });

      setMessageText('');

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.senderId === user?.id}
    />
  );
  
  const inputContainerHeight = 80; // Approximate input container height

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: otherUser?.name || 'Messages',
        }}
      />
      
      <View style={styles.messagesWrapper}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesContainer,
            { paddingBottom: inputContainerHeight + 20 }
          ]}
          style={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
              placeholderTextColor={Colors.grey}
              onFocus={() => {
                // Scroll to bottom when input is focused
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!messageText.trim()}
            >
              <Send size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    flexGrow: 1,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    color: Colors.text,
    fontWeight: '500',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.inactive,
    shadowOpacity: 0,
    elevation: 0,
  },
});