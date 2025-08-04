# Supabase Database Setup

## Quick Setup Instructions

Your app is trying to connect to Supabase but the database tables don't exist yet. Follow these steps to set up your database:

### Step 1: Access Supabase Dashboard
1. Go to your Supabase dashboard: https://encrdntkazmlqwjqaiur.supabase.co
2. Sign in to your account

### Step 2: Create Database Tables
1. In the Supabase dashboard, navigate to **SQL Editor** (in the left sidebar)
2. Click **New Query**
3. Copy the entire contents of `lib/database-schema.sql` from this project
4. Paste it into the SQL editor
5. Click **Run** to execute the SQL commands

### Step 3: Verify Setup
1. Go to **Table Editor** in the Supabase dashboard
2. You should see the following tables:
   - `users`
   - `meals`
   - `reservations`
   - `messages`
   - `reviews`

### Step 4: Restart Your App
1. Stop your development server
2. Start it again with `npm start` or `yarn start`
3. The app should now initialize with sample data

## What the SQL Schema Creates

The schema creates:
- **Users table**: Stores cook and customer profiles
- **Meals table**: Stores meal listings from cooks
- **Reservations table**: Stores meal orders/bookings
- **Messages table**: Stores chat messages between users
- **Reviews table**: Stores ratings and reviews
- **Indexes**: For better query performance
- **Row Level Security (RLS)**: For data protection
- **Policies**: For access control

## Sample Data

Once the tables are created, the app will automatically populate them with sample data including:
- 3 sample cooks (Maria, Giuseppe, Priya)
- 1 sample customer (John)
- 3 sample meals (Tacos, Fettuccine, Butter Chicken)

## Troubleshooting

If you encounter issues:
1. Make sure you're signed in to the correct Supabase project
2. Check that all SQL commands executed without errors
3. Verify the tables were created in the Table Editor
4. Check the browser console for any error messages

## API Configuration

Your app is already configured with:
- **Supabase URL**: https://encrdntkazmlqwjqaiur.supabase.co
- **API Key**: Already set in `lib/supabase.ts`

No additional configuration needed once the tables are created.