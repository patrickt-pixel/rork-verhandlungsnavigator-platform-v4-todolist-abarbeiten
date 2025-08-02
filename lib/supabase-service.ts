import { supabase, MOCK_MODE, testSupabaseConnection } from './supabase';
import { User, Consultant, Booking, Message, Review, TimeSlot } from '@/types';
import { Database } from '@/types/database';

// Mock data imports (fallback when Supabase is not configured)
import { mockUsers, mockConsultants, mockBookings, mockMessages } from '@/lib/mock-data';

// Remove circular dependency by not importing from stores
// Instead, services are pure and stores use services

type Tables = Database['public']['Tables'];
type ProfileRow = Tables['profiles']['Row'];
type ConsultantRow = Tables['consultants']['Row'];
type BookingRow = Tables['bookings']['Row'];
type MessageRow = Tables['messages']['Row'];
type ReviewRow = Tables['reviews']['Row'];
type TimeSlotRow = Tables['time_slots']['Row'];
type NotificationRow = Tables['notifications']['Row'];
type PaymentRow = Tables['payments']['Row'];
type UserSettingsRow = Tables['user_settings']['Row'];
type ConsultantScheduleRow = Tables['consultant_schedules']['Row'];

// Database initialization and setup
export const DatabaseService = {
  // Test connection and initialize database
  async initialize() {
    console.log('🚀 Initializing database connection...');
    
    if (MOCK_MODE) {
      console.log('⚠️ Running in MOCK MODE - Supabase not configured');
      return { success: false, error: 'Supabase not configured' };
    }
    
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.log('❌ Database connection failed:', connectionTest.error);
      return connectionTest;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test all tables exist
    const tablesTest = await this.testAllTables();
    
    if (!tablesTest.success) {
      console.log('⚠️ Some tables missing or inaccessible:', tablesTest.error);
      return tablesTest;
    }
    
    console.log('✅ All database tables accessible!');
    
    // Initialize storage buckets
    const storageInit = await FileStorageService.initializeBuckets();
    
    if (!storageInit.success) {
      console.log('⚠️ Storage bucket initialization failed:', storageInit.error);
      // Don't fail the entire initialization for storage issues
    } else {
      console.log('✅ Storage buckets initialized successfully');
    }
    
    // Seed initial data if needed
    await this.seedInitialData();
    
    return { success: true, message: 'Database initialized successfully' };
  },
  
  // Test all required tables
  async testAllTables() {
    const tables = ['profiles', 'consultants', 'time_slots', 'bookings', 'messages', 'reviews', 'notifications', 'payments', 'user_settings', 'consultant_schedules'];
    const results: { table: string; success: boolean; error?: string }[] = [];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        results.push({ 
          table, 
          success: !error, 
          error: error?.message 
        });
      } catch (err) {
        results.push({ 
          table, 
          success: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }
    
    const failedTables = results.filter(r => !r.success);
    
    if (failedTables.length > 0) {
      console.log('❌ Failed tables:', failedTables);
      return { 
        success: false, 
        error: `Tables not accessible: ${failedTables.map(t => t.table).join(', ')}`,
        details: failedTables
      };
    }
    
    console.log('✅ All tables accessible:', tables);
    return { success: true, tables: results };
  },
  
  // Seed initial data for development
  async seedInitialData() {
    try {
      console.log('🌱 Checking for initial data...');
      
      // Check if we already have data
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (existingProfiles && existingProfiles.length > 0) {
        console.log('📊 Database already has data, skipping seed');
        return { success: true, message: 'Data already exists' };
      }
      
      console.log('🌱 Seeding initial development data...');
      
      // This would typically be done through Supabase Auth
      // For now, we'll just log that seeding would happen here
      console.log('ℹ️ Initial data seeding would happen here in production');
      console.log('ℹ️ Use Supabase Auth to create users, then profiles will be auto-created');
      
      return { success: true, message: 'Seeding completed' };
    } catch (error) {
      console.log('❌ Seeding failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Seeding failed' 
      };
    }
  },
  
  // Get database statistics
  async getStats() {
    try {
      const stats = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('consultants').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact' }),
        supabase.from('reviews').select('id', { count: 'exact' }),
        supabase.from('notifications').select('id', { count: 'exact' }),
        supabase.from('payments').select('id', { count: 'exact' }),
        supabase.from('user_settings').select('id', { count: 'exact' }),
        supabase.from('consultant_schedules').select('id', { count: 'exact' })
      ]);
      
      return {
        profiles: stats[0].count || 0,
        consultants: stats[1].count || 0,
        bookings: stats[2].count || 0,
        messages: stats[3].count || 0,
        reviews: stats[4].count || 0,
        notifications: stats[5].count || 0,
        payments: stats[6].count || 0,
        user_settings: stats[7].count || 0,
        consultant_schedules: stats[8].count || 0
      };
    } catch (error) {
      console.log('❌ Failed to get stats:', error);
      return null;
    }
  }
};

// Auth Service
export class AuthService {
  static async signUp(email: string, password: string, userData: { name: string; role: 'client' | 'consultant' }) {
    if (MOCK_MODE) {
      console.log('Mock mode: Sign up', { email, userData });
      return { user: null, error: null };
    }

    try {
      console.log('🔐 Attempting Supabase sign up...', { email, role: userData.role });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.log('❌ Sign up error:', error.message);
        return { user: null, error };
      }

      if (data.user) {
        console.log('✅ Sign up successful:', data.user.id);
        
        // Wait a moment for the profile to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If user needs email confirmation, return user anyway
        if (!data.user.email_confirmed_at) {
          console.log('📧 Email confirmation required');
        }
      }

      return { user: data.user, error: null };
    } catch (err) {
      console.log('❌ Sign up exception:', err);
      return { user: null, error: { message: err instanceof Error ? err.message : 'Sign up failed' } };
    }
  }

  static async signIn(email: string, password: string) {
    if (MOCK_MODE) {
      console.log('Mock mode: Sign in', { email });
      const mockUser = mockUsers.find(u => u.email === email);
      return { user: mockUser, error: null };
    }

    try {
      console.log('🔐 Attempting Supabase sign in...', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('❌ Sign in error:', error.message);
        return { user: null, error };
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.id);
      }

      return { user: data.user, error: null };
    } catch (err) {
      console.log('❌ Sign in exception:', err);
      return { user: null, error: { message: err instanceof Error ? err.message : 'Sign in failed' } };
    }
  }

  static async signOut() {
    if (MOCK_MODE) {
      console.log('Mock mode: Sign out');
      return { error: null };
    }

    try {
      console.log('🔐 Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('❌ Sign out error:', error.message);
      } else {
        console.log('✅ Sign out successful');
      }
      
      return { error };
    } catch (err) {
      console.log('❌ Sign out exception:', err);
      return { error: { message: err instanceof Error ? err.message : 'Sign out failed' } };
    }
  }

  static async getCurrentUser() {
    if (MOCK_MODE) {
      return { user: null, error: null };
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('❌ Get current user error:', error.message);
        return { user: null, error };
      }
      
      if (user) {
        console.log('✅ Current user found:', user.id);
      } else {
        console.log('ℹ️ No current user session');
      }
      
      return { user, error: null };
    } catch (err) {
      console.log('❌ Get current user exception:', err);
      return { user: null, error: { message: err instanceof Error ? err.message : 'Failed to get current user' } };
    }
  }

  static onAuthStateChange(callback: (user: any) => void) {
    if (MOCK_MODE) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    console.log('🔐 Setting up auth state change listener...');
    
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.id || 'no user');
      callback(session?.user || null);
    });
  }
  
  // Additional auth utilities
  static async resetPassword(email: string) {
    if (MOCK_MODE) {
      console.log('Mock mode: Reset password', { email });
      return { error: null };
    }

    try {
      console.log('🔐 Sending password reset email...', { email });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.log('❌ Password reset error:', error.message);
      } else {
        console.log('✅ Password reset email sent');
      }
      
      return { error };
    } catch (err) {
      console.log('❌ Password reset exception:', err);
      return { error: { message: err instanceof Error ? err.message : 'Password reset failed' } };
    }
  }
  
  static async updatePassword(newPassword: string) {
    if (MOCK_MODE) {
      console.log('Mock mode: Update password');
      return { error: null };
    }

    try {
      console.log('🔐 Updating password...');
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        console.log('❌ Password update error:', error.message);
      } else {
        console.log('✅ Password updated successfully');
      }
      
      return { error };
    } catch (err) {
      console.log('❌ Password update exception:', err);
      return { error: { message: err instanceof Error ? err.message : 'Password update failed' } };
    }
  }
}

// Profile Service
export class ProfileService {
  static async getProfile(userId: string): Promise<{ data: User | null; error: any }> {
    if (MOCK_MODE) {
      const mockUser = mockUsers.find(u => u.id === userId);
      return { data: mockUser || null, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return { data: null, error };

    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar_url || undefined,
      phone: data.phone || undefined,
      bio: data.bio || undefined,
      createdAt: data.created_at
    };

    return { data: user, error: null };
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<{ data: User | null; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Update profile', { userId, updates });
      const mockUser = mockUsers.find(u => u.id === userId);
      if (mockUser) {
        const updatedUser = { ...mockUser, ...updates };
        return { data: updatedUser, error: null };
      }
      return { data: null, error: { message: 'User not found' } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        avatar_url: updates.avatar,
        phone: updates.phone,
        bio: updates.bio
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) return { data: null, error };

    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar_url || undefined,
      phone: data.phone || undefined,
      bio: data.bio || undefined,
      createdAt: data.created_at
    };

    return { data: user, error: null };
  }
}

// Consultant Service
export class ConsultantService {
  static async getConsultants(): Promise<{ data: Consultant[]; error: any }> {
    if (MOCK_MODE) {
      return { data: mockConsultants, error: null };
    }

    const { data, error } = await supabase
      .from('consultants')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          name,
          avatar_url,
          created_at
        )
      `);

    if (error) return { data: [], error };

    const consultants: Consultant[] = data.map((item: any) => ({
      id: item.profiles.id,
      email: item.profiles.email,
      name: item.profiles.name,
      role: 'consultant' as const,
      avatar: item.profiles.avatar_url || undefined,
      createdAt: item.profiles.created_at,
      bio: item.bio,
      expertise: item.expertise,
      hourlyRate: parseFloat(item.hourly_rate),
      rating: parseFloat(item.rating),
      reviewCount: item.review_count
    }));

    return { data: consultants, error: null };
  }

  static async getConsultant(consultantId: string): Promise<{ data: Consultant | null; error: any }> {
    if (MOCK_MODE) {
      const consultant = mockConsultants.find(c => c.id === consultantId);
      return { data: consultant || null, error: null };
    }

    const { data, error } = await supabase
      .from('consultants')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          name,
          avatar_url,
          created_at
        )
      `)
      .eq('profiles.id', consultantId)
      .single();

    if (error) return { data: null, error };

    const consultant: Consultant = {
      id: data.profiles.id,
      email: data.profiles.email,
      name: data.profiles.name,
      role: 'consultant' as const,
      avatar: data.profiles.avatar_url || undefined,
      createdAt: data.profiles.created_at,
      bio: data.bio,
      expertise: data.expertise,
      hourlyRate: parseFloat(data.hourly_rate),
      rating: parseFloat(data.rating),
      reviewCount: data.review_count
    };

    return { data: consultant, error: null };
  }

  static async createConsultantProfile(userId: string, consultantData: {
    bio: string;
    expertise: string[];
    hourlyRate: number;
  }): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Create consultant profile', { userId, consultantData });
      return { error: null };
    }

    const { error } = await supabase
      .from('consultants')
      .insert({
        user_id: userId,
        bio: consultantData.bio,
        expertise: consultantData.expertise,
        hourly_rate: consultantData.hourlyRate
      });

    return { error };
  }
}

// Booking Service
export class BookingService {
  static async getUserBookings(userId: string): Promise<{ data: Booking[]; error: any }> {
    if (MOCK_MODE) {
      const userBookings = mockBookings.filter(b => b.clientId === userId || b.consultantId === userId);
      return { data: userBookings, error: null };
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:client_id (name),
        consultant:consultant_id (
          profiles:user_id (name)
        ),
        time_slot:time_slot_id (start_time, end_time)
      `)
      .or(`client_id.eq.${userId},consultant_id.in.(select id from consultants where user_id = '${userId}')`)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };

    const bookings: Booking[] = data.map((item: any) => ({
      id: item.id,
      clientId: item.client_id,
      consultantId: item.consultant_id,
      clientName: item.client.name,
      consultantName: item.consultant.profiles.name,
      startTime: item.time_slot.start_time,
      endTime: item.time_slot.end_time,
      status: item.status,
      createdAt: item.created_at
    }));

    return { data: bookings, error: null };
  }

  static async createBooking(bookingData: {
    clientId: string;
    consultantId: string;
    timeSlotId: string;
    notes?: string;
  }): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Create booking', bookingData);
      return { data: { id: 'mock-booking-id' }, error: null };
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        client_id: bookingData.clientId,
        consultant_id: bookingData.consultantId,
        time_slot_id: bookingData.timeSlotId,
        notes: bookingData.notes
      })
      .select()
      .single();

    return { data, error };
  }

  static async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Update booking status', { bookingId, status });
      return { error: null };
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    return { error };
  }

  static async cancelBooking(bookingId: string): Promise<{ error: any }> {
    return this.updateBookingStatus(bookingId, 'cancelled');
  }

  static async rescheduleBooking(bookingId: string, newSlotId: string): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Reschedule booking', { bookingId, newSlotId });
      return { error: null };
    }

    const { error } = await supabase
      .from('bookings')
      .update({ time_slot_id: newSlotId })
      .eq('id', bookingId);

    return { error };
  }
}

// Message Service
export class MessageService {
  static async getMessages(bookingId: string): Promise<{ data: Message[]; error: any }> {
    if (MOCK_MODE) {
      const messages = mockMessages[bookingId] || [];
      return { data: messages, error: null };
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (error) return { data: [], error };

    const messages: Message[] = data.map((item: MessageRow) => ({
      id: item.id,
      senderId: item.sender_id,
      receiverId: item.receiver_id,
      bookingId: item.booking_id,
      content: item.content,
      createdAt: item.created_at,
      read: item.is_read
    }));

    return { data: messages, error: null };
  }

  static async sendMessage(messageData: {
    bookingId: string;
    senderId: string;
    receiverId: string;
    content: string;
  }): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Send message', messageData);
      return { data: { id: 'mock-message-id' }, error: null };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: messageData.bookingId,
        sender_id: messageData.senderId,
        receiver_id: messageData.receiverId,
        content: messageData.content
      })
      .select()
      .single();

    return { data, error };
  }

  static async markMessageAsRead(messageId: string): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Mark message as read', messageId);
      return { error: null };
    }

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    return { error };
  }

  static subscribeToMessages(bookingId: string, callback: (message: Message) => void) {
    if (MOCK_MODE) {
      console.log('Mock mode: Subscribe to messages', bookingId);
      return { unsubscribe: () => {} };
    }

    const subscription = supabase
      .channel(`messages:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const message: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            receiverId: payload.new.receiver_id,
            bookingId: payload.new.booking_id,
            content: payload.new.content,
            createdAt: payload.new.created_at,
            read: payload.new.is_read
          };
          callback(message);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
}

// Time Slot Service
export class TimeSlotService {
  static async getAvailableSlots(consultantId: string): Promise<{ data: TimeSlot[]; error: any }> {
    if (MOCK_MODE) {
      // Generate mock time slots for the next 7 days
      const slots: TimeSlot[] = [];
      const now = new Date();
      
      for (let i = 1; i <= 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        
        // Add morning slots (9 AM - 12 PM)
        for (let hour = 9; hour < 12; hour++) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(hour + 1);
          
          slots.push({
            id: `slot-${consultantId}-${i}-${hour}`,
            consultantId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked: Math.random() > 0.7 // 30% chance of being booked
          });
        }
        
        // Add afternoon slots (2 PM - 5 PM)
        for (let hour = 14; hour < 17; hour++) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(hour + 1);
          
          slots.push({
            id: `slot-${consultantId}-${i}-${hour}`,
            consultantId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isBooked: Math.random() > 0.7 // 30% chance of being booked
          });
        }
      }
      
      return { data: slots.filter(s => !s.isBooked), error: null };
    }

    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('is_booked', false)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) return { data: [], error };

    const timeSlots: TimeSlot[] = data.map((item: TimeSlotRow) => ({
      id: item.id,
      consultantId: item.consultant_id,
      startTime: item.start_time,
      endTime: item.end_time,
      isBooked: item.is_booked
    }));

    return { data: timeSlots, error: null };
  }

  static async createTimeSlot(slotData: {
    consultantId: string;
    startTime: string;
    endTime: string;
  }): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Create time slot', slotData);
      return { data: { id: 'mock-slot-id' }, error: null };
    }

    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        consultant_id: slotData.consultantId,
        start_time: slotData.startTime,
        end_time: slotData.endTime
      })
      .select()
      .single();

    return { data, error };
  }
}

// Notification Service
export class NotificationService {
  static async getUserNotifications(userId: string): Promise<{ data: any[]; error: any }> {
    if (MOCK_MODE) {
      const mockNotifications = [
        {
          id: '1',
          title: 'Booking Confirmed',
          message: 'Your appointment with Dr. Smith has been confirmed',
          type: 'booking',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'New Message',
          message: 'You have a new message from Dr. Johnson',
          type: 'message',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      return { data: mockNotifications, error: null };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error };
  }

  static async markNotificationAsRead(notificationId: string): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Mark notification as read', notificationId);
      return { error: null };
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return { error };
  }

  static async createNotification(notificationData: {
    userId: string;
    title: string;
    message: string;
    type: 'booking' | 'message' | 'system' | 'reminder';
    data?: any;
  }): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Create notification', notificationData);
      return { data: { id: 'mock-notification-id' }, error: null };
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        data: notificationData.data
      })
      .select()
      .single();

    return { data, error };
  }

  static subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    if (MOCK_MODE) {
      console.log('Mock mode: Subscribe to notifications', userId);
      return { unsubscribe: () => {} };
    }

    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type,
            isRead: payload.new.is_read,
            data: payload.new.data,
            createdAt: payload.new.created_at
          };
          callback(notification);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
}

// Payment Service
export class PaymentService {
  static async getPaymentsByUser(userId: string): Promise<{ data: any[]; error: any }> {
    if (MOCK_MODE) {
      const mockPayments = [
        {
          id: '1',
          bookingId: 'booking-1',
          amount: 150.00,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'card',
          createdAt: new Date().toISOString()
        }
      ];
      return { data: mockPayments, error: null };
    }

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:booking_id (
          id,
          time_slot:time_slot_id (start_time, end_time)
        )
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  }

  static async createPayment(paymentData: {
    bookingId: string;
    clientId: string;
    consultantId: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    stripePaymentIntentId?: string;
  }): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Create payment', paymentData);
      return { data: { id: 'mock-payment-id' }, error: null };
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: paymentData.bookingId,
        client_id: paymentData.clientId,
        consultant_id: paymentData.consultantId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        payment_method: paymentData.paymentMethod,
        stripe_payment_intent_id: paymentData.stripePaymentIntentId
      })
      .select()
      .single();

    return { data, error };
  }

  static async updatePaymentStatus(paymentId: string, status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Update payment status', { paymentId, status });
      return { error: null };
    }

    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);

    return { error };
  }
}

// User Settings Service
export class UserSettingsService {
  static async getUserSettings(userId: string): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      const mockSettings = {
        id: '1',
        userId,
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        theme: 'system',
        language: 'en',
        timezone: 'UTC'
      };
      return { data: mockSettings, error: null };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No settings found, create default settings
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({ user_id: userId })
        .select()
        .single();
      
      return { data: newSettings, error: createError };
    }

    return { data, error };
  }

  static async updateUserSettings(userId: string, settings: {
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  }): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Update user settings', { userId, settings });
      return { data: settings, error: null };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        notifications_enabled: settings.notificationsEnabled,
        email_notifications: settings.emailNotifications,
        push_notifications: settings.pushNotifications,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone
      })
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  }
}

// Consultant Schedule Service
export class ConsultantScheduleService {
  static async getConsultantSchedule(consultantId: string): Promise<{ data: any[]; error: any }> {
    if (MOCK_MODE) {
      const mockSchedule = [
        {
          id: '1',
          consultantId,
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true
        },
        {
          id: '2',
          consultantId,
          dayOfWeek: 2, // Tuesday
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true
        }
      ];
      return { data: mockSchedule, error: null };
    }

    const { data, error } = await supabase
      .from('consultant_schedules')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('day_of_week', { ascending: true });

    return { data: data || [], error };
  }

  static async updateConsultantSchedule(consultantId: string, schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[]): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Update consultant schedule', { consultantId, schedules });
      return { error: null };
    }

    // Delete existing schedules
    await supabase
      .from('consultant_schedules')
      .delete()
      .eq('consultant_id', consultantId);

    // Insert new schedules
    const { error } = await supabase
      .from('consultant_schedules')
      .insert(
        schedules.map(schedule => ({
          consultant_id: consultantId,
          day_of_week: schedule.dayOfWeek,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          is_available: schedule.isAvailable
        }))
      );

    return { error };
  }
}

// File Storage Service
export class FileStorageService {
  // Storage bucket names
  static readonly BUCKETS = {
    PROFILE_PICTURES: 'profile-pictures',
    DOCUMENTS: 'documents',
    CHAT_ATTACHMENTS: 'chat-attachments'
  } as const;

  // Initialize storage buckets (should be called once during app setup)
  static async initializeBuckets() {
    if (MOCK_MODE) {
      console.log('Mock mode: Initialize storage buckets');
      return { success: true, message: 'Mock buckets initialized' };
    }

    try {
      console.log('🗂️ Initializing storage buckets...');
      
      const buckets = Object.values(this.BUCKETS);
      const results = [];
      
      for (const bucketName of buckets) {
        // Check if bucket exists
        const { data: existingBuckets } = await supabase.storage.listBuckets();
        const bucketExists = existingBuckets?.some(b => b.name === bucketName);
        
        if (!bucketExists) {
          console.log(`Creating bucket: ${bucketName}`);
          const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: false, // Private by default
            allowedMimeTypes: this.getAllowedMimeTypes(bucketName),
            fileSizeLimit: this.getFileSizeLimit(bucketName)
          });
          
          if (error) {
            console.log(`❌ Failed to create bucket ${bucketName}:`, error.message);
            results.push({ bucket: bucketName, success: false, error: error.message });
          } else {
            console.log(`✅ Created bucket: ${bucketName}`);
            results.push({ bucket: bucketName, success: true });
          }
        } else {
          console.log(`✅ Bucket already exists: ${bucketName}`);
          results.push({ bucket: bucketName, success: true, message: 'Already exists' });
        }
      }
      
      const failedBuckets = results.filter(r => !r.success);
      
      if (failedBuckets.length > 0) {
        return {
          success: false,
          message: `Failed to initialize ${failedBuckets.length} buckets`,
          details: results
        };
      }
      
      console.log('✅ All storage buckets initialized successfully');
      return { success: true, message: 'All buckets initialized', details: results };
    } catch (error) {
      console.log('❌ Storage initialization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Storage initialization failed'
      };
    }
  }

  // Get allowed MIME types for each bucket
  private static getAllowedMimeTypes(bucketName: string): string[] {
    switch (bucketName) {
      case this.BUCKETS.PROFILE_PICTURES:
        return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      case this.BUCKETS.DOCUMENTS:
        return [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv'
        ];
      case this.BUCKETS.CHAT_ATTACHMENTS:
        return [
          'image/jpeg', 'image/png', 'image/webp', 'image/gif',
          'application/pdf',
          'text/plain',
          'audio/mpeg', 'audio/wav', 'audio/ogg',
          'video/mp4', 'video/webm'
        ];
      default:
        return ['*/*'];
    }
  }

  // Get file size limit for each bucket (in bytes)
  private static getFileSizeLimit(bucketName: string): number {
    switch (bucketName) {
      case this.BUCKETS.PROFILE_PICTURES:
        return 5 * 1024 * 1024; // 5MB
      case this.BUCKETS.DOCUMENTS:
        return 50 * 1024 * 1024; // 50MB
      case this.BUCKETS.CHAT_ATTACHMENTS:
        return 25 * 1024 * 1024; // 25MB
      default:
        return 10 * 1024 * 1024; // 10MB
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(userId: string, file: File | { uri: string; name: string; type: string }): Promise<{ data: { url: string; path: string } | null; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Upload profile picture', { userId, fileName: 'name' in file ? file.name : 'unknown' });
      return {
        data: {
          url: 'https://via.placeholder.com/150',
          path: `mock-profile-${userId}.jpg`
        },
        error: null
      };
    }

    try {
      console.log('📸 Uploading profile picture for user:', userId);
      
      // Generate unique filename
      const fileExt = this.getFileExtension(file);
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
      
      // Validate file
      const validation = this.validateFile(file, this.BUCKETS.PROFILE_PICTURES);
      if (!validation.valid) {
        return { data: null, error: { message: validation.error } };
      }
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKETS.PROFILE_PICTURES)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.log('❌ Profile picture upload failed:', error.message);
        return { data: null, error };
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKETS.PROFILE_PICTURES)
        .getPublicUrl(fileName);
      
      console.log('✅ Profile picture uploaded successfully');
      
      return {
        data: {
          url: urlData.publicUrl,
          path: fileName
        },
        error: null
      };
    } catch (err) {
      console.log('❌ Profile picture upload exception:', err);
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : 'Upload failed' }
      };
    }
  }

  // Upload document
  static async uploadDocument(userId: string, file: File | { uri: string; name: string; type: string }, metadata?: { title?: string; description?: string }): Promise<{ data: { url: string; path: string; metadata: any } | null; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Upload document', { userId, fileName: 'name' in file ? file.name : 'unknown', metadata });
      return {
        data: {
          url: 'https://via.placeholder.com/400x300/cccccc/666666?text=Document',
          path: `mock-document-${userId}-${Date.now()}.pdf`,
          metadata: metadata || {}
        },
        error: null
      };
    }

    try {
      console.log('📄 Uploading document for user:', userId);
      
      // Generate unique filename
      const originalName = 'name' in file ? file.name : 'document';
      const fileExt = this.getFileExtension(file);
      const fileName = `${userId}/documents/${Date.now()}-${this.sanitizeFileName(originalName)}.${fileExt}`;
      
      // Validate file
      const validation = this.validateFile(file, this.BUCKETS.DOCUMENTS);
      if (!validation.valid) {
        return { data: null, error: { message: validation.error } };
      }
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKETS.DOCUMENTS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            originalName,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            ...metadata
          }
        });
      
      if (error) {
        console.log('❌ Document upload failed:', error.message);
        return { data: null, error };
      }
      
      // Get public URL (for documents, we might want signed URLs for security)
      const { data: urlData } = supabase.storage
        .from(this.BUCKETS.DOCUMENTS)
        .getPublicUrl(fileName);
      
      console.log('✅ Document uploaded successfully');
      
      return {
        data: {
          url: urlData.publicUrl,
          path: fileName,
          metadata: {
            originalName,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            ...metadata
          }
        },
        error: null
      };
    } catch (err) {
      console.log('❌ Document upload exception:', err);
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : 'Upload failed' }
      };
    }
  }

  // Upload chat attachment
  static async uploadChatAttachment(bookingId: string, senderId: string, file: File | { uri: string; name: string; type: string }): Promise<{ data: { url: string; path: string; type: string; size: number } | null; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Upload chat attachment', { bookingId, senderId, fileName: 'name' in file ? file.name : 'unknown' });
      return {
        data: {
          url: 'https://via.placeholder.com/300x200/eeeeee/999999?text=Attachment',
          path: `mock-attachment-${bookingId}-${Date.now()}`,
          type: 'type' in file ? file.type : 'application/octet-stream',
          size: 1024
        },
        error: null
      };
    }

    try {
      console.log('📎 Uploading chat attachment for booking:', bookingId);
      
      // Generate unique filename
      const originalName = 'name' in file ? file.name : 'attachment';
      const fileExt = this.getFileExtension(file);
      const fileName = `${bookingId}/attachments/${Date.now()}-${this.sanitizeFileName(originalName)}.${fileExt}`;
      
      // Validate file
      const validation = this.validateFile(file, this.BUCKETS.CHAT_ATTACHMENTS);
      if (!validation.valid) {
        return { data: null, error: { message: validation.error } };
      }
      
      // Get file size
      const fileSize = this.getFileSize(file);
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKETS.CHAT_ATTACHMENTS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            originalName,
            bookingId,
            senderId,
            uploadedAt: new Date().toISOString()
          }
        });
      
      if (error) {
        console.log('❌ Chat attachment upload failed:', error.message);
        return { data: null, error };
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKETS.CHAT_ATTACHMENTS)
        .getPublicUrl(fileName);
      
      console.log('✅ Chat attachment uploaded successfully');
      
      return {
        data: {
          url: urlData.publicUrl,
          path: fileName,
          type: 'type' in file ? file.type : 'application/octet-stream',
          size: fileSize
        },
        error: null
      };
    } catch (err) {
      console.log('❌ Chat attachment upload exception:', err);
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : 'Upload failed' }
      };
    }
  }

  // Get signed URL for private files (more secure for documents)
  static async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<{ data: { signedUrl: string } | null; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Get signed URL', { bucket, path, expiresIn });
      return {
        data: { signedUrl: `https://mock-signed-url.com/${path}?expires=${Date.now() + expiresIn * 1000}` },
        error: null
      };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      
      if (error) {
        console.log('❌ Failed to create signed URL:', error.message);
        return { data: null, error };
      }
      
      return { data: { signedUrl: data.signedUrl }, error: null };
    } catch (err) {
      console.log('❌ Signed URL exception:', err);
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : 'Failed to create signed URL' }
      };
    }
  }

  // Delete file
  static async deleteFile(bucket: string, path: string): Promise<{ error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: Delete file', { bucket, path });
      return { error: null };
    }

    try {
      console.log(`🗑️ Deleting file: ${bucket}/${path}`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) {
        console.log('❌ File deletion failed:', error.message);
        return { error };
      }
      
      console.log('✅ File deleted successfully');
      return { error: null };
    } catch (err) {
      console.log('❌ File deletion exception:', err);
      return { error: { message: err instanceof Error ? err.message : 'Deletion failed' } };
    }
  }

  // List user files
  static async listUserFiles(userId: string, bucket: string, folder?: string): Promise<{ data: any[]; error: any }> {
    if (MOCK_MODE) {
      console.log('Mock mode: List user files', { userId, bucket, folder });
      return {
        data: [
          {
            name: 'mock-file-1.jpg',
            id: 'mock-id-1',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            metadata: { size: 1024 }
          }
        ],
        error: null
      };
    }

    try {
      const path = folder ? `${userId}/${folder}` : userId;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) {
        console.log('❌ Failed to list files:', error.message);
        return { data: [], error };
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.log('❌ List files exception:', err);
      return {
        data: [],
        error: { message: err instanceof Error ? err.message : 'Failed to list files' }
      };
    }
  }

  // Utility functions
  private static getFileExtension(file: File | { uri: string; name: string; type: string }): string {
    if ('name' in file && file.name) {
      const parts = file.name.split('.');
      return parts.length > 1 ? parts.pop()!.toLowerCase() : 'bin';
    }
    
    if ('type' in file && file.type) {
      const mimeToExt: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'application/pdf': 'pdf',
        'text/plain': 'txt',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'video/mp4': 'mp4'
      };
      return mimeToExt[file.type] || 'bin';
    }
    
    return 'bin';
  }

  private static getFileSize(file: File | { uri: string; name: string; type: string }): number {
    if (file instanceof File) {
      return file.size;
    }
    // For React Native file objects, size might not be available
    // Return 0 as placeholder - actual size will be determined by storage service
    return 0;
  }

  private static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  private static validateFile(file: File | { uri: string; name: string; type: string }, bucket: string): { valid: boolean; error?: string } {
    const allowedTypes = this.getAllowedMimeTypes(bucket);
    const maxSize = this.getFileSizeLimit(bucket);
    
    // Check MIME type
    const fileType = 'type' in file ? file.type : 'application/octet-stream';
    if (!allowedTypes.includes('*/*') && !allowedTypes.includes(fileType)) {
      return {
        valid: false,
        error: `File type ${fileType} is not allowed for this upload. Allowed types: ${allowedTypes.join(', ')}`
      };
    }
    
    // Check file size (only for File objects)
    if (file instanceof File && file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `File size exceeds the maximum limit of ${maxSizeMB}MB`
      };
    }
    
    return { valid: true };
  }

  // Get storage usage statistics
  static async getStorageStats(userId: string): Promise<{ data: any; error: any }> {
    if (MOCK_MODE) {
      return {
        data: {
          profilePictures: { count: 1, totalSize: 1024 * 500 },
          documents: { count: 3, totalSize: 1024 * 1024 * 15 },
          chatAttachments: { count: 8, totalSize: 1024 * 1024 * 5 },
          totalSize: 1024 * 1024 * 20.5
        },
        error: null
      };
    }

    try {
      const stats = {
        profilePictures: { count: 0, totalSize: 0 },
        documents: { count: 0, totalSize: 0 },
        chatAttachments: { count: 0, totalSize: 0 },
        totalSize: 0
      };

      // Get stats for each bucket
      for (const [key, bucket] of Object.entries(this.BUCKETS)) {
        const { data: files } = await this.listUserFiles(userId, bucket);
        if (files) {
          const count = files.length;
          const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
          
          const statKey = key.toLowerCase().replace('_', '') as keyof typeof stats;
          if (statKey !== 'totalSize') {
            (stats as any)[statKey] = { count, totalSize };
            stats.totalSize += totalSize;
          }
        }
      }

      return { data: stats, error: null };
    } catch (err) {
      console.log('❌ Storage stats exception:', err);
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : 'Failed to get storage stats' }
      };
    }
  }
}

// Real-time Service for live updates
export class RealtimeService {
  static subscribeToBookingUpdates(userId: string, callback: (booking: any) => void) {
    if (MOCK_MODE) {
      console.log('Mock mode: Subscribe to booking updates', userId);
      return { unsubscribe: () => {} };
    }

    const subscription = supabase
      .channel(`booking_updates:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `client_id=eq.${userId}`
        },
        (payload) => {
          console.log('Booking update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }

  static subscribeToAvailabilityUpdates(consultantId: string, callback: (update: any) => void) {
    if (MOCK_MODE) {
      console.log('Mock mode: Subscribe to availability updates', consultantId);
      return { unsubscribe: () => {} };
    }

    const subscription = supabase
      .channel(`availability:${consultantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_slots',
          filter: `consultant_id=eq.${consultantId}`
        },
        (payload) => {
          console.log('Availability update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }

  static subscribeToConsultantScheduleUpdates(consultantId: string, callback: (update: any) => void) {
    if (MOCK_MODE) {
      console.log('Mock mode: Subscribe to schedule updates', consultantId);
      return { unsubscribe: () => {} };
    }

    const subscription = supabase
      .channel(`schedule:${consultantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultant_schedules',
          filter: `consultant_id=eq.${consultantId}`
        },
        (payload) => {
          console.log('Schedule update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
}