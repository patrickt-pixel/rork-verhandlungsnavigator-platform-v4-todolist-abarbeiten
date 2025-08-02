import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { NotificationService } from '@/lib/supabase-service';
import { useAuth } from './auth-store';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'system' | 'reminder';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const [NotificationProvider, useNotifications] = createContextHook<NotificationState>(() => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: notificationError } = await NotificationService.getUserNotifications(user.id);
      
      if (notificationError) {
        throw new Error(notificationError.message);
      }
      
      const formattedNotifications: Notification[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        isRead: item.is_read || item.isRead,
        data: item.data,
        createdAt: item.created_at || item.createdAt
      }));
      
      setNotifications(formattedNotifications);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load notifications');
      }
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: markError } = await NotificationService.markNotificationAsRead(notificationId);
      
      if (markError) {
        throw new Error(markError.message);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      await Promise.all(
        unreadNotifications.map(notification => 
          NotificationService.markNotificationAsRead(notification.id)
        )
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
});