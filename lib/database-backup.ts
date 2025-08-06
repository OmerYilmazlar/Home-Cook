import { supabase } from './supabase';
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
    reviewCount: dbUser.review_count
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

// User operations
export const userService = {
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
    const id = `${userType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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
      favorites: userType === 'customer' ? [] : null
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
      // Build the update object with proper field mappings
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Map standard fields - only include fields that are actually being updated
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      
      // Map location fields
      if (updates.location) {
        if (updates.location.address !== undefined) updateData.address = updates.location.address;
        if (updates.location.latitude !== undefined) updateData.latitude = updates.location.latitude;
        if (updates.location.longitude !== undefined) updateData.longitude = updates.location.longitude;
      }
      
      // Map user-type specific fields
      if (updates.userType === 'cook') {
        const cookUpdates = updates as Partial<Cook>;
        if (cookUpdates.cuisineTypes !== undefined) updateData.cuisine_types = cookUpdates.cuisineTypes;
        if (cookUpdates.availableForPickup !== undefined) updateData.available_for_pickup = cookUpdates.availableForPickup;
      } else if (updates.userType === 'customer') {
        const customerUpdates = updates as Partial<Customer>;
        if (customerUpdates.favorites !== undefined) updateData.favorites = customerUpdates.favorites;
      }
      
      console.log('💾 Database: Prepared update data:', updateData);
      
      // Strategy: Try multiple update approaches
      let updateResult = null;
      let updateError = null;
      
      // Approach 1: Simple direct update
      try {
        console.log('💾 Database: Attempting direct update...');
        const { data: directData, error: directError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();
          
        if (!directError && directData) {
          console.log('✅ Database: Direct update succeeded:', directData);
          updateResult = directData;
        } else {
          updateError = directError;
          console.error('❌ Database: Direct update failed:', directError);
        }
      } catch (error) {
        updateError = error;
        console.error('❌ Database: Direct update exception:', error);
      }
      
      // Approach 2: Field-by-field update if direct update failed
      if (!updateResult) {
        console.log('� Database: Trying field-by-field updates...');
        let successCount = 0;
        
        for (const [field, value] of Object.entries(updateData)) {
          if (field === 'updated_at') continue; // Skip timestamp for individual updates
          
          try {
            const { error: fieldError } = await supabase
              .from('users')
              .update({ [field]: value })
              .eq('id', userId);
              
            if (!fieldError) {
              console.log(`✅ Database: Successfully updated ${field} = ${value}`);
              successCount++;
            } else {
              console.error(`❌ Database: Failed to update ${field}:`, fieldError);
            }
          } catch (fieldError) {
            console.error(`❌ Database: Exception updating ${field}:`, fieldError);
          }
        }
        
        // Update timestamp separately
        try {
          await supabase
            .from('users')
            .update({ updated_at: updateData.updated_at })
            .eq('id', userId);
        } catch (tsError) {
          console.error('❌ Database: Failed to update timestamp:', tsError);
        }
        
        console.log(`💾 Database: Updated ${successCount} fields individually`);
      }
      
      // Get the final user data to verify the updates
      const { data: finalUser, error: finalError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (finalError || !finalUser) {
        console.error('❌ Database: Failed to retrieve updated user:', finalError);
        throw new Error('Failed to retrieve updated user data');
      }
      
      // Verify the data was saved correctly
      console.log('🔍 Database: Final verification check:');
      console.log('📤 Sent phone:', updates.phone, '📥 Stored phone:', finalUser.phone);
      console.log('📤 Sent address:', updates.location?.address, '📥 Stored address:', finalUser.address);  
      console.log('📤 Sent bio:', updates.bio, '📥 Stored bio:', finalUser.bio);
      console.log('📤 Sent avatar:', updates.avatar, '📥 Stored avatar:', finalUser.avatar);
      console.log('📤 Sent name:', updates.name, '📥 Stored name:', finalUser.name);
      
      const convertedUser = convertDbUserToAppUser(finalUser);
      console.log('✅ Database: Final converted user:', convertedUser);
      return convertedUser;
      
    } catch (error) {
      console.error('❌ Database: All update approaches failed:', error);
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
  }
};

// Meal Service
export const mealService = {
  async getAllMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
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
    return data;
  },

  async getMealsByCookId(cookId: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('cook_id', cookId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<Meal> {
    const { data, error } = await supabase
      .from('meals')
      .insert({
        ...meal,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal> {
    const { data, error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteMeal(id: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};

// Reservation Service
export const reservationService = {
  async getReservationsByCustomerId(customerId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getReservationsByCookId(cookId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('cook_id', cookId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...reservation,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};
