import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  testID?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isCurrentUser,
  testID 
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View 
      style={[
        styles.container, 
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}
      testID={testID}
    >
      <View 
        style={[
          styles.bubble, 
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}
      >
        <Text style={[
          styles.message,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: 4,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 2,
  },
  currentUserBubble: {
    backgroundColor: COLORS.primary,
  },
  otherUserBubble: {
    backgroundColor: COLORS.backgroundLight,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserMessage: {
    color: COLORS.white,
  },
  otherUserMessage: {
    color: COLORS.text,
  },
  time: {
    fontSize: 12,
    color: COLORS.textLight,
    marginHorizontal: 4,
  },
});