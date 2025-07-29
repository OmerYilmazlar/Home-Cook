import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Send } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useMessagingStore } from '@/store/messaging-store';
import Colors from '@/constants/colors';
import MessageBubble from '@/components/MessageBubble';
import { mockCooks, mockCustomers } from '@/mocks/users';

export default function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const { currentConversation, messages, fetchMessages, sendMessage, markAsRead, initializeMessages } = useMessagingStore();
  
  const [messageText, setMessageText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    // Initialize messages on first load
    initializeMessages();
    
    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard shows
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
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
      if (id && user) {
        fetchMessages(id);
      }
    }, [id, user])
  );
  
  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      // Mark unread messages as read
      const unreadMessageIds = messages
        .filter(m => !m.read && m.receiverId === user?.id)
        .map(m => m.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [currentConversation, messages]);
  
  const getOtherUser = () => {
    if (!currentConversation || !user) return null;
    
    const otherUserId = currentConversation.participants.find(
      participantId => participantId !== user.id
    );
    
    if (!otherUserId) return null;
    
    const allUsers = [...mockCooks, ...mockCustomers];
    return allUsers.find(u => u.id === otherUserId);
  };
  
  const otherUser = getOtherUser();
  
  const handleSend = async () => {
    if (!messageText.trim() || !user || !otherUser) return;
    
    await sendMessage({
      senderId: user.id,
      receiverId: otherUser.id,
      content: messageText.trim(),
    });
    
    setMessageText('');
    
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.senderId === user?.id}
    />
  );
  
  const screenHeight = Dimensions.get('window').height;
  const inputBottomOffset = Platform.OS === 'ios' ? 34 : 20; // Safe area bottom
  const inputContainerHeight = 80 + inputBottomOffset; // Approximate input container height
  const additionalKeyboardOffset = 20; // Extra space above keyboard

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
            { paddingBottom: inputContainerHeight + keyboardHeight + 40 }
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
      >
        <View style={[
          styles.inputContainer,
          keyboardHeight > 0 && { 
            marginBottom: Platform.OS === 'android' ? keyboardHeight + additionalKeyboardOffset : additionalKeyboardOffset 
          }
        ]}>
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