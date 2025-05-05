import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, FlatList, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';

import { AppText, Button, SearchBar, TravelCard } from '@/src/components/ui';
import { DestinationCategory, TripItinerary } from '@/src/types/destinations';
import {
  useDestinations,
  useFavorites,
  useToggleFavorite,
  useSearchDestinations,
} from '@/src/utils/destinationQueries';

// Hardcoded flag for toggling between mock data and real data
// Set to true for development with mock data, false for production with real data
const USE_MOCK_DATA = true;

// Define categories for filtering
const categories: DestinationCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'relaxing', label: 'Relaxing' },
];

// Mock favorites IDs
const MOCK_FAVORITES = ['mock-1', 'mock-3', 'mock-5'];

/**
 * SecondScreen Component
 * Handles fetching destinations and UI presentation
 * Follows the pattern from the guidelines, separating UI from data logic
 */
export default function SecondScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TripItinerary[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // For mock data mode: maintain local state for favorites
  const [mockFavorites, setMockFavorites] = useState(MOCK_FAVORITES);

  // Fetch destinations using React Query
  const {
    data: fetchedDestinations = [],
    isLoading,
    error,
    refetch,
  } = useDestinations(USE_MOCK_DATA, selectedCategory);

  // Fetch favorites using React Query (for non-mock mode)
  const { data: fetchedFavorites = [] } = useFavorites(USE_MOCK_DATA);

  // Mutation for toggling favorites
  const { mutate: toggleFavorite } = useToggleFavorite(USE_MOCK_DATA);

  // Search hook
  const { search } = useSearchDestinations(USE_MOCK_DATA);

  // Determine which data to use based on mock mode
  const destinations = fetchedDestinations;
  const favorites = USE_MOCK_DATA ? mockFavorites : fetchedFavorites;

  // Category selection handler
  const handleCategoryPress = (categoryId: string) => {
    if (searchQuery) {
      clearSearch();
    }
    setSelectedCategory(categoryId);
  };

  // Navigation handler
  const navigateToCreateDestination = () => {
    router.push('/second/nested');
  };

  // Search handler
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    try {
      const results = await search(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search handler
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Favorite toggle handler with mock support
  const handleToggleFavorite = (destinationId: string) => {
    if (USE_MOCK_DATA) {
      // Toggle favorite in mock data mode
      setMockFavorites((prev) =>
        prev.includes(destinationId)
          ? prev.filter((id) => id !== destinationId)
          : [...prev, destinationId]
      );
    } else {
      // Use React Query mutation for real data
      toggleFavorite(destinationId);
    }
  };

  // Determine which data to display (search results or destinations)
  const displayData = searchQuery && searchResults.length > 0 ? searchResults : destinations;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-gray-100 bg-quinary p-4 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <AppText size="2xl" weight="bold" color="primary">
            Plan your next adventure
          </AppText>

          {/* Floating Action Button in Header */}
          <TouchableOpacity
            onPress={navigateToCreateDestination}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm"
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Single Search Bar */}
        <SearchBar
          placeholder="Places to go, things to do, hotels..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onClear={clearSearch}
          isSearching={isSearching}
          className="shadow-sm"
        />

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 py-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryPress(category.id)}
              className={`mr-2 rounded-full border px-4 py-2 ${
                selectedCategory === category.id
                  ? 'border-primary bg-primary'
                  : 'border-gray-200 bg-white'
              }`}>
              <AppText
                color={selectedCategory === category.id ? 'white' : 'text'}
                weight={selectedCategory === category.id ? 'medium' : 'normal'}
                size="sm">
                {category.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Results Message */}
      {searchQuery && searchResults.length > 0 && (
        <View className="bg-tertiary px-4 py-2">
          <AppText size="sm" color="accent">
            Found {searchResults.length} results for "{searchQuery}"
          </AppText>
        </View>
      )}

      {/* No Results Message */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <View className="bg-tertiary px-4 py-2">
          <AppText size="sm" color="accent">
            No results found for "{searchQuery}"
          </AppText>
        </View>
      )}

      {/* Destinations List with Loading/Error States */}
      {isLoading || isSearching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5BBFB5" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-4">
          <AppText color="error" size="lg" align="center">
            {error instanceof Error ? error.message : String(error)}
          </AppText>
          <Button
            title="Try Again"
            color="primary"
            size="lg"
            onPress={() => refetch()}
            className="mt-4"
          />
        </View>
      ) : displayData.length === 0 && !searchQuery ? (
        <View className="flex-1 items-center justify-center p-4">
          <AppText size="lg" color="text" align="center">
            No destinations found in this category.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={displayData}
          renderItem={({ item }) => (
            <TravelCard
              destination={item}
              isFavorite={favorites.includes(item.id)}
              onFavoritePress={() => handleToggleFavorite(item.id)}
              onPress={() =>
                router.push({
                  pathname: '/second/nested',
                  params: { id: item.id },
                })
              }
              className="mx-4 mt-4"
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View className="h-24" />}
          contentContainerStyle={
            displayData.length === 0 ? { flex: 1, justifyContent: 'center' } : {}
          }
          ListEmptyComponent={
            searchQuery ? (
              <View className="flex-1 items-center justify-center p-4">
                <AppText size="lg" color="text" align="center">
                  No results match your search.
                </AppText>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
