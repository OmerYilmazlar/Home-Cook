import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType } from '@/types';
import { mockCooks, mockCustomers } from '@/mocks/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User>, password: string, userType: UserType) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  addCuisineType: (cuisineType: string) => void;
  initialize: () => void;
  switchToTestCook: () => void;
  switchToTestCustomer: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: true, // Set to true by default for now
  error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find user in mock data
          const allUsers = [...mockCooks, ...mockCustomers];
          const user = allUsers.find(u => u.email === email);
          
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          // In a real app, we would verify the password here
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      signup: async (userData, password, userType) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if email already exists
          const allUsers = [...mockCooks, ...mockCustomers];
          const existingUser = allUsers.find(u => u.email === userData.email);
          
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
        
        // For development: Auto-login as a cook to test cook features
        const testCook = mockCooks.find(c => c.id === '1'); // Maria Garcia
        if (testCook) {
          set({ 
            user: testCook, 
            isAuthenticated: true, 
            isInitialized: true 
          });
          console.log('Auto-logged in as test cook:', testCook.name);
        } else {
          set({ isInitialized: true });
        }
        
        console.log('Auth store initialized');
      },
      
      switchToTestCook: () => {
        const testCook = mockCooks.find(c => c.id === '1'); // Maria Garcia
        if (testCook) {
          set({ user: testCook, isAuthenticated: true });
          console.log('Switched to test cook:', testCook.name);
        }
      },
      
      switchToTestCustomer: () => {
        const testCustomer = mockCustomers.find(c => c.id === '101'); // Alex Johnson
        if (testCustomer) {
          set({ user: testCustomer, isAuthenticated: true });
          console.log('Switched to test customer:', testCustomer.name);
        }
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
        
        const cookUser = currentUser as any;
        const existingCuisines = cookUser.cuisineTypes || [];
        
        if (!existingCuisines.includes(cuisineType)) {
          const updatedUser = {
            ...cookUser,
            cuisineTypes: [...existingCuisines, cuisineType]
          };
          set({ user: updatedUser });
        }
      },
}));