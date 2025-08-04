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

-- Insert sample data first (before enabling RLS)
INSERT INTO users (id, name, email, phone, avatar, user_type, latitude, longitude, address, bio, rating, review_count, cuisine_types, available_for_pickup, favorites) VALUES
('cook-1', 'Maria Rodriguez', 'maria@example.com', '+1-555-0123', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'cook', 51.6127, -0.0623, 'Edmonton, London N9 0AS, UK', 'Authentic Mexican cuisine made with love and traditional recipes passed down through generations.', 4.8, 127, ARRAY['Mexican', 'Latin American'], true, ARRAY[]::TEXT[]),
('cook-2', 'Giuseppe Rossi', 'giuseppe@example.com', '+1-555-0125', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'cook', 51.5074, -0.1278, 'Central London, UK', 'Traditional Italian recipes from my nonna''s kitchen. Fresh pasta made daily with authentic ingredients.', 4.9, 89, ARRAY['Italian', 'Mediterranean'], true, ARRAY[]::TEXT[]),
('cook-3', 'Priya Sharma', 'priya@example.com', '+1-555-0126', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'cook', 51.5155, -0.0922, 'East London, UK', 'Authentic Indian cuisine with aromatic spices and traditional cooking methods passed down through generations.', 4.7, 156, ARRAY['Indian', 'South Asian'], true, ARRAY[]::TEXT[]),
('customer-1', 'John Smith', 'john@example.com', '+1-555-0124', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'customer', NULL, NULL, NULL, 'Food enthusiast who loves discovering authentic homemade dishes from local cooks.', NULL, NULL, NULL, NULL, ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO meals (id, cook_id, name, description, price, cuisine_type, images, ingredients, allergens, available_quantity, pickup_times, rating, review_count) VALUES
('meal-1', 'cook-1', 'Authentic Chicken Tacos al Pastor', 'Traditional Mexican tacos with marinated chicken, pineapple, onions, and cilantro. Served with homemade salsa verde and corn tortillas.', 12.99, 'Mexican', ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'], ARRAY['Chicken breast', 'Corn tortillas', 'Pineapple', 'White onion', 'Cilantro', 'Lime', 'Achiote paste', 'Garlic', 'Cumin', 'Oregano'], ARRAY['Gluten (tortillas)'], 10, '[{"from": "2025-01-06T14:00:00.000Z", "to": "2025-01-06T16:00:00.000Z"}]'::jsonb, 4.8, 23),
('meal-2', 'cook-2', 'Homemade Fettuccine Alfredo', 'Fresh pasta made from scratch with creamy parmesan sauce, garlic, and herbs. A classic Italian comfort dish.', 15.50, 'Italian', ARRAY['https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop'], ARRAY['Fresh fettuccine', 'Parmesan cheese', 'Heavy cream', 'Butter', 'Garlic', 'Black pepper', 'Parsley'], ARRAY['Gluten', 'Dairy'], 8, '[{"from": "2025-01-06T15:00:00.000Z", "to": "2025-01-06T17:00:00.000Z"}]'::jsonb, 4.9, 31),
('meal-3', 'cook-3', 'Butter Chicken with Basmati Rice', 'Tender chicken in a rich, creamy tomato-based sauce with aromatic spices. Served with fluffy basmati rice and naan bread.', 14.75, 'Indian', ARRAY['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'], ARRAY['Chicken breast', 'Tomatoes', 'Heavy cream', 'Onions', 'Ginger', 'Garlic', 'Garam masala', 'Turmeric', 'Basmati rice', 'Naan bread'], ARRAY['Dairy', 'Gluten (naan)'], 12, '[{"from": "2025-01-06T13:00:00.000Z", "to": "2025-01-06T15:00:00.000Z"}]'::jsonb, 4.7, 45)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) after inserting sample data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Meals policies
CREATE POLICY "Anyone can view meals" ON meals FOR SELECT USING (true);
CREATE POLICY "Cooks can manage own meals" ON meals FOR ALL USING (auth.uid()::text = cook_id);

-- Reservations policies
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (
  auth.uid()::text = customer_id OR auth.uid()::text = cook_id
);
CREATE POLICY "Customers can create reservations" ON reservations FOR INSERT WITH CHECK (
  auth.uid()::text = customer_id
);
CREATE POLICY "Involved parties can update reservations" ON reservations FOR UPDATE USING (
  auth.uid()::text = customer_id OR auth.uid()::text = cook_id
);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid()::text = sender_id
);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (
  auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.uid()::text = reviewer_id
);
CREATE POLICY "Reviewers can update own reviews" ON reviews FOR UPDATE USING (
  auth.uid()::text = reviewer_id
);