import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from './src/store/useThemeStore';

export default function App() {
  const { loadTheme, isDark } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}
