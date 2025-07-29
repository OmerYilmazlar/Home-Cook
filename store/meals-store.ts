import { create } from 'zustand';
import { Meal } from '@/types';
import { mockMeals } from '@/mocks/meals';
import { useAuthStore } from './auth-store';

interface MealsState {
  meals: Meal[];
  filteredMeals: Meal[];
  selectedMeal: Meal | null;
  isLoading: boolean;
  error: string | null;
  cuisineFilter: string | null;
  ratingFilter: number | null;
  searchQuery: string;
  
  fetchMeals: () => Promise<void>;
  fetchMealById: (id: string) => Promise<void>;
  fetchMealsByCook: (cookId: string) => Promise<Meal[]>;
  createMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  decreaseMealQuantity: (mealId: string, quantity: number) => Promise<void>;
  updateMealRating: (mealId: string, newRating: number) => void;
  
  setCuisineFilter: (cuisine: string | null) => void;
  setRatingFilter: (rating: number | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

// Initialize with mock meals and maintain a persistent array
let persistentMeals = [...mockMeals];

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: persistentMeals,
  filteredMeals: persistentMeals,
  selectedMeal: null,
  isLoading: false,
  error: null,
  cuisineFilter: null,
  ratingFilter: null,
  searchQuery: '',
  
  fetchMeals: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the persistent meals array
      
      set({ 
        meals: [...persistentMeals], 
        filteredMeals: [...persistentMeals],
        isLoading: false 
      });
      
      // Apply any existing filters
      const { cuisineFilter, ratingFilter, searchQuery } = get();
      if (cuisineFilter || ratingFilter || searchQuery) {
        get().setCuisineFilter(cuisineFilter);
        get().setRatingFilter(ratingFilter);
        get().setSearchQuery(searchQuery);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch meals', 
        isLoading: false 
      });
    }
  },
  
  fetchMealById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const meal = persistentMeals.find(m => m.id === id);
      
      if (!meal) {
        throw new Error('Meal not found');
      }
      
      set({ selectedMeal: meal, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch meal', 
        isLoading: false 
      });
    }
  },
  
  fetchMealsByCook: async (cookId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use persistent meals array instead of mockMeals to include newly created meals
      const cookMeals = persistentMeals.filter(m => m.cookId === cookId);
      return cookMeals;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch cook meals', 
        isLoading: false 
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  createMeal: async (meal) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newMeal: Meal = {
        ...meal,
        id: `meal-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      

      
      // Add cuisine type to cook's profile if it's new
      const authStore = useAuthStore.getState();
      if (authStore.user && authStore.user.userType === 'cook') {
        authStore.addCuisineType(meal.cuisineType);
      }
      
      // Add to persistent meals array
      persistentMeals = [...persistentMeals, newMeal];
      
      set(state => {
        const updatedMeals = [...persistentMeals];
        
        // Apply current filters to include the new meal if it matches
        let updatedFilteredMeals = [...updatedMeals];
        const { cuisineFilter, ratingFilter, searchQuery } = state;
        
        // Apply cuisine filter
        if (cuisineFilter) {
          updatedFilteredMeals = updatedFilteredMeals.filter(meal => meal.cuisineType === cuisineFilter);
        }
        
        // Apply rating filter
        if (ratingFilter) {
          updatedFilteredMeals = updatedFilteredMeals.filter(meal => (meal.rating || 0) >= ratingFilter);
        }
        
        // Apply search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          updatedFilteredMeals = updatedFilteredMeals.filter(meal => 
            meal.name.toLowerCase().includes(query) || 
            meal.description.toLowerCase().includes(query)
          );
        }
        

        
        return {
          meals: updatedMeals,
          filteredMeals: updatedFilteredMeals,
          isLoading: false
        };
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create meal';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },
  
  updateMeal: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update persistent meals array
      persistentMeals = persistentMeals.map(meal => 
        meal.id === id ? { ...meal, ...updates } : meal
      );
      
      // Update cuisine type in cook's profile if it changed
      const authStore = useAuthStore.getState();
      if (authStore.user && authStore.user.userType === 'cook' && updates.cuisineType) {
        authStore.addCuisineType(updates.cuisineType);
      }
      
      set(state => {
        const updatedMeals = [...persistentMeals];
        
        const updatedFilteredMeals = state.filteredMeals.map(meal => 
          meal.id === id ? { ...meal, ...updates } : meal
        );
        
        const updatedSelectedMeal = 
          state.selectedMeal?.id === id 
            ? { ...state.selectedMeal, ...updates } 
            : state.selectedMeal;
        
        return { 
          meals: updatedMeals,
          filteredMeals: updatedFilteredMeals,
          selectedMeal: updatedSelectedMeal,
          isLoading: false 
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update meal';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },
  
  deleteMeal: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from persistent meals array
      persistentMeals = persistentMeals.filter(meal => meal.id !== id);
      
      set(state => ({ 
        meals: [...persistentMeals],
        filteredMeals: state.filteredMeals.filter(meal => meal.id !== id),
        selectedMeal: state.selectedMeal?.id === id ? null : state.selectedMeal,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete meal', 
        isLoading: false 
      });
    }
  },

  decreaseMealQuantity: async (mealId: string, quantity: number) => {
    try {
      console.log('Decreasing meal quantity:', { mealId, quantity });
      
      // Find and update meal in persistent array
      const mealIndex = persistentMeals.findIndex(meal => meal.id === mealId);
      if (mealIndex !== -1) {
        const currentQuantity = persistentMeals[mealIndex].availableQuantity;
        const newQuantity = Math.max(0, currentQuantity - quantity);
        
        persistentMeals[mealIndex] = {
          ...persistentMeals[mealIndex],
          availableQuantity: newQuantity
        };
        
        console.log('Meal quantity updated:', {
          mealId,
          previousQuantity: currentQuantity,
          newQuantity,
          decreasedBy: quantity
        });
        
        // Update state
        set(state => ({
          meals: [...persistentMeals],
          filteredMeals: state.filteredMeals.map(meal => 
            meal.id === mealId 
              ? { ...meal, availableQuantity: newQuantity }
              : meal
          ),
          selectedMeal: state.selectedMeal?.id === mealId 
            ? { ...state.selectedMeal, availableQuantity: newQuantity }
            : state.selectedMeal
        }));
      } else {
        console.warn('Meal not found for quantity decrease:', mealId);
      }
    } catch (error) {
      console.error('Failed to decrease meal quantity:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update meal quantity'
      });
    }
  },
  
  setCuisineFilter: (cuisine) => {
    set({ cuisineFilter: cuisine });
    
    const { meals, ratingFilter, searchQuery } = get();
    let filtered = [...meals];
    
    // Apply cuisine filter
    if (cuisine) {
      filtered = filtered.filter(meal => meal.cuisineType === cuisine);
    }
    
    // Apply rating filter if it exists
    if (ratingFilter) {
      filtered = filtered.filter(meal => (meal.rating || 0) >= ratingFilter);
    }
    
    // Apply search query if it exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(query) || 
        meal.description.toLowerCase().includes(query)
      );
    }
    
    set({ filteredMeals: filtered });
  },
  
  setRatingFilter: (rating) => {
    set({ ratingFilter: rating });
    
    const { meals, cuisineFilter, searchQuery } = get();
    let filtered = [...meals];
    
    // Apply rating filter
    if (rating) {
      filtered = filtered.filter(meal => (meal.rating || 0) >= rating);
    }
    
    // Apply cuisine filter if it exists
    if (cuisineFilter) {
      filtered = filtered.filter(meal => meal.cuisineType === cuisineFilter);
    }
    
    // Apply search query if it exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(query) || 
        meal.description.toLowerCase().includes(query)
      );
    }
    
    set({ filteredMeals: filtered });
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    
    const { meals, cuisineFilter, ratingFilter } = get();
    let filtered = [...meals];
    
    // Apply search query
    if (query) {
      const searchQuery = query.toLowerCase();
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchQuery) || 
        meal.description.toLowerCase().includes(searchQuery)
      );
    }
    
    // Apply cuisine filter if it exists
    if (cuisineFilter) {
      filtered = filtered.filter(meal => meal.cuisineType === cuisineFilter);
    }
    
    // Apply rating filter if it exists
    if (ratingFilter) {
      filtered = filtered.filter(meal => (meal.rating || 0) >= ratingFilter);
    }
    
    set({ filteredMeals: filtered });
  },
  
  clearFilters: () => {
    set({ 
      cuisineFilter: null, 
      ratingFilter: null, 
      searchQuery: '',
      filteredMeals: get().meals 
    });
  },

  updateMealRating: (mealId: string, newRating: number) => {
    // This is a simplified approach for demo purposes
    // In a real app, you'd aggregate all ratings and calculate average
    set(state => {
      const updatedMeals = state.meals.map(meal => {
        if (meal.id === mealId) {
          const currentReviewCount = meal.reviewCount || 0;
          const currentRating = meal.rating || 0;
          
          // Simple average calculation (in reality, you'd track all individual ratings)
          const newReviewCount = currentReviewCount + 1;
          const newAverageRating = currentReviewCount === 0 
            ? newRating 
            : ((currentRating * currentReviewCount) + newRating) / newReviewCount;
          
          return {
            ...meal,
            rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal
            reviewCount: newReviewCount
          };
        }
        return meal;
      });

      // Update persistent meals array
      persistentMeals = [...updatedMeals];

      return {
        meals: updatedMeals,
        filteredMeals: updatedMeals.filter(meal => {
          // Reapply current filters
          const { cuisineFilter, ratingFilter, searchQuery } = state;
          
          if (cuisineFilter && meal.cuisineType !== cuisineFilter) return false;
          if (ratingFilter && (meal.rating || 0) < ratingFilter) return false;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
              meal.name.toLowerCase().includes(query) ||
              meal.description.toLowerCase().includes(query) ||
              meal.cuisineType.toLowerCase().includes(query)
            );
          }
          
          return true;
        })
      };
    });
  },
}));