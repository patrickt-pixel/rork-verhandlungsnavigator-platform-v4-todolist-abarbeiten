import React from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useChat } from '@/hooks/chat-store';
import { EmptyState } from '@/components/EmptyState';
import { COLORS } from '@/constants/colors';
import { MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { ChatThread } from '@/types';

export default function MessagesScreen() {
  const { chatThreads, isLoading } = useChat();
  const { user } = useAuth();

  const handleChatPress = (threadId: string) => {
    router.push(`/chat/${threadId}`);
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Gestern';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('de-DE', {
        weekday: 'short',
      });
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const renderChatItem = ({ item }: { item: ChatThread }) => {
    const isClient = user?.role === 'client';
    const otherPersonName = isClient ? item.consultantName : item.clientName;
    const otherPersonAvatar = isClient ? item.consultantAvatar : item.clientAvatar;

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => handleChatPress(item.id)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: otherPersonAvatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop' }} 
          style={styles.avatar} 
        />
        {item.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.name}>{otherPersonName}</Text>
            <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
          </View>
          <Text 
            style={styles.lastMessage} 
            numberOfLines={1}
          >
            {item.lastMessage || 'Keine Nachrichten'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {chatThreads.length > 0 ? (
        <FlatList
          data={chatThreads}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.header}>Ihre Nachrichten</Text>
          }
        />
      ) : (
        <EmptyState
          title="Keine Nachrichten"
          message="Sie haben noch keine Nachrichten. Nach einer Buchung können Sie mit Ihrem Berater chatten."
          icon={<MessageCircle size={40} color={COLORS.textLighter} />}
        />
      )}
    </View>
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
  listContent: {
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 42,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  time: {
    fontSize: 12,
    color: COLORS.textLighter,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});