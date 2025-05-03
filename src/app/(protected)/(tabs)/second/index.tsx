import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, FlatList, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';

import { AppText, Button, SearchBar, TravelCard } from '@/src/components/ui';
import { DestinationCategory } from '@/src/types/destinations';
import { useDestinationStore } from '@/store/destinationStore';

const categories: DestinationCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'relaxing', label: 'Relaxing' },
];

export default function SecondScreen() {
  const router = useRouter();

  const {
    destinations,
    isLoading,
    error,
    favorites,
    selectedCategory,
    searchQuery,
    searchResults,
    isSearching,
    fetchDestinations,
    fetchFavorites,
    toggleFavorite,
    setSelectedCategory,
    setSearchQuery,
    searchDestinations,
    clearSearch,
  } = useDestinationStore();

  useEffect(() => {
    // Fetch destinations and user's favorites on component mount
    fetchDestinations();
    fetchFavorites();
  }, [fetchDestinations, fetchFavorites]);

  const handleCategoryPress = (categoryId: string) => {
    // Clear any active search when changing categories
    if (searchQuery) {
      clearSearch();
    }
    setSelectedCategory(categoryId);
  };

  const navigateToCreateDestination = () => {
    // This is where the floating action button will navigate
    // For now, we'll just go to the nested screen
    router.push('/second/nested');
  };

  const handleSearch = (query: string) => {
    searchDestinations(query);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  // Determine which data to show - search results or regular destinations
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
          onClear={handleClearSearch}
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

      {/* Destinations List */}
      {isLoading || isSearching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5BBFB5" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-4">
          <AppText color="error" size="lg" align="center">
            {error}
          </AppText>
          <Button
            title="Try Again"
            color="primary"
            size="lg"
            onPress={() =>
              searchQuery ? searchDestinations(searchQuery) : fetchDestinations(selectedCategory)
            }
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
              onFavoritePress={() => toggleFavorite(item.id)}
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
