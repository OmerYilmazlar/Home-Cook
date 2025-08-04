import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType, Cook, Customer } from '@/types';
import { userService } from '@/lib/database';
import { initializeDatabase } from '@/lib/init-database';

interface AuthState {
  user: Cook | Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User>, password: string, userType: UserType) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  addCuisineType: (cuisineType: string) => Promise<void>;
  updateUserRating: (userId: string, newRating: number) => Promise<void>;
  updateCustomerReviewCount: (customerId: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: true, // Set to true by default for now
  error: null,
      
      login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Login attempt for:', email);
      
      // Find user by email in Supabase
      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        console.log('User not found');
        set({ isLoading: false, error: 'User not found' });
        return false;
      }

      // Set the current user
      set({ 
        user: user, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
      
      console.log('Login successful:', user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
      return false;
    }
  },
      
      signup: async (userData, password, userType) => {
        set({ isLoading: true, error: null });
        
        try {
          // Check if email already exists
          const existingUser = await userService.getUserByEmail(userData.email || '');
          
          if (existingUser) {
            throw new Error('Email already in use');
          }
          
          // Create new user in Supabase
          const newUser = await userService.createUser(userData, userType);
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },
      
      initialize: async () => {
        console.log('Auth store initializing...');
        
        try {
          // Initialize database with sample data
          await initializeDatabase();
          console.log('Database initialized successfully');
        } catch (error) {
          console.error('Database initialization failed:', error);
        }
        
        // For development, don't auto-login - let users login manually
        set({ isInitialized: true });
        
        console.log('Auth store initialized');
      },
      

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }
          
          // Update user in Supabase
          const updatedUser = await userService.updateUser(currentUser.id, { ...currentUser, ...userData });
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      addCuisineType: async (cuisineType: string) => {
        const currentUser = get().user;
        if (!currentUser || currentUser.userType !== 'cook') {
          return;
        }
        
        const cookUser = currentUser as Cook;
        const existingCuisines = cookUser.cuisineTypes || [];
        
        if (!existingCuisines.includes(cuisineType)) {
          try {
            const updatedUser = await userService.updateUser(currentUser.id, {
              ...cookUser,
              cuisineTypes: [...existingCuisines, cuisineType]
            });
            set({ user: updatedUser });
          } catch (error) {
            console.error('Failed to add cuisine type:', error);
          }
        }
      },
      
      updateUserRating: async (userId: string, newRating: number) => {
        try {
          // Get user from Supabase
          const userToUpdate = await userService.getUserById(userId);
          if (!userToUpdate) {
            console.error('User not found for rating update:', userId);
            return;
          }
          
          // Calculate new average rating
          const currentRating = userToUpdate.rating || 0;
          const currentReviewCount = userToUpdate.reviewCount || 0;
          const newReviewCount = currentReviewCount + 1;
          
          // Calculate weighted average
          const totalRatingPoints = (currentRating * currentReviewCount) + newRating;
          const newAverageRating = totalRatingPoints / newReviewCount;
          
          const updatedUser = await userService.updateUser(userId, {
            ...userToUpdate,
            rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
            reviewCount: newReviewCount
          });
          
          // If this is the currently logged-in user, also update the current user state
          const currentUser = get().user;
          if (currentUser && currentUser.id === userId) {
            set({ user: updatedUser });
          }
          
          console.log('Updated user rating:', {
            userId,
            newRating,
            newAverageRating: updatedUser.rating,
            newReviewCount: updatedUser.reviewCount,
            isCurrentUser: currentUser?.id === userId
          });
        } catch (error) {
          console.error('Failed to update user rating:', error);
        }
      },
      
      updateCustomerReviewCount: async (customerId: string) => {
        try {
          // Get customer from Supabase
          const userToUpdate = await userService.getUserById(customerId);
          if (!userToUpdate) {
            console.error('Customer not found for review count update:', customerId);
            return;
          }
          
          const updatedUser = await userService.updateUser(customerId, {
            ...userToUpdate,
            reviewCount: (userToUpdate.reviewCount || 0) + 1
          });
          
          // If this is the currently logged-in user, also update the current user state
          const currentUser = get().user;
          if (currentUser && currentUser.id === customerId) {
            set({ user: updatedUser });
          }
          
          console.log('Updated customer review count:', {
            customerId,
            newReviewCount: updatedUser.reviewCount,
            isCurrentUser: currentUser?.id === customerId
          });
        } catch (error) {
          console.error('Failed to update customer review count:', error);
        }
      },
}));