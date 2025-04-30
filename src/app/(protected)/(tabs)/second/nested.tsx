import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';

import {
  TripItineraryTabs,
  TripOverview,
  WeatherInfo,
  WarningsInfo,
} from '@/src/components/destination';
import { AppText, Tabs, Button } from '@/src/components/ui';
import { supabase } from '@/src/utils/supabaseClient';
import { useItineraryStore } from '@/store/itineraryStore';

export default function SecondNestedScreen() {
  // State for active main section tab
  const [activeSection, setActiveSection] = useState('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Use itinerary store
  const { currentItinerary, isLoading, error, fetchItinerary, shareItinerary } =
    useItineraryStore();

  // Fetch itinerary on mount - using a mock ID for now
  useEffect(() => {
    // In a real app, this would likely come from a route param
    const itineraryId = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d';
    console.log('Fetching itinerary with ID:', itineraryId);
    fetchItinerary(itineraryId)
      .then((result) => {
        console.log('Itinerary fetch result:', result ? 'Success' : 'Failed');
      })
      .catch((err) => {
        console.error('Error in itinerary fetch effect:', err);
      });
  }, [fetchItinerary]);

  // Main section tabs
  const sectionTabs = [
    { id: 'overview', label: 'Overview', icon: '🧳' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗓' },
    { id: 'weather', label: 'Weather', icon: '🌦' },
    { id: 'aware', label: 'Awareness', icon: '📝' },
  ];

  // Render content based on active section tab
  const renderSectionContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5BBFB5" />
          <AppText size="sm" color="text" className="mt-2">
            Loading itinerary...
          </AppText>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <AppText size="lg" weight="medium" color="text" className="mt-2 text-center">
            Error loading itinerary
          </AppText>
          <AppText size="sm" color="text" className="mt-1 text-center">
            {error}
          </AppText>
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

    if (!currentItinerary) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="information-outline" size={48} color="#FFD166" />
          <AppText size="lg" weight="medium" color="text" className="mt-2 text-center">
            No itinerary data available
          </AppText>
        </View>
      );
    }

    switch (activeSection) {
      case 'overview':
        return <TripOverview itinerary={currentItinerary} />;
      case 'itinerary':
        return <TripItineraryTabs itinerary={currentItinerary} />;
      case 'weather':
        // Make sure weather data exists
        if (!currentItinerary.weather || !currentItinerary.weather_overview) {
          return (
            <View className="flex-1 items-center justify-center p-4">
              <AppText size="lg" color="text" align="center">
                Weather information is not available.
              </AppText>
            </View>
          );
        }
        return (
          <WeatherInfo
            weather={currentItinerary.weather}
            weatherOverview={currentItinerary.weather_overview}
          />
        );
      case 'aware':
        // Make sure awareness data exists
        if (
          !currentItinerary.warnings ||
          !currentItinerary.packing_recommendation ||
          !currentItinerary.general_tips
        ) {
          return (
            <View className="flex-1 items-center justify-center p-4">
              <AppText size="lg" color="text" align="center">
                Travel advisory information is not available.
              </AppText>
            </View>
          );
        }
        return (
          <WarningsInfo
            warnings={currentItinerary.warnings}
            packingItems={currentItinerary.packing_recommendation}
            generalTips={currentItinerary.general_tips}
          />
        );
      default:
        return null;
    }
  };

  // Handle sharing itinerary with other users
  const handleShareItinerary = async (email: string, permission: 'view' | 'edit') => {
    if (!currentItinerary) return;

    setIsInviting(true);
    try {
      const result = await shareItinerary(currentItinerary.id, email, permission);
      if (result) {
        // Could show a success message
      }
    } catch (error) {
      console.error('Error sharing itinerary:', error);
    } finally {
      setIsInviting(false);
    }
  };

  if (!currentItinerary && !isLoading) {
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
          {currentItinerary?.title || 'Loading...'}
        </AppText>
        <AppText size="lg" weight="normal" color="primary" align="center" className="opacity-90">
          {currentItinerary?.destination || ''}
        </AppText>
      </View>

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
