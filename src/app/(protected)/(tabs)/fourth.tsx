import { useRouter } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';

import { PreferenceTabs } from '@/src/components/onboarding';
import { AppText, Button, Container, TravelCard } from '@/src/components/ui';
import { sections } from '@/src/types/preferences';
import { AuthContext } from '@/src/utils/authContext';
import { useDestinationStore } from '@/store/destinationStore';
import { useItineraryStore } from '@/store/itineraryStore';
import { useTravelPreferencesStore } from '@/store/store';

export default function FourthScreen() {
  const router = useRouter();
  const authState = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<keyof typeof sections>('travel_vibe');

  // New state for content tabs
  const [activeContentTab, setActiveContentTab] = useState<'itineraries' | 'favorites'>(
    'itineraries'
  );

  // Get preferences data
  const { preferences, isLoading: preferencesLoading } = useTravelPreferencesStore();

  // Get itineraries and destinations from stores
  const {
    userItineraries,
    fetchUserItineraries,
    isLoading: itinerariesLoading,
  } = useItineraryStore();

  const {
    destinations,
    fetchDestinations,
    fetchFavorites,
    favorites,
    isLoading: destinationsLoading,
    isFavoritesLoading,
  } = useDestinationStore();

  // Fetch data on component mount
  useEffect(() => {
    console.log('FourthScreen - Fetching user data');
    fetchUserItineraries().catch((err) => console.error('Error fetching itineraries:', err));
    fetchDestinations().catch((err) => console.error('Error fetching destinations:', err));
    fetchFavorites().catch((err) => console.error('Error fetching favorites:', err));
  }, []);

  // Get favorite destinations with safety checks
  const favoriteDestinations = destinations.filter((dest) => dest && favorites.includes(dest.id));

  // Render itinerary item with safety checks
  const renderItineraryItem = ({ item }) => {
    if (!item || !item.id) {
      return null;
    }

    return (
      <TouchableOpacity
        className="mb-4"
        onPress={() => router.push(`/modal-with-stack?itineraryId=${item.id}`)}>
        <TravelCard
          title={item.destination_name || 'Unknown Location'}
          location={item.destination_name || 'Unknown Location'}
          image={
            item.cover_image ||
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200'
          }
          tags={[]}
          rating={0}
          priceLevel={0}
        />
      </TouchableOpacity>
    );
  };

  // Render destination item with safety checks
  const renderDestinationItem = ({ item }) => {
    if (!item || !item.id) {
      return null;
    }

    return (
      <TouchableOpacity
        className="mb-4"
        onPress={() => router.push(`/modal?destinationId=${item.id}`)}>
        <TravelCard
          title={item.title || 'Unnamed Destination'}
          location={item.location || 'Unknown Location'}
          image={
            item.image_url ||
            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200'
          }
          tags={item.tags || []}
          rating={item.rating}
          priceLevel={item.price_level}
          isFavorite={favorites.includes(item.id)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Container className="flex-1 bg-quinary">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pb-2">
          <AppText size="3xl" weight="bold" color="primary" align="center">
            Your Travel Profile ✈️
          </AppText>
          <AppText size="lg" color="primary" className="mt-2 text-center opacity-80">
            Here's how you like to travel
          </AppText>
        </View>

        {/* Preferences section */}
        <View className="mb-6">
          <PreferenceTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {preferencesLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : (
            <View className="py-2">
              {/* Show edit preferences button for quick access */}
              <View className="my-2 items-center">
                <Button
                  title="Edit Preferences"
                  color="secondary"
                  size="sm"
                  onPress={() => router.push('/onboarding/preferences')}
                />
              </View>
            </View>
          )}
        </View>

        {/* Content tabs section */}
        <View className="mb-2 mt-4 flex-row justify-center">
          <TouchableOpacity
            className={`mx-2 rounded-full px-4 py-2 ${activeContentTab === 'itineraries' ? 'bg-primary' : 'bg-gray-200'}`}
            onPress={() => setActiveContentTab('itineraries')}>
            <AppText color={activeContentTab === 'itineraries' ? 'white' : 'primary'}>
              My Itineraries
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`mx-2 rounded-full px-4 py-2 ${activeContentTab === 'favorites' ? 'bg-primary' : 'bg-gray-200'}`}
            onPress={() => setActiveContentTab('favorites')}>
            <AppText color={activeContentTab === 'favorites' ? 'white' : 'primary'}>
              My Favorites
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        <View className="flex-1 px-4" style={{ minHeight: 300 }}>
          {activeContentTab === 'itineraries' ? (
            itinerariesLoading ? (
              <View className="flex-1 items-center justify-center" style={{ height: 200 }}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : userItineraries && userItineraries.length > 0 ? (
              <FlatList
                data={userItineraries}
                keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                renderItem={renderItineraryItem}
                scrollEnabled={false}
                contentContainerStyle={{ paddingVertical: 16 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center" style={{ height: 200 }}>
                <AppText size="lg" color="secondary" className="text-center">
                  You haven't created any itineraries yet.
                </AppText>
                <Button
                  title="Create Itinerary"
                  color="primary"
                  size="sm"
                  className="mt-4"
                  onPress={() => router.push('/modal-with-stack')}
                />
              </View>
            )
          ) : isFavoritesLoading || destinationsLoading ? (
            <View className="flex-1 items-center justify-center" style={{ height: 200 }}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : favoriteDestinations && favoriteDestinations.length > 0 ? (
            <FlatList
              data={favoriteDestinations}
              keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
              renderItem={renderDestinationItem}
              scrollEnabled={false}
              contentContainerStyle={{ paddingVertical: 16 }}
            />
          ) : (
            <View className="flex-1 items-center justify-center" style={{ height: 200 }}>
              <AppText size="lg" color="secondary" className="text-center">
                You haven't added any favorites yet.
              </AppText>
              <Button
                title="Explore Destinations"
                color="primary"
                size="sm"
                className="mt-4"
                onPress={() => router.push('/(home)')}
              />
            </View>
          )}
        </View>

        <View className="space-y-4 p-6">
          <Button title="Back" color="secondary" size="sm" onPress={() => router.back()} />
          <Button title="Log out!" onPress={authState.logOut} color="primary" size="sm" />
        </View>
      </ScrollView>
    </Container>
  );
}
