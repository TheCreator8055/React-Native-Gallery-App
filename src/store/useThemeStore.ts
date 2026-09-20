import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

import { useAuthStore } from './useAuthStore';

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  
  toggleTheme: async () => {
    const nextTheme = !get().isDark;
    set({ isDark: nextTheme });
    const user = useAuthStore.getState().user;
    if (user) {
      await AsyncStorage.setItem(`@theme_${user.email}`, nextTheme ? 'dark' : 'light');
    }
  },

  loadTheme: async () => {
    const user = useAuthStore.getState().user;
    if (user) {
      const saved = await AsyncStorage.getItem(`@theme_${user.email}`);
      if (saved) {
        set({ isDark: saved === 'dark' });
      } else {
        set({ isDark: false }); // Default for new users
      }
    }
  }
}));

export const lightColors = {
  background: '#F5F7FA',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#cccccc',
  borderLight: '#eeeeee',
  primary: '#007AFF',
  error: 'red',
  overlay: 'rgba(0,0,0,0.5)',
};

export const darkColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#AAAAAA',
  border: '#444444',
  borderLight: '#333333',
  primary: '#0A84FF',
  error: '#FF453A',
  overlay: 'rgba(255,255,255,0.1)',
};
