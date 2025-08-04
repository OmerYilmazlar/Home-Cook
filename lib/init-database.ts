import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    console.log('Initializing database with sample data...');
    
    // Try to create tables first
    await createTables();
    
    // Check if tables exist by trying to query them
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError) {
      console.error('ERROR Users table error:', usersError.message);
      console.log('\n=== DATABASE SETUP REQUIRED ===');
      console.log('The database tables do not exist yet.');
      console.log('Please follow these steps:');
      console.log('1. Go to your Supabase dashboard: https://encrdntkazmlqwjqaiur.supabase.co');
      console.log('2. Navigate to the SQL Editor');
      console.log('3. Copy and paste the SQL schema from lib/database-schema.sql');
      console.log('4. Run the SQL commands to create the tables');
      console.log('5. Restart the app');
      console.log('================================\n');
      return false;
    }

    // Check if sample data already exists
    const { data: existingUsers } = await supabase.from('users').select('id').limit(1);
    if (existingUsers && existingUsers.length > 0) {
      console.log('Sample data already exists, skipping initialization.');
      return true;
    }

    // Insert sample users
    const sampleUsers = [
      {
        id: 'cook-1',
        name: 'Maria Rodriguez',
        email: 'maria@example.com',
        phone: '+1-555-0123',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        user_type: 'cook',
        latitude: 51.6127,
        longitude: -0.0623,
        address: 'Edmonton, London N9 0AS, UK',
        bio: 'Authentic Mexican cuisine made with love and traditional recipes passed down through generations.',
        rating: 4.8,
        review_count: 127,
        cuisine_types: ['Mexican', 'Latin American'],
        available_for_pickup: true,
        favorites: []
      },
      {
        id: 'cook-2',
        name: 'Giuseppe Rossi',
        email: 'giuseppe@example.com',
        phone: '+1-555-0125',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        user_type: 'cook',
        latitude: 51.5074,
        longitude: -0.1278,
        address: 'Central London, UK',
        bio: 'Traditional Italian recipes from my nonna\'s kitchen. Fresh pasta made daily with authentic ingredients.',
        rating: 4.9,
        review_count: 89,
        cuisine_types: ['Italian', 'Mediterranean'],
        available_for_pickup: true,
        favorites: []
      },
      {
        id: 'cook-3',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+1-555-0126',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        user_type: 'cook',
        latitude: 51.5155,
        longitude: -0.0922,
        address: 'East London, UK',
        bio: 'Authentic Indian cuisine with aromatic spices and traditional cooking methods passed down through generations.',
        rating: 4.7,
        review_count: 156,
        cuisine_types: ['Indian', 'South Asian'],
        available_for_pickup: true,
        favorites: []
      },
      {
        id: 'customer-1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-0124',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        user_type: 'customer',
        latitude: null,
        longitude: null,
        address: null,
        bio: 'Food enthusiast who loves discovering authentic homemade dishes from local cooks.',
        rating: null,
        review_count: null,
        cuisine_types: null,
        available_for_pickup: null,
        favorites: []
      }
    ];

    const { error: insertUsersError } = await supabase
      .from('users')
      .upsert(sampleUsers, { onConflict: 'id' });

    if (insertUsersError) {
      console.error('Error inserting sample users:', insertUsersError);
    } else {
      console.log('Sample users inserted successfully');
    }

    // Insert sample meals
    const sampleMeals = [
      {
        id: 'meal-1',
        cook_id: 'cook-1',
        name: 'Authentic Chicken Tacos al Pastor',
        description: 'Traditional Mexican tacos with marinated chicken, pineapple, onions, and cilantro. Served with homemade salsa verde and corn tortillas.',
        price: 12.99,
        cuisine_type: 'Mexican',
        images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'],
        ingredients: ['Chicken breast', 'Corn tortillas', 'Pineapple', 'White onion', 'Cilantro', 'Lime', 'Achiote paste', 'Garlic', 'Cumin', 'Oregano'],
        allergens: ['Gluten (tortillas)'],
        available_quantity: 10,
        pickup_times: [
          {
            from: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            to: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
          }
        ],
        rating: 4.8,
        review_count: 23,
        created_at: new Date().toISOString()
      },
      {
        id: 'meal-2',
        cook_id: 'cook-2',
        name: 'Homemade Fettuccine Alfredo',
        description: 'Fresh pasta made from scratch with creamy parmesan sauce, garlic, and herbs. A classic Italian comfort dish.',
        price: 15.50,
        cuisine_type: 'Italian',
        images: ['https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop'],
        ingredients: ['Fresh fettuccine', 'Parmesan cheese', 'Heavy cream', 'Butter', 'Garlic', 'Black pepper', 'Parsley'],
        allergens: ['Gluten', 'Dairy'],
        available_quantity: 8,
        pickup_times: [
          {
            from: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            to: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
          }
        ],
        rating: 4.9,
        review_count: 31,
        created_at: new Date().toISOString()
      },
      {
        id: 'meal-3',
        cook_id: 'cook-3',
        name: 'Butter Chicken with Basmati Rice',
        description: 'Tender chicken in a rich, creamy tomato-based sauce with aromatic spices. Served with fluffy basmati rice and naan bread.',
        price: 14.75,
        cuisine_type: 'Indian',
        images: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'],
        ingredients: ['Chicken breast', 'Tomatoes', 'Heavy cream', 'Onions', 'Ginger', 'Garlic', 'Garam masala', 'Turmeric', 'Basmati rice', 'Naan bread'],
        allergens: ['Dairy', 'Gluten (naan)'],
        available_quantity: 12,
        pickup_times: [
          {
            from: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
            to: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
          }
        ],
        rating: 4.7,
        review_count: 45,
        created_at: new Date().toISOString()
      }
    ];

    const { error: insertMealsError } = await supabase
      .from('meals')
      .upsert(sampleMeals, { onConflict: 'id' });

    if (insertMealsError) {
      console.error('Error inserting sample meals:', insertMealsError);
    } else {
      console.log('Sample meals inserted successfully');
    }

    console.log('Database initialization completed!');
    return true;
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