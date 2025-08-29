import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Cook, Customer, Meal, Reservation, Message, UserType } from '@/types';

// Helper function to convert database user to app user type
function convertDbUserToAppUser(dbUser: any): Cook | Customer {
  const baseUser = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    avatar: dbUser.avatar,
    userType: dbUser.user_type,
    location: dbUser.latitude && dbUser.longitude ? {
      latitude: dbUser.latitude,
      longitude: dbUser.longitude,
      address: dbUser.address || ''
    } : dbUser.address ? {
      address: dbUser.address
    } : undefined,
    bio: dbUser.bio,
    rating: dbUser.rating,
    reviewCount: dbUser.review_count,
    // Add verification fields
    isEmailVerified: dbUser.email_verified || false,
    isPhoneVerified: dbUser.phone_verified || false,
    emailVerifiedAt: dbUser.email_verified_at ? new Date(dbUser.email_verified_at) : undefined,
    phoneVerifiedAt: dbUser.phone_verified_at ? new Date(dbUser.phone_verified_at) : undefined,
  };

  if (dbUser.user_type === 'cook') {
    return {
      ...baseUser,
      userType: 'cook',
      cuisineTypes: dbUser.cuisine_types || [],
      availableForPickup: dbUser.available_for_pickup
    } as Cook;
  } else {
    return {
      ...baseUser,
      userType: 'customer',
      favorites: dbUser.favorites || []
    } as Customer;
  }
}

// Helper function to convert app user to database format
function convertAppUserToDbUser(user: Cook | Customer) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    user_type: user.userType,
    latitude: user.location?.latitude,
    longitude: user.location?.longitude,
    address: user.location?.address,
    bio: user.bio,
    rating: user.rating,
    review_count: user.reviewCount,
    cuisine_types: user.userType === 'cook' ? (user as Cook).cuisineTypes : null,
    available_for_pickup: user.userType === 'cook' ? (user as Cook).availableForPickup : null,
    favorites: user.userType === 'customer' ? (user as Customer).favorites : null
  };
}

// Helper function to convert database meal to app meal type
function convertDbMealToAppMeal(dbMeal: any): Meal {
  return {
    id: dbMeal.id,
    cookId: dbMeal.cook_id,
    name: dbMeal.name,
    description: dbMeal.description,
    price: dbMeal.price,
    cuisineType: dbMeal.cuisine_type,
    images: dbMeal.images || [],
    ingredients: dbMeal.ingredients || [],
    allergens: dbMeal.allergens || [],
    availableQuantity: dbMeal.available_quantity || 0,
    pickupTimes: dbMeal.pickup_times || [],
    rating: dbMeal.rating,
    reviewCount: dbMeal.review_count || 0,
    createdAt: dbMeal.created_at
  };
}

// Helper function to convert app meal to database format
function convertAppMealToDbMeal(meal: Partial<Meal>) {
  const dbMeal: any = {};
  
  // Only include defined values to avoid undefined issues
  if (meal.id !== undefined) dbMeal.id = meal.id;
  if (meal.cookId !== undefined) dbMeal.cook_id = meal.cookId;
  if (meal.name !== undefined) dbMeal.name = meal.name;
  if (meal.description !== undefined) dbMeal.description = meal.description;
  if (meal.price !== undefined) dbMeal.price = meal.price;
  if (meal.cuisineType !== undefined) dbMeal.cuisine_type = meal.cuisineType;
  if (meal.images !== undefined) dbMeal.images = meal.images;
  if (meal.ingredients !== undefined) dbMeal.ingredients = meal.ingredients;
  if (meal.allergens !== undefined) dbMeal.allergens = meal.allergens;
  if (meal.availableQuantity !== undefined) dbMeal.available_quantity = meal.availableQuantity;
  if (meal.pickupTimes !== undefined) dbMeal.pickup_times = meal.pickupTimes;
  if (meal.rating !== undefined) dbMeal.rating = meal.rating;
  if (meal.reviewCount !== undefined) dbMeal.review_count = meal.reviewCount;
  if (meal.createdAt !== undefined) dbMeal.created_at = meal.createdAt;
  
  return dbMeal;
}

// User operations
export const userService = {
  async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
    
    return !!data;
  },

  async checkUsernameExists(name: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (error) {
      console.error('Error checking username existence:', error);
      return false;
    }
    
    return !!data;
  },
  async getUserByEmail(email: string): Promise<Cook | Customer | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return convertDbUserToAppUser(data);
  },

  async getUserById(id: string): Promise<Cook | Customer | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return convertDbUserToAppUser(data);
  },

  async createUser(userData: Partial<User>, userType: UserType): Promise<Cook | Customer> {
    // Use the provided ID (from Supabase Auth) or generate one if not provided
    const id = userData.id || `${userType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('💾 Database: Creating user with ID:', id);
    
    const dbUserData = {
      id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      avatar: userData.avatar,
      user_type: userType,
      latitude: userData.location?.latitude,
      longitude: userData.location?.longitude,
      address: userData.location?.address,
      bio: userData.bio,
      rating: 0,
      review_count: 0,
      cuisine_types: userType === 'cook' ? [] : null,
      available_for_pickup: userType === 'cook' ? true : null,
      favorites: userType === 'customer' ? [] : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('💾 Database: Inserting user data:', dbUserData);

    const { data, error } = await supabase
      .from('users')
      .insert(dbUserData)
      .select()
      .single();

    if (error) {
      console.error('💾 Database: Insert error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Database: User created successfully:', data);
    const convertedUser = convertDbUserToAppUser(data);
    console.log('✅ Database: Converted user:', convertedUser);
    
    return convertedUser;
  },

  async updateUser(userId: string, updates: Partial<Cook | Customer>): Promise<Cook | Customer> {
    console.log('💾 Database: updateUser called with userId:', userId);
    console.log('💾 Database: updateUser called with updates:', updates);
    
    try {
      // First, let's see what users actually exist in the database
      console.log('🔍 Database: Checking all users for debugging...');
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, name, email')
        .limit(10);
      console.log('📋 Database: All users in database:', allUsers);
      
      // Check if the user actually exists
      console.log('🔍 Database: Checking if user exists with ID:', userId);
      let { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows found
        
      console.log('🔍 Database: User check result:', { existingUser, checkError });
      
      if (checkError) {
        console.error('❌ Database: Error checking user existence:', checkError);
        throw new Error(checkError.message);
      }
      
      // If user doesn't exist, try to find by email as backup
      if (!existingUser && updates.email) {
        console.log('🔍 Database: User ID not found, trying to find by email:', updates.email);
        const { data: userByEmail, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', updates.email)
          .maybeSingle();
          
        console.log('📧 Database: User found by email:', userByEmail);
        
        if (userByEmail && !emailError) {
          console.log('🔄 Database: Found user by email, updating that record instead');
          // Use the correct user ID from the database
          userId = userByEmail.id;
          existingUser = userByEmail;
        }
      }
      
      // If user doesn't exist, we need to create it first
      if (!existingUser) {
        console.log('⚠️ Database: User does not exist, creating new user...');
        
        // Convert the updates back to a format suitable for createUser
        const userData = {
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          avatar: updates.avatar,
          bio: updates.bio,
          location: updates.location
        };
        
        // Determine user type from the updates or default to 'cook'
        const userType = (updates as any).userType || 'cook';
        
        console.log('🔄 Database: Creating user with data:', userData, 'type:', userType);
        
        // Use createUser but with the specific ID
        const dbUserData = {
          id: userId, // Use the existing ID
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          avatar: userData.avatar,
          user_type: userType,
          latitude: userData.location?.latitude,
          longitude: userData.location?.longitude,
          address: userData.location?.address,
          bio: userData.bio,
          rating: 0,
          review_count: 0,
          cuisine_types: userType === 'cook' ? (updates as Cook).cuisineTypes || [] : null,
          available_for_pickup: userType === 'cook' ? (updates as Cook).availableForPickup || true : null,
          favorites: userType === 'customer' ? (updates as Customer).favorites || [] : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('💾 Database: Inserting new user with data:', dbUserData);

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert(dbUserData)
          .select()
          .single();

        if (insertError) {
          console.error('💾 Database: Insert error:', insertError);
          throw new Error(insertError.message);
        }

        console.log('✅ Database: User created successfully:', newUser);
        const convertedUser = convertDbUserToAppUser(newUser);
        console.log('✅ Database: Final converted user:', convertedUser);
        return convertedUser;
      }
      
      // User exists, proceed with update
      console.log('✅ Database: User exists, proceeding with update');
      
      // Build the update object with only the fields we want to change
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Only include fields that are actually being updated
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      
      // Handle verification status updates
      if (updates.isEmailVerified !== undefined) updateData.email_verified = updates.isEmailVerified;
      if (updates.emailVerifiedAt !== undefined) updateData.email_verified_at = updates.emailVerifiedAt ? updates.emailVerifiedAt.toISOString() : null;
      if (updates.isPhoneVerified !== undefined) updateData.phone_verified = updates.isPhoneVerified;
      if (updates.phoneVerifiedAt !== undefined) updateData.phone_verified_at = updates.phoneVerifiedAt ? updates.phoneVerifiedAt.toISOString() : null;
      
      // Handle location updates
      if (updates.location) {
        if (updates.location.address !== undefined) updateData.address = updates.location.address;
        if (updates.location.latitude !== undefined) updateData.latitude = updates.location.latitude;
        if (updates.location.longitude !== undefined) updateData.longitude = updates.location.longitude;
      }
      
      // Handle cook-specific fields
      const cookUpdates = updates as Partial<Cook>;
      if (cookUpdates.cuisineTypes !== undefined) {
        updateData.cuisine_types = cookUpdates.cuisineTypes;
      }
      if (cookUpdates.availableForPickup !== undefined) {
        updateData.available_for_pickup = cookUpdates.availableForPickup;
      }
      
      // Handle customer-specific fields  
      const customerUpdates = updates as Partial<Customer>;
      if (customerUpdates.favorites !== undefined) {
        updateData.favorites = customerUpdates.favorites;
      }
      
      console.log('💾 Database: Update data to send:', updateData);
      
      // Log verification status changes
      if (updates.isEmailVerified !== undefined || updates.emailVerifiedAt !== undefined) {
        console.log('📧 Database: Email verification status being updated:', {
          isEmailVerified: updates.isEmailVerified,
          emailVerifiedAt: updates.emailVerifiedAt
        });
      }
      
      // Try using upsert instead of update to bypass RLS issues
      console.log('� Database: Attempting UPSERT approach...');
      const { data: upsertedUser, error: upsertError } = await supabase
        .from('users')
        .upsert({
          ...existingUser,
          ...updateData
        })
        .select()
        .single();
        
      if (upsertError) {
        console.error('❌ Database: Upsert failed:', upsertError);
        throw new Error(upsertError.message);
      }
      
      console.log('✅ Database: User updated successfully:', upsertedUser);
      
      // Verify the data was saved correctly
      console.log('🔍 Database: Verification check:');
      console.log('📤 Sent phone:', updates.phone, '📥 Stored phone:', upsertedUser.phone);
      console.log('📤 Sent address:', updates.location?.address, '📥 Stored address:', upsertedUser.address);  
      console.log('📤 Sent bio:', updates.bio, '📥 Stored bio:', upsertedUser.bio);
      console.log('📤 Sent avatar:', updates.avatar, '📥 Stored avatar:', upsertedUser.avatar);
      
      const convertedUser = convertDbUserToAppUser(upsertedUser);
      console.log('✅ Database: Final converted user:', convertedUser);
      return convertedUser;
      
    } catch (error) {
      console.error('❌ Database: Update operation failed:', error);
      throw error;
    }
  },

  async getAllCooks(): Promise<Cook[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'cook');

    if (error) throw new Error(error.message);
    return data.map(convertDbUserToAppUser) as Cook[];
  },

  async getTrendingCooks(limit: number = 10): Promise<Cook[]> {
    // Get cooks ordered by rating and review count
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'cook')
      .not('rating', 'is', null)
      .gte('review_count', 1) // At least 1 review
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data.map(convertDbUserToAppUser) as Cook[];
  },

  async getRisingStarCooks(limit: number = 5): Promise<Cook[]> {
    // Get newer cooks (created in last 90 days) with good ratings
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'cook')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .gte('rating', 4.0) // Good rating
      .gte('review_count', 1) // At least 1 review
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data.map(convertDbUserToAppUser) as Cook[];
  }
};

async function toPublicImageUrls(uris: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const uri of uris ?? []) {
    try {
      const isHttp = typeof uri === 'string' && /^https?:\/\//.test(uri);
      if (isHttp) {
        results.push(uri);
        continue;
      }
      const bucket = 'meal-images';
      const fileExt = (uri.split('.').pop() || 'jpg').split('?')[0];
      const fileName = `meal_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

      const response = await fetch(uri as string);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, { contentType: blob.type || `image/${fileExt}`, upsert: true });
      if (uploadError) {
        console.warn('Storage upload failed, keeping original uri', uploadError);
        results.push(uri);
        continue;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = data?.publicUrl;
      if (publicUrl) {
        results.push(publicUrl);
      } else {
        results.push(uri);
      }
    } catch (e) {
      console.warn('Image upload error, falling back to original uri', e);
      results.push(uri);
    }
  }
  return results;
}

// Meal Service
export const mealService = {
  async getAllMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(convertDbMealToAppMeal);
  },

  async getMealById(id: string): Promise<Meal | null> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return convertDbMealToAppMeal(data);
  },

  async getMealsByCookId(cookId: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('cook_id', cookId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(convertDbMealToAppMeal);
  },

  async createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<Meal> {
    console.log('💾 Database: Creating meal with data:', meal);
    
    const safeImages = await toPublicImageUrls(meal.images ?? []);

    const dbMeal = convertAppMealToDbMeal({
      ...meal,
      images: safeImages,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    });
    
    console.log('💾 Database: Converted meal data for DB:', dbMeal);

    const { data, error } = await supabase
      .from('meals')
      .insert(dbMeal)
      .select()
      .single();

    if (error) {
      console.error('💾 Database: Meal creation error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ Database: Meal created successfully:', data);
    return convertDbMealToAppMeal(data);
  },

  async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal> {
    const processed: Partial<Meal> = { ...updates };
    if (updates.images && updates.images.length > 0) {
      processed.images = await toPublicImageUrls(updates.images);
    }
    const dbUpdates = convertAppMealToDbMeal(processed);
    
    const { data, error } = await supabase
      .from('meals')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbMealToAppMeal(data);
  },

  async deleteMeal(id: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  // Analytics and trending functions
  async getTrendingMeals(limit: number = 10): Promise<Meal[]> {
    // Get meals ordered by a combination of rating and review count
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .not('rating', 'is', null)
      .gte('review_count', 1) // At least 1 review
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []).map(convertDbMealToAppMeal);
  },

  async getMostOrderedMeals(limit: number = 10): Promise<Meal[]> {
    // Get meals with the most orders from reservations
    const { data, error } = await supabase
      .from('meals')
      .select(`
        *,
        reservations:reservations!inner(meal_id)
      `)
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []).map(convertDbMealToAppMeal);
  },

  async getPopularCuisineTypes(): Promise<{cuisineType: string, count: number, avgRating: number}[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('cuisine_type, rating')
      .not('cuisine_type', 'is', null);

    if (error) throw new Error(error.message);

    // Group by cuisine type and calculate stats
    const cuisineStats: Record<string, {count: number, totalRating: number, avgRating: number}> = {};
    
    data?.forEach(meal => {
      const cuisine = meal.cuisine_type;
      if (!cuisineStats[cuisine]) {
        cuisineStats[cuisine] = { count: 0, totalRating: 0, avgRating: 0 };
      }
      cuisineStats[cuisine].count++;
      if (meal.rating) {
        cuisineStats[cuisine].totalRating += meal.rating;
      }
    });

    // Calculate averages and format for return
    return Object.entries(cuisineStats)
      .map(([cuisineType, stats]) => ({
        cuisineType,
        count: stats.count,
        avgRating: stats.count > 0 ? stats.totalRating / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count);
  }
};

// Supabase-backed message service with AsyncStorage fallback for resilience
export const messageService = {
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    console.log('💬 MessageService: Fetching messages between:', userId1, 'and', userId2);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('💬 MessageService: Supabase fetch error, falling back to local:', error);
        throw error;
      }

      const rows = data ?? [];
      console.log('✅ MessageService: Fetched', rows.length, 'messages from Supabase');
      
      const messages: Message[] = rows.map((r: any) => ({
        id: r.id,
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        content: r.content,
        createdAt: r.created_at,
        read: !!r.read,
      } as Message));

      // Keep a local mirror for offline access
      try {
        const raw = await AsyncStorage.getItem('messages');
        const existingMessages: Message[] = raw ? (JSON.parse(raw) as Message[]) : [];
        
        // Merge with existing messages, avoiding duplicates
        const allMessages = [...existingMessages];
        messages.forEach(newMsg => {
          const existingIndex = allMessages.findIndex(existing => existing.id === newMsg.id);
          if (existingIndex >= 0) {
            allMessages[existingIndex] = newMsg; // Update existing
          } else {
            allMessages.push(newMsg); // Add new
          }
        });
        
        await AsyncStorage.setItem('messages', JSON.stringify(allMessages));
        console.log('✅ MessageService: Local mirror updated with', allMessages.length, 'total messages');
      } catch (e) {
        console.log('⚠️ MessageService: Local mirror update failed:', e);
      }

      return messages;
    } catch (_e) {
      console.log('💬 MessageService: Using local storage fallback');
      try {
        const raw = await AsyncStorage.getItem('messages');
        const all: Message[] = raw ? (JSON.parse(raw) as Message[]) : [];
        const filtered = all
          .filter(
            (m: Message) =>
              (m.senderId === userId1 && m.receiverId === userId2) ||
              (m.senderId === userId2 && m.receiverId === userId1)
          )
          .sort(
            (a: Message, b: Message) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        console.log('✅ MessageService: Returning', filtered.length, 'messages from local storage');
        return filtered;
      } catch (e) {
        console.error('❌ MessageService: Local storage fallback failed:', e);
        return [];
      }
    }
  },

  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    const timestamp = new Date().toISOString();
    const optimistic: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      senderId,
      receiverId,
      content,
      createdAt: timestamp,
      read: false,
    };

    console.log('💬 MessageService: Attempting to send message:', {
      senderId,
      receiverId,
      content: content.substring(0, 50) + '...',
      messageId: optimistic.id
    });

    // Check current auth session
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 MessageService: Current session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        senderMatches: session?.user?.id === senderId,
        sessionError: sessionError?.message
      });
    } catch (e) {
      console.log('🔐 MessageService: Session check failed:', e);
    }

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          id: optimistic.id,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          read: false,
          created_at: timestamp,
        })
        .select('*')
        .single();

      if (error) {
        console.error('💬 MessageService: Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ MessageService: Message saved to Supabase successfully:', data.id);

      const saved: Message = {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        createdAt: data.created_at,
        read: !!data.read,
      };

      // Update local mirror as well
      try {
        const raw = await AsyncStorage.getItem('messages');
        const all: Message[] = raw ? (JSON.parse(raw) as Message[]) : [];
        await AsyncStorage.setItem('messages', JSON.stringify([...all, saved]));
        console.log('✅ MessageService: Local mirror updated');
      } catch (e) {
        console.log('⚠️ MessageService: Local mirror update failed:', e);
      }

      return saved;
    } catch (e) {
      console.warn('❌ MessageService: Supabase save failed, using local storage:', e);
      try {
        const raw = await AsyncStorage.getItem('messages');
        const all: Message[] = raw ? (JSON.parse(raw) as Message[]) : [];
        const updated = [...all, optimistic];
        await AsyncStorage.setItem('messages', JSON.stringify(updated));
        console.log('✅ MessageService: Message saved locally as fallback');
      } catch (se) {
        console.error('❌ MessageService: Local save also failed:', se);
      }
      return optimistic;
    }
  },

  async markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', userId)
        .eq('sender_id', otherUserId)
        .eq('read', false);

      if (error) throw error;

      // Update local mirror
      try {
        const raw = await AsyncStorage.getItem('messages');
        const all: Message[] = raw ? (JSON.parse(raw) as Message[]) : [];
        const updated = all.map((m) =>
          m.senderId === otherUserId && m.receiverId === userId && !m.read
            ? { ...m, read: true }
            : m
        );
        await AsyncStorage.setItem('messages', JSON.stringify(updated));
      } catch (le) {
        console.log('messageService.markMessagesAsRead local mirror error', le);
      }
    } catch (e) {
      console.log('messageService.markMessagesAsRead supabase error, local-only update', e);
      try {
        const raw = await AsyncStorage.getItem('messages');
        const all: Message[] = raw ? (JSON.parse(raw) as Message[]) : [];
        const updated = all.map((m) =>
          m.senderId === otherUserId && m.receiverId === userId && !m.read
            ? { ...m, read: true }
            : m
        );
        await AsyncStorage.setItem('messages', JSON.stringify(updated));
      } catch (le) {
        console.log('messageService.markMessagesAsRead local fallback error', le);
      }
    }
  },
};

// Reservation mappers
function convertDbReservationToAppReservation(db: any): Reservation {
  return {
    id: db.id,
    mealId: db.meal_id,
    customerId: db.customer_id,
    cookId: db.cook_id,
    status: db.status,
    quantity: db.quantity,
    totalPrice: db.total_price,
    totalAmount: db.total_amount ?? db.total_price,
    pickupTime: db.pickup_time,
    createdAt: db.created_at,
    paymentConfirmed: db.payment_confirmed ?? undefined,
    paymentId: db.payment_id ?? undefined,
    paymentStatus: db.payment_status ?? undefined,
    rating: db.rating ?? undefined,
  } as Reservation;
}

function convertAppReservationToDbReservation(r: Partial<Reservation>) {
  const out: any = {};
  if (r.id !== undefined) out.id = r.id;
  if (r.mealId !== undefined) out.meal_id = r.mealId;
  if (r.customerId !== undefined) out.customer_id = r.customerId;
  if (r.cookId !== undefined) out.cook_id = r.cookId;
  if (r.status !== undefined) out.status = r.status;
  if (r.quantity !== undefined) out.quantity = r.quantity;
  if (r.totalPrice !== undefined) out.total_price = r.totalPrice;
  if (r.totalAmount !== undefined) out.total_amount = r.totalAmount;
  if (r.pickupTime !== undefined) out.pickup_time = r.pickupTime;
  if (r.createdAt !== undefined) out.created_at = r.createdAt;
  if (r.paymentConfirmed !== undefined) out.payment_confirmed = r.paymentConfirmed;
  if (r.paymentId !== undefined) out.payment_id = r.paymentId;
  if (r.paymentStatus !== undefined) out.payment_status = r.paymentStatus;
  if (r.rating !== undefined) out.rating = r.rating;
  return out;
}

// Reservation Service
export const reservationService = {
  async getReservationsByCustomerId(customerId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(convertDbReservationToAppReservation);
  },

  async getReservationsByCookId(cookId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('cook_id', cookId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(convertDbReservationToAppReservation);
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    const id = `reservation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const dbPayload = convertAppReservationToDbReservation({
      ...reservation,
      id,
      createdAt: new Date().toISOString(),
      totalAmount: reservation.totalAmount ?? reservation.totalPrice,
    });

    const { data, error } = await supabase
      .from('reservations')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbReservationToAppReservation(data);
  },

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const dbUpdates = convertAppReservationToDbReservation(updates);
    const { data, error } = await supabase
      .from('reservations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbReservationToAppReservation(data);
  }
};
