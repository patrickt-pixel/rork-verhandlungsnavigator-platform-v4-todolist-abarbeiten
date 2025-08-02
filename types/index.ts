export type UserRole = "client" | "consultant" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
}

export interface Consultant extends User {
  bio: string;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  availability?: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  consultantId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  clientId: string;
  consultantId: string;
  clientName: string;
  consultantName: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  consultantId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  bookingId: string;
  clientId: string;
  consultantId: string;
  clientName: string;
  consultantName: string;
  clientAvatar?: string;
  consultantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}