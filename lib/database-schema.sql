-- Database schema for the food delivery app
-- Run these SQL commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('cook', 'customer')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  bio TEXT,
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  cuisine_types TEXT[],
  available_for_pickup BOOLEAN DEFAULT false,
  favorites TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  cook_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cuisine_type TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  ingredients TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  available_quantity INTEGER NOT NULL DEFAULT 0,
  pickup_times JSONB DEFAULT '[]',
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cook_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_id TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_id TEXT REFERENCES meals(id) ON DELETE CASCADE,
  reservation_id TEXT REFERENCES reservations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_meals_cook_id ON meals(cook_id);
CREATE INDEX IF NOT EXISTS idx_meals_cuisine_type ON meals(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_cook_id ON reservations(cook_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - you may want to customize these)
-- Users can read all users but only update their own
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Meals are publicly readable, but only cooks can manage their own meals
CREATE POLICY "Anyone can view meals" ON meals FOR SELECT USING (true);
CREATE POLICY "Cooks can manage own meals" ON meals FOR ALL USING (auth.uid()::text = cook_id);

-- Reservations are visible to involved parties
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (
  auth.uid()::text = customer_id OR auth.uid()::text = cook_id
);
CREATE POLICY "Customers can create reservations" ON reservations FOR INSERT WITH CHECK (
  auth.uid()::text = customer_id
);
CREATE POLICY "Involved parties can update reservations" ON reservations FOR UPDATE USING (
  auth.uid()::text = customer_id OR auth.uid()::text = cook_id
);

-- Messages are visible to sender and receiver
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid()::text = sender_id
);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (
  auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
);

-- Reviews are publicly readable, but only reviewers can manage their own
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.uid()::text = reviewer_id
);
CREATE POLICY "Reviewers can update own reviews" ON reviews FOR UPDATE USING (
  auth.uid()::text = reviewer_id
);