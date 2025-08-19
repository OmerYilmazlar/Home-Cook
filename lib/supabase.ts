import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://encrdntkazmlqwjqaiur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuY3JkbnRrYXptbHF3anFhaXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjg5NzUsImV4cCI6MjA2OTY0NDk3NX0.-sKU90ZM9sVfl7S0dPrc3Vwld2i4q4y6nzHy8Afc-14';

// Configure auth settings
const authConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web'
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, authConfig);

// Admin client for data seeding (in production, use service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          avatar: string | null;
          user_type: 'cook' | 'customer';
          latitude: number | null;
          longitude: number | null;
          address: string | null;
          bio: string | null;
          rating: number | null;
          review_count: number | null;
          cuisine_types: string[] | null;
          available_for_pickup: boolean | null;
          favorites: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          avatar?: string | null;
          user_type: 'cook' | 'customer';
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          bio?: string | null;
          rating?: number | null;
          review_count?: number | null;
          cuisine_types?: string[] | null;
          available_for_pickup?: boolean | null;
          favorites?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          avatar?: string | null;
          user_type?: 'cook' | 'customer';
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          bio?: string | null;
          rating?: number | null;
          review_count?: number | null;
          cuisine_types?: string[] | null;
          available_for_pickup?: boolean | null;
          favorites?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          cook_id: string;
          name: string;
          description: string;
          price: number;
          cuisine_type: string;
          images: string[];
          ingredients: string[] | null;
          allergens: string[] | null;
          available_quantity: number;
          pickup_times: {
            from: string;
            to: string;
          }[];
          rating: number | null;
          review_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cook_id: string;
          name: string;
          description: string;
          price: number;
          cuisine_type: string;
          images: string[];
          ingredients?: string[] | null;
          allergens?: string[] | null;
          available_quantity: number;
          pickup_times: {
            from: string;
            to: string;
          }[];
          rating?: number | null;
          review_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cook_id?: string;
          name?: string;
          description?: string;
          price?: number;
          cuisine_type?: string;
          images?: string[];
          ingredients?: string[] | null;
          allergens?: string[] | null;
          available_quantity?: number;
          pickup_times?: {
            from: string;
            to: string;
          }[];
          rating?: number | null;
          review_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          meal_id: string;
          customer_id: string;
          cook_id: string;
          status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
          quantity: number;
          total_price: number;
          pickup_time: string;
          payment_confirmed: boolean | null;
          payment_id: string | null;
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed' | null;
          meal_rating: number | null;
          cook_rating: number | null;
          review_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meal_id: string;
          customer_id: string;
          cook_id: string;
          status?: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
          quantity: number;
          total_price: number;
          pickup_time: string;
          payment_confirmed?: boolean | null;
          payment_id?: string | null;
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed' | null;
          meal_rating?: number | null;
          cook_rating?: number | null;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          meal_id?: string;
          customer_id?: string;
          cook_id?: string;
          status?: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
          quantity?: number;
          total_price?: number;
          pickup_time?: string;
          payment_confirmed?: boolean | null;
          payment_id?: string | null;
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed' | null;
          meal_rating?: number | null;
          cook_rating?: number | null;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
};