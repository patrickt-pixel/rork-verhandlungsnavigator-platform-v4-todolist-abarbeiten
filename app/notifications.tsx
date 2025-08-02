import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useNotifications } from '@/hooks/notification-store';
import { COLORS } from '@/constants/colors';
import { Bell, ArrowLeft, Check, CheckCheck } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'booking' | 'message' | 'system' | 'reminder';
    isRead: boolean;
    createdAt: string;
  };
  onPress: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return COLORS.primary;
      case 'message': return COLORS.success;
      case 'system': return COLORS.warning;
      case 'reminder': return COLORS.info;
      default: return COLORS.textMuted;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Gerade eben';
    } else if (diffInHours < 24) {
      return `vor ${Math.floor(diffInHours)} Stunden`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.notificationItem, !notification.isRead && styles.unreadItem]}
      onPress={() => onPress(notification.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(notification.type) }]} />
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadTitle]}>
          {notification.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>
          {formatDate(notification.createdAt)}
        </Text>
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationPress = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Benachrichtigungen',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            unreadCount > 0 ? (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                <CheckCheck size={20} color={COLORS.primary} />
                <Text style={styles.markAllText}>Alle lesen</Text>
              </TouchableOpacity>
            ) : null
          ),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 18,
            fontWeight: '600',
          },
        }} 
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Benachrichtigungen werden geladen...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Keine Benachrichtigungen"
          message="Sie haben derzeit keine Benachrichtigungen."
          icon={<Bell size={40} color={COLORS.textLighter} />}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onPress={handleNotificationPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: COLORS.backgroundPurple,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
});