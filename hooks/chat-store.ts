import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatThread, Message } from '@/types';
import { useAuth } from './auth-store';
import { MessageService } from '@/lib/supabase-service';

// Mock data for demonstration (used when Supabase is not configured)
export const mockChatThreads: ChatThread[] = [
  {
    id: '1',
    bookingId: '1',
    clientId: '1',
    consultantId: '2',
    clientName: 'Klaus Mueller',
    consultantName: 'Sabine Weber',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    consultantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    lastMessage: 'Vielen Dank für die Beratung!',
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    unreadCount: 0,
  },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      senderId: '2',
      receiverId: '1',
      bookingId: '1',
      content: 'Hallo Klaus, ich freue mich auf unsere Beratungssitzung morgen!',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      read: true,
    },
    {
      id: '2',
      senderId: '1',
      receiverId: '2',
      bookingId: '1',
      content: 'Hallo Sabine, ich auch! Ich habe bereits einige Fragen vorbereitet.',
      createdAt: new Date(Date.now() - 158400000).toISOString(), // 1.8 days ago
      read: true,
    },
    {
      id: '3',
      senderId: '2',
      receiverId: '1',
      bookingId: '1',
      content: 'Perfekt! Wir werden alle Ihre Fragen durchgehen. Bis morgen!',
      createdAt: new Date(Date.now() - 144000000).toISOString(), // 1.6 days ago
      read: true,
    },
    {
      id: '4',
      senderId: '1',
      receiverId: '2',
      bookingId: '1',
      content: 'Vielen Dank für die Beratung!',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: true,
    },
  ],
};

interface ChatState {
  chatThreads: ChatThread[];
  isLoading: boolean;
  error: string | null;
  getMessages: (bookingId: string) => Message[];
  sendMessage: (bookingId: string, receiverId: string, content: string) => Promise<void>;
  markThreadAsRead: (threadId: string) => Promise<void>;
  subscribeToMessages: (bookingId: string) => () => void;
}

export const [ChatProvider, useChat] = createContextHook<ChatState>(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // Load chat threads (derived from user's bookings)
  const { isLoading, error, data: threadsData } = useQuery({
    queryKey: ['chatThreads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // For now, we'll use mock data since chat threads are derived from bookings
      // In a real implementation, this would fetch from the bookings and create threads
      const storedThreads = await AsyncStorage.getItem('chatThreads');
      return storedThreads ? JSON.parse(storedThreads) : mockChatThreads;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Handle chat threads data
  useEffect(() => {
    if (threadsData) {
      setChatThreads(threadsData);
    }
    if (error) {
      console.error('Failed to load chat threads:', error);
    }
  }, [threadsData, error]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ bookingId, receiverId, content }: { 
      bookingId: string; 
      receiverId: string; 
      content: string; 
    }) => {
      if (!user) throw new Error('User must be logged in to send messages');
      
      const { data, error } = await MessageService.sendMessage({
        bookingId,
        senderId: user.id,
        receiverId,
        content
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatThreads'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Mark messages as read
  const markMessagesAsRead = async (bookingId: string) => {
    const bookingMessages = messages[bookingId] || [];
    const unreadMessages = bookingMessages.filter(msg => 
      msg.receiverId === user?.id && !msg.read
    );
    
    // Mark each unread message as read
    for (const message of unreadMessages) {
      try {
        await MessageService.markMessageAsRead(message.id);
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
    
    // Update local state
    setMessages(prev => ({
      ...prev,
      [bookingId]: bookingMessages.map(msg => 
        msg.receiverId === user?.id ? { ...msg, read: true } : msg
      )
    }));
  };

  // Load messages for a specific booking
  const loadMessages = async (bookingId: string) => {
    try {
      const { data, error } = await MessageService.getMessages(bookingId);
      
      if (error) {
        console.error('Failed to load messages:', error);
        return;
      }
      
      setMessages(prev => ({
        ...prev,
        [bookingId]: data
      }));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };
  
  const getMessages = (bookingId: string) => {
    // Load messages if not already loaded
    if (!messages[bookingId]) {
      loadMessages(bookingId);
      return mockMessages[bookingId] || [];
    }
    
    return messages[bookingId] || [];
  };

  const sendMessage = async (bookingId: string, receiverId: string, content: string) => {
    await sendMessageMutation.mutateAsync({ bookingId, receiverId, content });
    
    // Optimistically update local messages
    const newMessage: Message = {
      id: `temp_${Date.now()}`,
      senderId: user?.id || '',
      receiverId,
      bookingId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    setMessages(prev => ({
      ...prev,
      [bookingId]: [...(prev[bookingId] || []), newMessage]
    }));
  };

  const markThreadAsRead = async (threadId: string) => {
    // For now, we'll use the booking ID as thread ID
    await markMessagesAsRead(threadId);
  };
  
  // Subscribe to real-time messages
  const subscribeToMessages = (bookingId: string) => {
    const subscription = MessageService.subscribeToMessages(bookingId, (newMessage) => {
      setMessages(prev => ({
        ...prev,
        [bookingId]: [...(prev[bookingId] || []), newMessage]
      }));
    });
    
    return subscription.unsubscribe;
  };

  return {
    chatThreads: chatThreads.filter(thread => 
      user?.id === thread.clientId || user?.id === thread.consultantId
    ),
    isLoading: isLoading || sendMessageMutation.isPending,
    error: error ? String(error) : null,
    getMessages,
    sendMessage,
    markThreadAsRead,
    subscribeToMessages,
  };
});