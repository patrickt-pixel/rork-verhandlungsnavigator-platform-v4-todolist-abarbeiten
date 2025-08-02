import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, TimeSlot } from '@/types';
import { useAuth } from './auth-store';
import { BookingService, TimeSlotService } from '@/lib/supabase-service';

// Mock data for demonstration (used when Supabase is not configured)
export const mockTimeSlots: TimeSlot[] = [
  {
    id: '1',
    consultantId: '2',
    startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // tomorrow + 1 hour
    isBooked: false,
  },
  {
    id: '2',
    consultantId: '2',
    startTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
    endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(), // day after tomorrow + 1 hour
    isBooked: false,
  },
  {
    id: '3',
    consultantId: '3',
    startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // tomorrow + 1 hour
    isBooked: false,
  },
  {
    id: '4',
    consultantId: '4',
    startTime: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    endTime: new Date(Date.now() + 259200000 + 3600000).toISOString(), // 3 days from now + 1 hour
    isBooked: false,
  },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    clientId: '1',
    consultantId: '2',
    clientName: 'Klaus Mueller',
    consultantName: 'Sabine Weber',
    startTime: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    endTime: new Date(Date.now() - 604800000 + 3600000).toISOString(), // 1 week ago + 1 hour
    status: 'completed',
    createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
  },
];

interface BookingState {
  bookings: Booking[];
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  createBooking: (slotId: string, consultantId: string, consultantName: string, notes?: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  rescheduleBooking: (bookingId: string, newSlotId: string) => Promise<void>;
  getConsultantTimeSlots: (consultantId: string) => TimeSlot[];
  getUserBookings: () => Booking[];
  loadConsultantTimeSlots: (consultantId: string) => Promise<void>;
}

export const [BookingProvider, useBookings] = createContextHook<BookingState>(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Load bookings
  const { data: bookingsData, isLoading: isLoadingBookings, error: bookingsError } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await BookingService.getUserBookings(user.id);
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch bookings');
      }
      
      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Handle bookings data
  useEffect(() => {
    if (bookingsData) {
      setBookings(bookingsData);
    }
    if (bookingsError) {
      console.error('Failed to load bookings:', bookingsError);
    }
  }, [bookingsData, bookingsError]);
  

  // Load time slots (we'll load them per consultant as needed)
  const [consultantTimeSlots, setConsultantTimeSlots] = useState<Record<string, TimeSlot[]>>({});
  
  // Function to load time slots for a specific consultant
  const loadConsultantTimeSlots = async (consultantId: string) => {
    try {
      const { data, error } = await TimeSlotService.getAvailableSlots(consultantId);
      
      if (error) {
        console.error('Failed to load time slots:', error);
        return;
      }
      
      setConsultantTimeSlots(prev => ({
        ...prev,
        [consultantId]: data
      }));
    } catch (err) {
      console.error('Failed to load time slots:', err);
    }
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: {
      consultantId: string;
      timeSlotId: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User must be logged in to book');
      
      const { data, error } = await BookingService.createBooking({
        clientId: user.id,
        consultantId: bookingData.consultantId,
        timeSlotId: bookingData.timeSlotId,
        notes: bookingData.notes
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create booking');
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Also invalidate time slots for the consultant
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
    },
  });

  const createBooking = async (slotId: string, consultantId: string, consultantName: string, notes?: string) => {
    if (!user) throw new Error('User must be logged in to book');
    
    // Check if slot is available in local state
    const consultantSlots = consultantTimeSlots[consultantId] || [];
    const slot = consultantSlots.find(s => s.id === slotId);
    if (slot && slot.isBooked) {
      throw new Error('This time slot is already booked');
    }
    
    await createBookingMutation.mutateAsync({
      consultantId,
      timeSlotId: slotId,
      notes
    });
    
    // Refresh consultant time slots
    await loadConsultantTimeSlots(consultantId);
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await BookingService.cancelBooking(bookingId);
      
      if (error) {
        throw new Error(error.message || 'Failed to cancel booking');
      }
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };

  const rescheduleBooking = async (bookingId: string, newSlotId: string) => {
    try {
      const { error } = await BookingService.rescheduleBooking(bookingId, newSlotId);
      
      if (error) {
        throw new Error(error.message || 'Failed to reschedule booking');
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
    } catch (error) {
      console.error('Failed to reschedule booking:', error);
      throw error;
    }
  };

  const getConsultantTimeSlots = (consultantId: string) => {
    // Load time slots if not already loaded
    if (!consultantTimeSlots[consultantId]) {
      loadConsultantTimeSlots(consultantId);
      return [];
    }
    
    return consultantTimeSlots[consultantId].filter(slot => !slot.isBooked);
  };

  const getUserBookings = () => {
    if (!user) return [];
    
    if (user.role === 'client') {
      return bookings.filter(booking => booking.clientId === user.id);
    } else if (user.role === 'consultant') {
      return bookings.filter(booking => booking.consultantId === user.id);
    }
    
    return [];
  };

  return {
    bookings,
    timeSlots: Object.values(consultantTimeSlots).flat(),
    isLoading: isLoadingBookings || createBookingMutation.isPending,
    error: bookingsError ? String(bookingsError) : null,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    getConsultantTimeSlots,
    getUserBookings,
    loadConsultantTimeSlots,
  };
});