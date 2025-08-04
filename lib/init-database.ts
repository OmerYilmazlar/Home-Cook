import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    console.log('Initializing database with sample data...');

    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    }

    // Create meals table
    const { error: mealsError } = await supabase.rpc('create_meals_table');
    if (mealsError && !mealsError.message.includes('already exists')) {
      console.error('Error creating meals table:', mealsError);
    }

    // Create reservations table
    const { error: reservationsError } = await supabase.rpc('create_reservations_table');
    if (reservationsError && !reservationsError.message.includes('already exists')) {
      console.error('Error creating reservations table:', reservationsError);
    }

    // Create messages table
    const { error: messagesError } = await supabase.rpc('create_messages_table');
    if (messagesError && !messagesError.message.includes('already exists')) {
      console.error('Error creating messages table:', messagesError);
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
        rating: 0,
        review_count: 0,
        cuisine_types: ['Mexican', 'Latin American'],
        available_for_pickup: true,
        favorites: null
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

    // Insert sample meal
    const sampleMeal = {
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
          from: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          to: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()    // 4 hours from now
        }
      ],
      rating: null,
      review_count: 0,
      created_at: new Date().toISOString()
    };

    const { error: insertMealError } = await supabase
      .from('meals')
      .upsert([sampleMeal], { onConflict: 'id' });

    if (insertMealError) {
      console.error('Error inserting sample meal:', insertMealError);
    } else {
      console.log('Sample meal inserted successfully');
    }

    console.log('Database initialization completed!');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}