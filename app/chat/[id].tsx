import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useChat } from '@/hooks/chat-store';
import { useAuth } from '@/hooks/auth-store';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { COLORS } from '@/constants/colors';
import { MessageCircle } from 'lucide-react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMessages, sendMessage, markThreadAsRead, isLoading, chatThreads } = useChat();
  const { user } = useAuth();
  const [messages, setMessages] = useState(getMessages(id));
  const flatListRef = useRef<FlatList>(null);

  const thread = chatThreads.find(t => t.id === id);

  useEffect(() => {
    // Mark thread as read when opening the chat
    if (thread && thread.unreadCount > 0) {
      markThreadAsRead(id);
    }
  }, [id, thread]);

  useEffect(() => {
    // Update messages when they change
    setMessages(getMessages(id));
  }, [id, getMessages]);

  const handleSend = async (content: string) => {
    await sendMessage(id, content);
    // Update messages after sending
    setMessages(getMessages(id));
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!thread) {
    return (
      <EmptyState
        title="Chat nicht gefunden"
        message="Dieser Chat existiert nicht oder wurde gelöscht."
        icon={<MessageCircle size={40} color={COLORS.textLighter} />}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {messages.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessage 
              message={item} 
              isCurrentUser={user?.id === item.senderId} 
            />
          )}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="Keine Nachrichten"
            message="Starten Sie die Konversation, indem Sie eine Nachricht senden."
            icon={<MessageCircle size={40} color={COLORS.textLighter} />}
          />
        </View>
      )}

      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});