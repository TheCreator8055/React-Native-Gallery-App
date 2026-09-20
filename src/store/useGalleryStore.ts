import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PicsumImage } from '../types/gallery';
import { useAuthStore } from './useAuthStore';

interface GalleryState {
  favorites: PicsumImage[];
  loadFavorites: () => Promise<void>;
  toggleFavorite: (image: PicsumImage) => Promise<void>;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  favorites: [],
  
  clearFavorites: () => set({ favorites: [] }),
  
  loadFavorites: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      const storedFavorites = await AsyncStorage.getItem(`@favorites_${user.email}`);
      if (storedFavorites) {
        set({ favorites: JSON.parse(storedFavorites) });
      } else {
        set({ favorites: [] });
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  },

  toggleFavorite: async (image) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      const currentFavorites = get().favorites;
      const isFav = currentFavorites.some(fav => fav.id === image.id);
      
      let updatedFavorites = [];
      if (isFav) {
        updatedFavorites = currentFavorites.filter(fav => fav.id !== image.id);
      } else {
        updatedFavorites = [...currentFavorites, image];
      }
      
      await AsyncStorage.setItem(`@favorites_${user.email}`, JSON.stringify(updatedFavorites));
      set({ favorites: updatedFavorites });
    } catch (e) {
      console.error('Failed to save favorite', e);
    }
  },

  isFavorite: (id) => {
    return get().favorites.some(fav => fav.id === id);
  }
}));
