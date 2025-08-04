# Database Setup Instructions

## Setting up Supabase Database

To set up your Supabase database for this food delivery app, follow these steps:

### 1. Create Database Tables

1. Go to your Supabase dashboard: https://encrdntkazmlqwjqaiur.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the entire content from `lib/database-schema.sql`
4. Click "Run" to execute the SQL commands

This will create all the necessary tables:
- `users` - Store user profiles (cooks and customers)
- `meals` - Store meal listings from cooks
- `reservations` - Store meal orders/bookings
- `messages` - Store chat messages between users
- `reviews` - Store ratings and reviews

### 2. Initialize Sample Data

After creating the tables, the app will automatically insert sample data when you first run it. The sample data includes:
- 3 sample cooks with different cuisines (Mexican, Italian, Indian)
- 1 sample customer
- 3 sample meals

### 3. Authentication Setup (Optional)

If you want to enable user authentication:
1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your authentication providers
3. Update the Row Level Security (RLS) policies as needed

### 4. API Configuration

The app is already configured to use your Supabase instance with:
- URL: `https://encrdntkazmlqwjqaiur.supabase.co`
- API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuY3JkbnRrYXptbHF3anFhaXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjg5NzUsImV4cCI6MjA2OTY0NDk3NX0.-sKU90ZM9sVfl7S0dPrc3Vwld2i4q4y6nzHy8Afc-14`

### 5. Testing the Setup

1. Run the app
2. Check the console for database initialization messages
3. Navigate through the app to see the sample data
4. Try adding a cook to favorites to test the database integration

## Troubleshooting

If you encounter any errors:
1. Make sure all SQL commands from `database-schema.sql` were executed successfully
2. Check that your Supabase project is active and accessible
3. Verify the API key and URL are correct in `lib/supabase.ts`
4. Check the browser console for any error messages

## Database Schema Overview

### Users Table
- Stores both cooks and customers
- Includes location data for cooks
- Supports favorites list for customers

### Meals Table
- Linked to cook users
- Includes pricing, ingredients, allergens
- Supports multiple pickup time slots

### Reservations Table
- Links customers, cooks, and meals
- Tracks order status and pickup times
- Includes special instructions

### Messages Table
- Enables chat between users
- Supports different message types
- Tracks read status

### Reviews Table
- Links to users, meals, and reservations
- Stores ratings and comments
- Used to calculate cook ratings