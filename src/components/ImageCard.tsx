import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PicsumImage } from '../types/gallery';
import { useGalleryStore } from '../store/useGalleryStore';
import { useThemeStore, lightColors, darkColors } from '../store/useThemeStore';
import { Ionicons } from '@expo/vector-icons';

interface ImageCardProps {
  item: PicsumImage;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 16;

export const ImageCard: React.FC<ImageCardProps> = ({ item, onPress }) => {
  const { isFavorite, toggleFavorite } = useGalleryStore();
  const favorite = isFavorite(item.id);
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.download_url }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.detailsContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.author, { color: colors.text }]} numberOfLines={1}>{item.author}</Text>
          <Text style={[styles.id, { color: colors.textSecondary }]}>ID: {item.id}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons 
            name={favorite ? "heart" : "heart-outline"} 
            size={24} 
            color={favorite ? "#FF453A" : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    margin: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: cardWidth,
  },
  detailsContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  id: {
    fontSize: 12,
  },
  favoriteButton: {
    padding: 4,
  },
});
