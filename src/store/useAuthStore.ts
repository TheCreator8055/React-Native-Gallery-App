import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (userData) => {
    await AsyncStorage.setItem('@user_session', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
    // Load favorites and theme specific to the new user immediately
    const { useGalleryStore } = require('./useGalleryStore');
    await useGalleryStore.getState().loadFavorites();
    const { useThemeStore } = require('./useThemeStore');
    await useThemeStore.getState().loadTheme();
  },

  logout: async () => {
    await AsyncStorage.removeItem('@user_session');
    set({ user: null, isAuthenticated: false });
    
    // Clear user-specific states
    const { useGalleryStore } = require('./useGalleryStore');
    useGalleryStore.getState().clearFavorites();
    
    // Reset theme to light mode on logout for consistency across accounts
    const { useThemeStore } = require('./useThemeStore');
    const themeStore = useThemeStore.getState();
    if (themeStore.isDark) {
      themeStore.toggleTheme();
    }
  },

  loadSession: async () => {
    const session = await AsyncStorage.getItem('@user_session');
    if (session) {
      set({ user: JSON.parse(session), isAuthenticated: true });
    }
  },

  updateUser: async (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem('@user_session', JSON.stringify(updatedUser));
      
      // Also update the global registered_users array so changes persist across logins
      const storedUsersStr = await AsyncStorage.getItem('@registered_users');
      if (storedUsersStr) {
        let registeredUsers = JSON.parse(storedUsersStr);
        const index = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === updatedUser.email.toLowerCase());
        if (index !== -1) {
          registeredUsers[index] = updatedUser;
          await AsyncStorage.setItem('@registered_users', JSON.stringify(registeredUsers));
        }
      }
      
      set({ user: updatedUser });
    }
  }
}));
