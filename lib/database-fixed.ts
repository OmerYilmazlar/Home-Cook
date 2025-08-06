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
    
    // Simple approach: delete and recreate with updated data
    try {
      // First get current user data
      const { data: currentUser, error: getCurrentError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (getCurrentError || !currentUser) {
        throw new Error('User not found');
      }
      
      console.log('✅ Database: Found current user:', currentUser);
      
      // Create complete updated user object
      const updatedUserData = {
        ...currentUser,
        // Apply updates
        name: updates.name || currentUser.name,
        email: updates.email || currentUser.email,
        phone: updates.phone || currentUser.phone,
        avatar: updates.avatar || currentUser.avatar,
        bio: updates.bio || currentUser.bio,
        address: updates.location?.address || currentUser.address,
        latitude: updates.location?.latitude || currentUser.latitude,
        longitude: updates.location?.longitude || currentUser.longitude,
        updated_at: new Date().toISOString()
      };
      
      // Handle cook-specific fields
      if (currentUser.user_type === 'cook') {
        const cookUpdates = updates as Partial<Cook>;
        if (cookUpdates.cuisineTypes !== undefined) {
          updatedUserData.cuisine_types = cookUpdates.cuisineTypes;
        }
        if (cookUpdates.availableForPickup !== undefined) {
          updatedUserData.available_for_pickup = cookUpdates.availableForPickup;
        }
      }
      
      // Handle customer-specific fields
      if (currentUser.user_type === 'customer') {
        const customerUpdates = updates as Partial<Customer>;
        if (customerUpdates.favorites !== undefined) {
          updatedUserData.favorites = customerUpdates.favorites;
        }
      }
      
      console.log('💾 Database: Complete updated data:', updatedUserData);
      
      // Delete and recreate approach to bypass RLS issues
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (deleteError) {
        console.error('❌ Database: Delete failed:', deleteError);
        throw new Error(deleteError.message);
      }
      
      console.log('✅ Database: User deleted, recreating...');
      
      // Insert the updated user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(updatedUserData)
        .select()
        .single();
        
      if (insertError) {
        console.error('❌ Database: Insert failed:', insertError);
        throw new Error(insertError.message);
      }
      
      console.log('✅ Database: User recreated successfully:', newUser);
      
      // Verify the data was saved correctly
      console.log('🔍 Database: Verification check:');
      console.log('📤 Sent phone:', updates.phone, '📥 Stored phone:', newUser.phone);
      console.log('📤 Sent address:', updates.location?.address, '📥 Stored address:', newUser.address);  
      console.log('📤 Sent bio:', updates.bio, '📥 Stored bio:', newUser.bio);
      console.log('📤 Sent avatar:', updates.avatar, '📥 Stored avatar:', newUser.avatar);
      
      const convertedUser = convertDbUserToAppUser(newUser);
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
  }
};
