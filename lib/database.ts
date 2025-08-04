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

// Helper function to convert database meal to app meal type
function convertDbMealToAppMeal(dbMeal: any): Meal {
  return {
    id: dbMeal.id,
    cookId: dbMeal.cook_id,
    name: dbMeal.name,
    description: dbMeal.description,
    price: dbMeal.price,
    cuisineType: dbMeal.cuisine_type,
    images: dbMeal.images,
    ingredients: dbMeal.ingredients,
    allergens: dbMeal.allergens,
    availableQuantity: dbMeal.available_quantity,
    pickupTimes: dbMeal.pickup_times,
    rating: dbMeal.rating,
    reviewCount: dbMeal.review_count,
    createdAt: dbMeal.created_at
  };
}

// Helper function to convert app meal to database format
function convertAppMealToDbMeal(meal: Meal) {
  return {
    id: meal.id,
    cook_id: meal.cookId,
    name: meal.name,
    description: meal.description,
    price: meal.price,
    cuisine_type: meal.cuisineType,
    images: meal.images,
    ingredients: meal.ingredients,
    allergens: meal.allergens,
    available_quantity: meal.availableQuantity,
    pickup_times: meal.pickupTimes,
    rating: meal.rating,
    review_count: meal.reviewCount,
    created_at: meal.createdAt
  };
}

// Helper function to convert database reservation to app reservation type
function convertDbReservationToAppReservation(dbReservation: any): Reservation {
  return {
    id: dbReservation.id,
    mealId: dbReservation.meal_id,
    customerId: dbReservation.customer_id,
    cookId: dbReservation.cook_id,
    status: dbReservation.status,
    quantity: dbReservation.quantity,
    totalPrice: dbReservation.total_price,
    totalAmount: dbReservation.total_price,
    pickupTime: dbReservation.pickup_time,
    createdAt: dbReservation.created_at,
    paymentConfirmed: dbReservation.payment_confirmed,
    paymentId: dbReservation.payment_id,
    paymentStatus: dbReservation.payment_status,
    rating: dbReservation.meal_rating && dbReservation.cook_rating ? {
      mealRating: dbReservation.meal_rating,
      cookRating: dbReservation.cook_rating,
      reviewText: dbReservation.review_text || '',
      customerId: dbReservation.customer_id,
      customerName: '', // Will be populated when needed
      createdAt: dbReservation.updated_at
    } : undefined
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
    const dbUser = {
      name: userData.name || '',
      email: userData.email || '',
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

    const { data, error } = await supabase
      .from('users')
      .insert(dbUser)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbUserToAppUser(data);
  },

  async updateUser(userId: string, updates: Partial<Cook | Customer>): Promise<Cook | Customer> {
    const dbUpdates = convertAppUserToDbUser(updates as Cook | Customer);
    const { id, ...updatesWithoutId } = dbUpdates; // Don't update ID

    const { data, error } = await supabase
      .from('users')
      .update({ ...updatesWithoutId, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbUserToAppUser(data);
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

// Meal operations
export const mealService = {
  async getAllMeals(): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(convertDbMealToAppMeal);
  },

  async getMealById(id: string): Promise<Meal | null> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return convertDbMealToAppMeal(data);
  },

  async getMealsByCookId(cookId: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('cook_id', cookId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(convertDbMealToAppMeal);
  },

  async createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<Meal> {
    const dbMeal = {
      ...convertAppMealToDbMeal(meal as Meal),
      created_at: new Date().toISOString()
    };
    const { id, ...mealWithoutId } = dbMeal;

    const { data, error } = await supabase
      .from('meals')
      .insert(mealWithoutId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbMealToAppMeal(data);
  },

  async updateMeal(mealId: string, updates: Partial<Meal>): Promise<Meal> {
    const dbUpdates = convertAppMealToDbMeal(updates as Meal);
    const { id, created_at, ...updatesWithoutIdAndDate } = dbUpdates;

    const { data, error } = await supabase
      .from('meals')
      .update({ ...updatesWithoutIdAndDate, updated_at: new Date().toISOString() })
      .eq('id', mealId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbMealToAppMeal(data);
  },

  async deleteMeal(mealId: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);

    if (error) throw new Error(error.message);
  }
};

// Reservation operations
export const reservationService = {
  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    const dbReservation = {
      meal_id: reservation.mealId,
      customer_id: reservation.customerId,
      cook_id: reservation.cookId,
      status: reservation.status,
      quantity: reservation.quantity,
      total_price: reservation.totalPrice,
      pickup_time: reservation.pickupTime,
      payment_confirmed: reservation.paymentConfirmed,
      payment_id: reservation.paymentId,
      payment_status: reservation.paymentStatus,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reservations')
      .insert(dbReservation)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbReservationToAppReservation(data);
  },

  async getReservationsByCustomerId(customerId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(convertDbReservationToAppReservation);
  },

  async getReservationsByCookId(cookId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('cook_id', cookId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(convertDbReservationToAppReservation);
  },

  async updateReservation(reservationId: string, updates: Partial<Reservation>): Promise<Reservation> {
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.paymentConfirmed !== undefined) dbUpdates.payment_confirmed = updates.paymentConfirmed;
    if (updates.paymentId) dbUpdates.payment_id = updates.paymentId;
    if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.rating) {
      dbUpdates.meal_rating = updates.rating.mealRating;
      dbUpdates.cook_rating = updates.rating.cookRating;
      dbUpdates.review_text = updates.rating.reviewText;
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(dbUpdates)
      .eq('id', reservationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertDbReservationToAppReservation(data);
  }
};

// Message operations
export const messageService = {
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      read: data.read,
      createdAt: data.created_at
    };
  },

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    
    return data.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      read: msg.read,
      createdAt: msg.created_at
    }));
  },

  async markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', userId);

    if (error) throw new Error(error.message);
  }
};