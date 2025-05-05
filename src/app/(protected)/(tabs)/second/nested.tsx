import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Alert } from 'react-native';

import { LoadingState } from '@/src/components/destination/LoadingState';
import { TripItineraryTabs } from '@/src/components/destination/TripItineraryTabs';
import { TripOverview } from '@/src/components/destination/TripOverview';
import { WarningsInfo } from '@/src/components/destination/WarningsInfo';
import { WeatherInfo } from '@/src/components/destination/WeatherInfo';
import { AppText, Button, Tabs } from '@/src/components/ui';
import { PermissionType } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';
import { useTripStore } from '@/store/tripStore';

interface ShareStoreType {
  shareItinerary: (itineraryId: string, email: string, permission: PermissionType) => Promise<void>;
}

// Mock implementation of useShareStore for demo purposes
const useShareStore = (): ShareStoreType => {
  return {
    shareItinerary: async (itineraryId, email, permission) => {
      console.log(`Mock sharing itinerary ${itineraryId} with ${email} as ${permission}`);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      Alert.alert('Shared!', `Itinerary shared with ${email}`);
    },
  };
};

export default function SecondNestedScreen({ useMockData = true }: { useMockData?: boolean }) {
  // State for active main section tab
  const [activeSection, setActiveSection] = useState('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);

  // Use itinerary store
  const { currentItinerary, isLoading, error, fetchItinerary } = useTripStore();
  const { shareItinerary } = useShareStore();

  // Fetch itinerary on mount - using a mock ID for now
  useEffect(() => {
    // In a real app, this would likely come from a route param
    const itineraryId = 'mock-itinerary-123';
    console.log('Fetching itinerary with ID:', itineraryId);
    fetchItinerary(itineraryId)
      .then((result: any) => {
        console.log('Itinerary fetch result:', result ? 'Success' : 'Failed');
      })
      .catch((err: Error) => {
        console.error('Error in itinerary fetch effect:', err);
      });
  }, [fetchItinerary]);

  // Get data - either from store or fallback to mock data
  const itineraryData = useMockData && !currentItinerary ? mockItinerary : currentItinerary;

  // Main section tabs
  const sectionTabs = [
    { id: 'overview', label: 'Overview', icon: '🧳' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗓' },
    { id: 'weather', label: 'Weather', icon: '🌦' },
    { id: 'aware', label: 'Awareness', icon: '📝' },
  ];

  // Render content based on active section tab
  const renderSectionContent = () => {
    if (isLoading && !useMockData) {
      return <LoadingState />;
    }

    if (error && !useMockData) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Button
            title="Try Again"
            color="primary"
            size="lg"
            onPress={() => fetchItinerary('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d')}
            className="mt-4"
          />
        </View>
      );
    }

    if (!itineraryData) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="information-outline" size={48} color="#FFD166" />
        </View>
      );
    }

    switch (activeSection) {
      case 'overview':
        return <TripOverview itinerary={itineraryData} />;
      case 'itinerary':
        return <TripItineraryTabs itinerary={itineraryData} />;
      case 'weather':
        // Make sure weather data exists
        if (!itineraryData.weather || !itineraryData.weather_overview) {
          return (
            <View className="flex-1 items-center justify-center p-4">
              <AppText size="lg" color="text" align="center">
                Weather data is not available for this itinerary.
              </AppText>
            </View>
          );
        }
        return (
          <WeatherInfo
            weatherData={itineraryData.weather}
            weatherOverview={itineraryData.weather_overview}
          />
        );
      case 'aware':
        // Make sure awareness data exists
        if (
          !itineraryData.warnings ||
          !itineraryData.packing_recommendation ||
          !itineraryData.general_tips
        ) {
          return (
            <View className="flex-1 items-center justify-center p-4">
              <AppText size="lg" color="text" align="center">
                Travel advisories and packing information are not available for this itinerary.
              </AppText>
            </View>
          );
        }
        return (
          <WarningsInfo
            warnings={itineraryData.warnings}
            packingRecommendations={itineraryData.packing_recommendation}
            generalTips={itineraryData.general_tips}
          />
        );
      default:
        return null;
    }
  };

  // Handle sharing itinerary with other users
  const handleShareItinerary = async (email: string, permission: PermissionType) => {
    if (!itineraryData) return;

    try {
      setIsInviting(true);
      // Since shareItinerary returns void (Promise<void>), we don't need to check the result
      await shareItinerary(itineraryData.id, email, permission);
      setInviteEmail('');
      setShowShareForm(false);
      // Could show a success message here
    } catch (error) {
      console.error('Error sharing itinerary:', error);
      Alert.alert('Error', 'Failed to share the itinerary. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  if (!itineraryData && !isLoading && !useMockData) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText size="lg" weight="medium" color="text" className="text-center">
          No itinerary found
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-quinary">
      {/* Header with trip title */}
      <View className="rounded-b-xl px-4 py-6 shadow-sm">
        <AppText size="2xl" weight="semibold" color="primary" align="center">
          {itineraryData?.title || 'Trip Itinerary'}
        </AppText>
        <AppText size="lg" weight="normal" color="primary" align="center" className="opacity-90">
          {itineraryData?.location || 'Destination'}
        </AppText>

        {/* Action Buttons */}
        {itineraryData && (
          <View className="mt-4 flex-row justify-center">
            <Button
              title={showShareForm ? 'Cancel Sharing' : 'Share Itinerary'}
              color="secondary"
              size="sm"
              onPress={() => setShowShareForm(!showShareForm)}
              className="mx-2"
            />
          </View>
        )}
      </View>

      {/* Share Form */}
      {showShareForm && itineraryData && (
        <View className="mx-4 my-2 rounded-lg bg-white p-4 shadow-sm">
          <TextInput
            className="mb-2 rounded-md border border-gray-300 p-2"
            placeholder="Email address"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className="mt-2 flex-row justify-between">
            <Button
              title={isInviting ? 'Sharing...' : 'Share as Viewer'}
              color="secondary"
              size="sm"
              onPress={() => handleShareItinerary(inviteEmail, PermissionType.View)}
              disabled={!inviteEmail.trim() || isInviting}
              className="mr-2 flex-1"
            />
            <Button
              title={isInviting ? 'Sharing...' : 'Share as Editor'}
              color="primary"
              size="sm"
              onPress={() => handleShareItinerary(inviteEmail, PermissionType.Edit)}
              disabled={!inviteEmail.trim() || isInviting}
              className="ml-2 flex-1"
            />
          </View>
        </View>
      )}

      {/* Main section tabs */}
      <View>
        <Tabs
          items={sectionTabs}
          activeTab={activeSection}
          onTabChange={setActiveSection}
          variant="pills"
          size="md"
          className="mt-2 px-2"
        />
      </View>

      {/* Content area */}
      <ScrollView className="flex-1 p-4">{renderSectionContent()}</ScrollView>
    </View>
  );
}
