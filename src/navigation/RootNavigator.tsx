import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ImageDetailScreen } from '../screens/Main/ImageDetailScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { AppStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { useGalleryStore } from '../store/useGalleryStore';
import { useThemeStore } from '../store/useThemeStore';

const AppStack = createStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="MainTabs" component={MainTabNavigator} />
      <AppStack.Screen name="ImageDetail" component={ImageDetailScreen} options={{ headerShown: true, title: 'Details' }} />
    </AppStack.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, loadSession } = useAuthStore();
  const { loadFavorites } = useGalleryStore();
  const { isDark } = useThemeStore();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const init = async () => {
      await loadSession();
      await loadFavorites();
      await useThemeStore.getState().loadTheme();
      
      // Artificially extend the loading phase to show the custom LoadingScreen
      setTimeout(() => {
        setIsReady(true);
      }, 3500);
    };
    init();
  }, [loadSession, loadFavorites]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={isDark ? NavDarkTheme : DefaultTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
