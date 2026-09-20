import React, { useState, useMemo, useEffect } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useFetchImages } from '../../hooks/useFetchImages';
import { useDebounce } from '../../hooks/useDebounce';
import { ImageCard } from '../../components/ImageCard';
import { Dropdown } from '../../components/Dropdown';
import { PicsumImage } from '../../types/gallery';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore, lightColors, darkColors } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'MainTabs'>;

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  
  const quotes = [
    "Ready to discover some amazing photos?",
    "Let's find some inspiration today.",
    "A picture is worth a thousand words.",
    "What will you explore today?",
    "Capture the moments that matter."
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return { greeting: `${greeting}, ${name.split(' ')[0]}!`, quote: randomQuote };
};

export const HomeScreen = () => {
  const { images, loading, refreshing, loadMore, handleRefresh, fetchImages } = useFetchImages();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [filterMode, setFilterMode] = useState<'ALL' | 'A-M' | 'N-Z'>('ALL');
  const [sortMode, setSortMode] = useState<'NONE' | 'A-Z' | 'Z-A'>('NONE');
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;
  const { user } = useAuthStore();
  
  const [welcomeText, setWelcomeText] = useState({ greeting: '', quote: '' });

  useEffect(() => {
    fetchImages(1);
    if (user?.fullName) {
      setWelcomeText(getGreeting(user.fullName));
    }
  }, [fetchImages, user]);

  const filteredAndSortedImages = useMemo(() => {
    // 1. Filter
    let result = images.filter((img) => {
      const matchesSearch = img.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const firstChar = img.author.trim().toUpperCase()[0];
      let matchesFilter = true;
      if (filterMode === 'A-M') {
        matchesFilter = firstChar >= 'A' && firstChar <= 'M';
      } else if (filterMode === 'N-Z') {
        matchesFilter = firstChar >= 'N' && firstChar <= 'Z';
      }

      return matchesSearch && matchesFilter;
    });

    // 2. Sort
    if (sortMode === 'A-Z') {
      result.sort((a, b) => a.author.trim().localeCompare(b.author.trim(), undefined, { sensitivity: 'base' }));
    } else if (sortMode === 'Z-A') {
      result.sort((a, b) => b.author.trim().localeCompare(a.author.trim(), undefined, { sensitivity: 'base' }));
    }

    return result;
  }, [images, debouncedSearchQuery, filterMode, sortMode]);

  const navigateToDetail = (image: PicsumImage) => {
    navigation.navigate('ImageDetail', { image });
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}>
      
      <View style={styles.greetingContainer}>
        <Text style={[styles.greetingText, { color: colors.text }]}>{welcomeText.greeting || 'Welcome!'}</Text>
        <Text style={[styles.quoteText, { color: colors.textSecondary }]}>{welcomeText.quote}</Text>
      </View>

      <TextInput
        placeholder="Search by author..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
      />
      <View style={styles.controlsContainer}>
        <View style={styles.controlWrapper}>
          <Dropdown
            label="Filter Author"
            options={['ALL', 'A-M', 'N-Z']}
            selectedValue={filterMode}
            onSelect={(v) => setFilterMode(v as 'ALL' | 'A-M' | 'N-Z')}
          />
        </View>
        <View style={styles.controlWrapper}>
          <Dropdown
            label="Sort Author"
            options={['NONE', 'A-Z', 'Z-A']}
            selectedValue={sortMode}
            onSelect={(v) => setSortMode(v as 'NONE' | 'A-Z' | 'Z-A')}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={filteredAndSortedImages}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <ImageCard item={item} onPress={() => navigateToDetail(item)} />}
        numColumns={2}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{ marginHorizontal: -8, marginBottom: 8 }}
        ListEmptyComponent={
          loading && images.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={{ color: colors.text }}>No images found.</Text>
            </View>
          )
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
    paddingTop: 24,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    zIndex: 2,
    gap: 12,
  },
  controlWrapper: {
    flex: 1,
  },
  listContainer: {
    padding: 8,
  },
  centerContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
