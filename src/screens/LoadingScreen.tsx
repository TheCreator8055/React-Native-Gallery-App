import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeStore, lightColors, darkColors } from '../store/useThemeStore';

const LOADING_TEXTS = [
  "Reticulating splines...",
  "Pixelating the pixels...",
  "Loading awesome photos...",
  "Why did the photographer get arrested? For flashing!",
  "Gathering inspiration...",
  "Developing the negatives...",
  "Focusing the lens...",
  "Just a second, finding the best lighting...",
];

export const LoadingScreen = () => {
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {LOADING_TEXTS[textIndex]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  spinner: {
    marginBottom: 20,
    transform: [{ scale: 1.5 }],
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
