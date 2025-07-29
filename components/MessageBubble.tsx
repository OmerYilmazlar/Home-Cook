import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Message } from '@/types';
import Colors from '@/constants/colors';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '85%',
    marginVertical: 6,
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  otherUserBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  currentUserText: {
    color: Colors.white,
  },
  otherUserText: {
    color: Colors.text,
  },
  timeText: {
    fontSize: 11,
    color: Colors.subtext,
    marginTop: 6,
    fontWeight: '600',
    opacity: 0.8,
  },
});