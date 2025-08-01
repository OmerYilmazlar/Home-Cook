import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType, Cook, Customer } from '@/types';

// Temporary inline mock data to fix the import issue
const tempMockUsers: (Cook | Customer)[] = [
  // Cook - Maria Rodriguez (only one cook now)
  {
    id: 'cook-1',
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    userType: 'cook',
    bio: 'Authentic Mexican cuisine made with love and traditional recipes passed down through generations.',
    location: {
      address: 'Mission District, San Francisco',
      latitude: 37.7749,
      longitude: -122.4194
    },
    rating: 0, // Reset to 0 reviews
    reviewCount: 0,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+1-555-0123',
    cuisineTypes: ['Mexican', 'Latin American'],
    availableForPickup: true
  } as Cook,
  
  // Customer - John Smith (only one customer now)
  {
    id: 'customer-1',
    name: 'John Smith',
    email: 'john@example.com',
    userType: 'customer',
    bio: 'Food enthusiast who loves discovering authentic homemade dishes from local cooks.',
    location: {
      address: 'SOMA, San Francisco',
      latitude: 37.7849,
      longitude: -122.4194
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+1-555-0124',
    favorites: []
  } as Customer
];

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
  addCuisineType: (cuisineType: string) => void;
  updateUserRating: (userId: string, newRating: number) => void;
  initialize: () => void;
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
      console.log('tempMockUsers available:', tempMockUsers ? 'YES' : 'NO');
      console.log('tempMockUsers length:', tempMockUsers?.length || 'undefined');
      
      // Find user by email
      const user = tempMockUsers?.find(u => u.email === email);
      
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
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if email already exists
          const existingUser = tempMockUsers.find(u => u.email === userData.email);
          
          if (existingUser) {
            throw new Error('Email already in use');
          }
          
          // Create new user
          const newUser: User = {
            id: `new-${Date.now()}`,
            name: userData.name || '',
            email: userData.email || '',
            userType,
            ...userData,
          };
          
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
      
      initialize: () => {
        console.log('Auth store initializing...');
        
        // For development, don't auto-login - let users login manually
        set({ isInitialized: true });
        
        console.log('Auth store initialized without auto-login');
      },
      

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }
          
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      addCuisineType: (cuisineType) => {
        const currentUser = get().user;
        if (!currentUser || currentUser.userType !== 'cook') {
          return;
        }
        
        const cookUser = currentUser as Cook;
        const existingCuisines = cookUser.cuisineTypes || [];
        
        if (!existingCuisines.includes(cuisineType)) {
          const updatedUser: Cook = {
            ...cookUser,
            cuisineTypes: [...existingCuisines, cuisineType]
          };
          set({ user: updatedUser });
        }
      },
      
      updateUserRating: (userId: string, newRating: number) => {
        // Find the user to update in tempMockUsers
        const userIndex = tempMockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          console.error('User not found for rating update:', userId);
          return;
        }
        
        const userToUpdate = tempMockUsers[userIndex];
        
        // Calculate new average rating
        const currentRating = userToUpdate.rating || 0;
        const currentReviewCount = userToUpdate.reviewCount || 0;
        const newReviewCount = currentReviewCount + 1;
        
        // Calculate weighted average
        const totalRatingPoints = (currentRating * currentReviewCount) + newRating;
        const newAverageRating = totalRatingPoints / newReviewCount;
        
        const updatedUser = {
          ...userToUpdate,
          rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
          reviewCount: newReviewCount
        };
        
        // Update in tempMockUsers for persistence
        tempMockUsers[userIndex] = updatedUser;
        
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
      },
}));