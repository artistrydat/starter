import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, FlatList, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';

import { AppText, Button, SearchBar, TravelCard } from '@/src/components/ui';
import {
  useDestinations,
  useFavorites,
  useToggleFavorite,
  useSearchDestinations,
} from '@/src/hooks/destinationQueries';
import { TripItinerary } from '@/src/types/destinations';

// Define categories for filtering based on itinerary tags
const categories = [
  { id: 'all', label: 'All' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'historic', label: 'Historic' },
  { id: 'culinary', label: 'Food & Dining' },
  { id: 'beach', label: 'Beaches' },
  { id: 'modern', label: 'Modern' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'favorites', label: 'Favorites' },
];

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

  // Get destinations from the Zustand store - we'll always use mock data
  const { data: destinations = [], isLoading, error, refetch } = useDestinations(selectedCategory);

  // Fetch favorites using the updated React Query hook
  const { data: favorites = [] } = useFavorites();

  // Mutation for toggling favorites - also uses the updated pattern
  const { mutate: toggleFavorite } = useToggleFavorite();

  // Search hook - the search function internally accesses the store
  const { search } = useSearchDestinations();

  // Category selection handler
  const handleCategoryPress = (categoryId: string) => {
    if (searchQuery) {
      clearSearch();
    }

    setSelectedCategory(categoryId);

    // The refetch will trigger the query to run again
    // and the queryFn will use the correct data source
    refetch();
  };

  // Navigation handler updated to point to a valid route
  const navigateToCreateDestination = () => {
    // Navigate to the first itinerary as a default example
    router.push(`/second/itinerary/mock-itinerary-123`);
  };

  // Search handler
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    try {
      // The search function internally handles mock vs real data
      const results = await search(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search handler remains unchanged
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Favorite toggle handler now uses the mutation from React Query
  const handleToggleFavorite = (destinationId: string) => {
    toggleFavorite(destinationId);
  };

  // Determine which data to display (search results or destinations)
  const displayData =
    searchQuery && searchResults.length > 0
      ? searchResults
      : selectedCategory === 'favorites'
        ? destinations.filter((item) => favorites.includes(item.id))
        : destinations;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-gray-100 bg-quinary p-4 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <AppText size="2xl" weight="bold" color="primary">
            Plan your next adventure
          </AppText>

          {/* Floating Action Button */}
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

      {/* Rest of the component remains the same */}
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
          renderItem={({ item }: { item: TripItinerary }) => (
            <TravelCard
              destination={item}
              isFavorite={favorites.includes(item.id)}
              onFavoritePress={() => handleToggleFavorite(item.id)}
              onPress={() => router.push(`/second/itinerary/${item.id}`)}
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
