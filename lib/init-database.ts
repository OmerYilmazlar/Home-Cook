import { supabase, supabaseAdmin } from './supabase';

export async function initializeDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check if tables exist by trying to query them
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError) {
      console.error('ERROR Users table error:', usersError.message);
      
      if (usersError.message.includes('row-level security policy')) {
        console.log('\n=== RLS POLICY UPDATE REQUIRED ===');
        console.log('The signup is failing due to Row Level Security policies.');
        console.log('Please follow these steps:');
        console.log('1. Go to your Supabase dashboard: https://encrdntkazmlqwjqaiur.supabase.co');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Copy and paste the SQL from lib/update-rls-policies.sql');
        console.log('4. Run the SQL commands to update the RLS policies');
        console.log('5. Try signing up again');
        console.log('===================================\n');
        return false;
      }
      
      console.log('\n=== DATABASE SETUP REQUIRED ===');
      console.log('The database tables do not exist yet.');
      console.log('Please follow these steps:');
      console.log('1. Go to your Supabase dashboard: https://encrdntkazmlqwjqaiur.supabase.co');
      console.log('2. Navigate to the SQL Editor');
      console.log('3. Copy and paste the SQL schema from lib/database-schema.sql');
      console.log('4. Run the SQL commands to create the tables and insert sample data');
      console.log('5. Restart the app');
      console.log('================================\n');
      return false;
    }

    // Check if sample data exists
    const { data: existingUsers } = await supabase.from('users').select('id').limit(1);
    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Database connected successfully with sample data!');
      return true;
    } else {
      console.log('⚠️  Database connected but no sample data found.');
      console.log('Please run the SQL schema from lib/database-schema.sql to add sample data.');
      return true;
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

async function createTables() {
  try {
    console.log('Attempting to create database tables...');
    
    // Since automatic table creation might not work, we'll provide clear instructions
    console.log('\n=== MANUAL DATABASE SETUP REQUIRED ===');
    console.log('Please follow these steps to set up your database:');
    console.log('\n1. Go to your Supabase dashboard:');
    console.log('   https://encrdntkazmlqwjqaiur.supabase.co/project/encrdntkazmlqwjqaiur/sql/new');
    console.log('\n2. Copy and paste this SQL schema:');
    console.log('\n-- Enable UUID extension');
    console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('\n-- Users table');
    console.log('CREATE TABLE IF NOT EXISTS users (');
    console.log('  id TEXT PRIMARY KEY,');
    console.log('  name TEXT NOT NULL,');
    console.log('  email TEXT UNIQUE NOT NULL,');
    console.log('  phone TEXT,');
    console.log('  avatar TEXT,');
    console.log('  user_type TEXT NOT NULL CHECK (user_type IN (\'cook\', \'customer\')),');
    console.log('  latitude DECIMAL(10, 8),');
    console.log('  longitude DECIMAL(11, 8),');
    console.log('  address TEXT,');
    console.log('  bio TEXT,');
    console.log('  rating DECIMAL(3, 2),');
    console.log('  review_count INTEGER DEFAULT 0,');
    console.log('  cuisine_types TEXT[],');
    console.log('  available_for_pickup BOOLEAN DEFAULT false,');
    console.log('  favorites TEXT[] DEFAULT \'{}\',');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('\n-- Meals table');
    console.log('CREATE TABLE IF NOT EXISTS meals (');
    console.log('  id TEXT PRIMARY KEY,');
    console.log('  cook_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
    console.log('  name TEXT NOT NULL,');
    console.log('  description TEXT,');
    console.log('  price DECIMAL(10, 2) NOT NULL,');
    console.log('  cuisine_type TEXT NOT NULL,');
    console.log('  images TEXT[] DEFAULT \'{}\',');
    console.log('  ingredients TEXT[] DEFAULT \'{}\',');
    console.log('  allergens TEXT[] DEFAULT \'{}\',');
    console.log('  available_quantity INTEGER NOT NULL DEFAULT 0,');
    console.log('  pickup_times JSONB DEFAULT \'[]\',');
    console.log('  rating DECIMAL(3, 2),');
    console.log('  review_count INTEGER DEFAULT 0,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('\n-- Reservations table');
    console.log('CREATE TABLE IF NOT EXISTS reservations (');
    console.log('  id TEXT PRIMARY KEY,');
    console.log('  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
    console.log('  cook_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
    console.log('  meal_id TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,');
    console.log('  quantity INTEGER NOT NULL DEFAULT 1,');
    console.log('  total_price DECIMAL(10, 2) NOT NULL,');
    console.log('  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,');
    console.log('  status TEXT NOT NULL DEFAULT \'pending\' CHECK (status IN (\'pending\', \'confirmed\', \'ready\', \'completed\', \'cancelled\')),');
    console.log('  special_instructions TEXT,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('\n-- Messages table');
    console.log('CREATE TABLE IF NOT EXISTS messages (');
    console.log('  id TEXT PRIMARY KEY,');
    console.log('  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
    console.log('  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
    console.log('  content TEXT NOT NULL,');
    console.log('  message_type TEXT DEFAULT \'text\' CHECK (message_type IN (\'text\', \'image\', \'system\')),');
    console.log('  read BOOLEAN DEFAULT false,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('\n-- Reviews table');
    console.log('CREATE TABLE IF NOT EXISTS reviews (');
    console.log('  id TEXT PRIMARY KEY,');
    console.log('  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
    console.log('  reviewee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,');
    console.log('  meal_id TEXT REFERENCES meals(id) ON DELETE CASCADE,');
    console.log('  reservation_id TEXT REFERENCES reservations(id) ON DELETE CASCADE,');
    console.log('  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),');
    console.log('  comment TEXT,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('\n3. Click "RUN" to execute the SQL');
    console.log('4. Restart the app after the tables are created');
    console.log('\n========================================\n');
  } catch (error) {
    console.log('Database setup instructions provided above.');
  }
}