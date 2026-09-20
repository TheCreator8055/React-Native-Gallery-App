import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { useGalleryStore } from '../../store/useGalleryStore';
import { ImageCard } from '../../components/ImageCard';
import { PicsumImage } from '../../types/gallery';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore, lightColors, darkColors } from '../../store/useThemeStore';

type FavoritesScreenNavigationProp = StackNavigationProp<AppStackParamList, 'MainTabs'>;

export const FavoritesScreen = () => {
  const { favorites } = useGalleryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;

  const filteredFavorites = useMemo(() => {
    if (!searchQuery) return favorites;
    return favorites.filter((img) => 
      img.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, searchQuery]);

  const navigateToDetail = (image: PicsumImage) => {
    navigation.navigate('ImageDetail', { image });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}>
        <TextInput
          placeholder="Search favorites by author..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ImageCard item={item} onPress={() => navigateToDetail(item)} />}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No favorites yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});
