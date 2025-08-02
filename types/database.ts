export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'client' | 'consultant' | 'admin'
          avatar_url: string | null
          phone: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'client' | 'consultant' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'client' | 'consultant' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          updated_at?: string
        }
      }
      consultants: {
        Row: {
          id: string
          user_id: string
          bio: string
          expertise: string[]
          hourly_rate: number
          rating: number
          review_count: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio: string
          expertise: string[]
          hourly_rate: number
          rating?: number
          review_count?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          bio?: string
          expertise?: string[]
          hourly_rate?: number
          rating?: number
          review_count?: number
          is_available?: boolean
          updated_at?: string
        }
      }
      time_slots: {
        Row: {
          id: string
          consultant_id: string
          start_time: string
          end_time: string
          is_booked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          start_time: string
          end_time: string
          is_booked?: boolean
          created_at?: string
        }
        Update: {
          start_time?: string
          end_time?: string
          is_booked?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          consultant_id: string
          time_slot_id: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          consultant_id: string
          time_slot_id: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          booking_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          content?: string
          is_read?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          client_id: string
          consultant_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          client_id: string
          consultant_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          rating?: number
          comment?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'booking' | 'message' | 'system' | 'reminder'
          is_read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'booking' | 'message' | 'system' | 'reminder'
          is_read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          client_id: string
          consultant_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          client_id: string
          consultant_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean
          email_notifications: boolean
          push_notifications: boolean
          theme: 'light' | 'dark' | 'system'
          language: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          theme?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          notifications_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          theme?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          updated_at?: string
        }
      }
      consultant_schedules: {
        Row: {
          id: string
          consultant_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consultant_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          start_time?: string
          end_time?: string
          is_available?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'client' | 'consultant' | 'admin'
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
      notification_type: 'booking' | 'message' | 'system' | 'reminder'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
      theme_preference: 'light' | 'dark' | 'system'
    }
  }
}