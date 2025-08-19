import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType, Cook, Customer } from '@/types';
import { userService } from '@/lib/database';
import { initializeDatabase } from '@/lib/init-database';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: Cook | Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User>, password: string, userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  addCuisineType: (cuisineType: string) => Promise<void>;
  updateUserRating: (userId: string, newRating: number) => Promise<void>;
  updateCustomerReviewCount: (customerId: string) => Promise<void>;
  initialize: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearError: () => void;
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
      
      console.log('🔐 Auth Store: Login attempt for:', email);
      
      // First, authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.log('❌ Auth Store: Supabase auth failed:', authError.message);
        set({ isLoading: false, error: authError.message });
        return false;
      }
      
      if (!authData.user) {
        console.log('❌ Auth Store: No user returned from auth');
        set({ isLoading: false, error: 'Authentication failed' });
        return false;
      }
      
      console.log('✅ Auth Store: Supabase auth successful, user ID:', authData.user.id);
      
      // Now get the user profile from our users table
      const user = await userService.getUserById(authData.user.id);
      
      if (!user) {
        console.log('❌ Auth Store: User profile not found in database');
        set({ isLoading: false, error: 'User profile not found' });
        return false;
      }

      // Set the current user
      set({ 
        user: user, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
      
      console.log('✅ Auth Store: Login successful:', user.name, user.email);
      return true;
    } catch (error) {
      console.error('❌ Auth Store: Login error:', error);
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
          console.log('📝 Auth Store: Starting signup process...', {
            email: userData.email,
            name: userData.name,
            userType
          });
          
          // First, create the auth user with Supabase Auth
          console.log('🔐 Auth Store: Creating Supabase auth user...');
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email!,
            password: password
          });
          
          if (authError) {
            console.log('❌ Auth Store: Supabase auth signup failed:', authError.message);
            throw new Error(authError.message);
          }
          
          if (!authData.user) {
            console.log('❌ Auth Store: No user returned from auth signup');
            throw new Error('Failed to create authentication account');
          }
          
          console.log('✅ Auth Store: Supabase auth user created:', authData.user.id);
          
          // Now create the user profile in our users table using the auth user ID
          console.log('👤 Auth Store: Creating user profile...');
          const newUser = await userService.createUser({
            ...userData,
            id: authData.user.id // Use the Supabase auth user ID
          }, userType);
          
          console.log('✅ Auth Store: User profile created successfully:', {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            userType: newUser.userType
          });
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
          
          console.log('✅ Auth Store: User logged in successfully');
        } catch (error) {
          console.error('❌ Auth Store: Signup failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error; // Re-throw so the UI can handle it
        }
      },
      
      logout: async () => {
        try {
          console.log('🚪 Auth Store: Logging out...');
          
          // Sign out from Supabase Auth
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('❌ Auth Store: Logout error:', error);
          }
          
          set({ user: null, isAuthenticated: false, error: null });
          console.log('✅ Auth Store: Logout successful');
        } catch (error) {
          console.error('❌ Auth Store: Logout failed:', error);
          // Still clear the local state even if logout fails
          set({ user: null, isAuthenticated: false, error: null });
        }
      },
      
      initialize: async () => {
        console.log('🚀 Auth Store: Initializing...');
        
        try {
          // Initialize database with sample data
          await initializeDatabase();
          console.log('✅ Auth Store: Database initialized successfully');
        } catch (error) {
          console.error('❌ Auth Store: Database initialization failed:', error);
        }
        
        // Check if user is already authenticated
        try {
          console.log('🔍 Auth Store: Checking existing session...');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Auth Store: Session check failed:', error);
          } else if (session?.user) {
            console.log('✅ Auth Store: Found existing session for user:', session.user.id);
            
            // Get user profile
            const user = await userService.getUserById(session.user.id);
            if (user) {
              console.log('✅ Auth Store: Restored user session:', user.name);
              set({ user, isAuthenticated: true });
            } else {
              console.log('⚠️ Auth Store: User profile not found, clearing session');
              await supabase.auth.signOut();
            }
          } else {
            console.log('ℹ️ Auth Store: No existing session found');
          }
        } catch (error) {
          console.error('❌ Auth Store: Session restoration failed:', error);
        }
        
        set({ isInitialized: true });
        console.log('✅ Auth Store: Initialization complete');
      },
      

      updateProfile: async (userData) => {
        console.log('🔍 Auth Store: updateProfile called with:', userData);
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }
          
          console.log('👤 Auth Store: Current user:', currentUser.id, currentUser.name);
          console.log('📝 Auth Store: Updating user with data:', userData);
          
          // Check if email is being changed
          const emailChanged = userData.email && userData.email !== currentUser.email;
          
          // If email is being changed, check if the new email is already taken
          if (emailChanged && userData.email) {
            console.log('📧 Auth Store: Email changed - checking if new email is available...');
            const existingUser = await userService.getUserByEmail(userData.email);
            if (existingUser && existingUser.id !== currentUser.id) {
              throw new Error('This email address is already in use by another account');
            }
          }
          
          // Create the updated user object more carefully
          const updatedUserData = {
            ...currentUser,
            ...userData,
            id: currentUser.id, // Ensure ID stays the same
            userType: currentUser.userType, // Ensure userType stays the same
            // Reset email verification if email changed
            ...(emailChanged && {
              isEmailVerified: false,
              emailVerifiedAt: undefined
            })
          };
          
          if (emailChanged) {
            console.log('📧 Auth Store: Email changed - resetting email verification status');
          }
          
          console.log('🔄 Auth Store: Final user data to send:', updatedUserData);
          
          // Update user in Supabase
          const updatedUser = await userService.updateUser(currentUser.id, updatedUserData);
          console.log('✅ Auth Store: User updated in database:', updatedUser);
          
          set({ user: updatedUser, isLoading: false });
          console.log('✅ Auth Store: Store state updated successfully');
        } catch (error) {
          console.error('❌ Auth Store: updateProfile failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error; // Re-throw so the UI can handle it
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

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          console.log('🔐 Auth Store: Password reset request for:', email);
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'homecook://reset-password-confirm'
          });
          
          if (error) {
            console.log('❌ Auth Store: Password reset failed:', error.message);
            set({ isLoading: false, error: error.message });
            throw new Error(error.message);
          }
          
          console.log('✅ Auth Store: Password reset email sent successfully');
          set({ isLoading: false });
        } catch (error) {
          console.error('❌ Auth Store: Password reset error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Password reset failed' 
          });
          throw error;
        }
      },
      
      updatePassword: async (password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          console.log('🔐 Auth Store: Updating password...');
          
          const { error } = await supabase.auth.updateUser({
            password: password
          });
          
          if (error) {
            console.log('❌ Auth Store: Password update failed:', error.message);
            set({ isLoading: false, error: error.message });
            throw new Error(error.message);
          }
          
          console.log('✅ Auth Store: Password updated successfully');
          set({ isLoading: false });
        } catch (error) {
          console.error('❌ Auth Store: Password update error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Password update failed' 
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
}));