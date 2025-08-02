import { User, UserRole, Consultant, Booking, Message } from '@/types';

// Mock data for demonstration (used when Supabase is not configured)
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'client@example.com',
    name: 'Klaus Mueller',
    role: 'client' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'consultant@example.com',
    name: 'Sabine Weber',
    role: 'consultant' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Experienced negotiation coach with 10+ years in corporate consulting.',
    createdAt: new Date().toISOString(),
  },
];

export const mockConsultants: Consultant[] = [
  {
    id: '2',
    email: 'consultant@example.com',
    name: 'Sabine Weber',
    role: 'consultant',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Experienced negotiation coach with 10+ years in corporate consulting.',
    expertise: ['Sales Negotiation', 'Conflict Resolution', 'Leadership'],
    hourlyRate: 120,
    rating: 4.8,
    reviewCount: 24,
    createdAt: new Date().toISOString(),
  },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    clientId: '1',
    consultantId: '2',
    clientName: 'Klaus Mueller',
    consultantName: 'Sabine Weber',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

export const mockMessages: { [bookingId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      senderId: '1',
      receiverId: '2',
      bookingId: '1',
      content: 'Hello, I would like to discuss my upcoming consultation.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: '2',
      senderId: '2',
      receiverId: '1',
      bookingId: '1',
      content: 'Of course, I\'m available to discuss any time.',
      createdAt: new Date(Date.now() - 3300000).toISOString(),
      read: true,
    },
  ],
};
