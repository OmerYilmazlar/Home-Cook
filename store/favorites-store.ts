import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cook } from '@/types';

interface FavoritesState {
  favoriteCooks: Cook[];
  addFavoriteCook: (cook: Cook) => void;
  removeFavoriteCook: (cookId: string) => void;
  isFavoriteCook: (cookId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteCooks: [],
      
      addFavoriteCook: (cook: Cook) => {
        const { favoriteCooks } = get();
        const isAlreadyFavorite = favoriteCooks.some(favCook => favCook.id === cook.id);
        
        if (!isAlreadyFavorite) {
          set({ favoriteCooks: [...favoriteCooks, cook] });
          console.log('Added cook to favorites:', cook.name);
        }
      },
      
      removeFavoriteCook: (cookId: string) => {
        const { favoriteCooks } = get();
        const updatedFavorites = favoriteCooks.filter(cook => cook.id !== cookId);
        set({ favoriteCooks: updatedFavorites });
        console.log('Removed cook from favorites:', cookId);
      },
      
      isFavoriteCook: (cookId: string) => {
        const { favoriteCooks } = get();
        return favoriteCooks.some(cook => cook.id === cookId);
      },
      
      clearFavorites: () => {
        set({ favoriteCooks: [] });
        console.log('Cleared all favorite cooks');
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);