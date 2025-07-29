import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/auth-store';
import { useMessagingStore } from '@/store/messaging-store';
import Colors from '@/constants/colors';
import ConversationItem from '@/components/ConversationItem';
import EmptyState from '@/components/EmptyState';
import { mockCooks, mockCustomers } from '@/mocks/users';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { conversations, fetchConversations, isLoading, initializeMessages } = useMessagingStore();
  
  useEffect(() => {
    // Initialize messages on first load
    initializeMessages();
  }, []);
  
  // Refresh conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchConversations(user.id);
      }
    }, [user])
  );
  
  const getOtherUserInfo = (participantIds: string[]) => {
    if (!user) return { name: '', avatar: '' };
    
    const otherUserId = participantIds.find(id => id !== user.id);
    if (!otherUserId) return { name: '', avatar: '' };
    
    const allUsers = [...mockCooks, ...mockCustomers];
    const otherUser = allUsers.find(u => u.id === otherUserId);
    
    return {
      name: otherUser?.name || 'Unknown User',
      avatar: otherUser?.avatar,
    };
  };
  
  const renderConversationItem = ({ item }: { item: any }) => {
    const { name, avatar } = getOtherUserInfo(item.participants);
    
    return (
      <ConversationItem
        conversation={item}
        otherUserName={name}
        otherUserAvatar={avatar}
        currentUserId={user?.id || ''}
      />
    );
  };
  
  if (conversations.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="No Messages Yet"
        message="Your conversations will appear here. Start by exploring meals and contacting cooks."
        image="https://images.unsplash.com/photo-1577563908411-5077b6dc7624"
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
});