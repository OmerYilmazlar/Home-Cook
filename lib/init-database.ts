import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    console.log('Initializing database with sample data...');
    
    // Check if tables exist by trying to query them
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError) {
      console.error('Users table error:', usersError.message);
      console.log('Please run the SQL schema from lib/database-schema.sql in your Supabase dashboard first.');
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