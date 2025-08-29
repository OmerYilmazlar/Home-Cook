import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Conversation } from '@/types';
import Colors from '@/constants/colors';

interface ConversationItemProps {
  conversation: Conversation;
  otherUserName: string;
  otherUserAvatar?: string;
  currentUserId: string;
}

export default function ConversationItem({
  conversation,
  otherUserName,
  otherUserAvatar,
  currentUserId,
}: ConversationItemProps) {
  const router = useRouter();
  
  const handlePress = () => {
    const otherUserId = conversation.participants.find(p => p !== currentUserId) || conversation.participants[0];
    router.push(`/messages/${otherUserId}`);
  };
  
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const isFromCurrentUser = conversation.lastMessage.senderId === currentUserId;
    const prefix = isFromCurrentUser ? 'You: ' : '';
    
    return `${prefix}${conversation.lastMessage.content}`;
  };
  
  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {otherUserAvatar ? (
        <Image
          source={{ uri: otherUserAvatar }}
          style={styles.avatar}
          contentFit="cover"
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{otherUserName}</Text>
          <Text style={styles.time}>
            {formatTime(conversation.lastMessage?.createdAt)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.message} numberOfLines={1}>
            {getLastMessagePreview()}
          </Text>
          
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 12,
    color: Colors.subtext,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    fontSize: 15,
    color: Colors.subtext,
    flex: 1,
    marginRight: 12,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
});