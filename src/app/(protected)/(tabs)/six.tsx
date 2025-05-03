import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, Pressable } from 'react-native';

// Import components
import { TripOverview, TripItineraryTabs, WarningsInfo } from '@/src/components/destination';
import { LoadingState } from '@/src/components/destination/LoadingState';
import { AppText } from '@/src/components/ui';
import { mockItinerary } from '@/src/utils/mockItinerary';

// Custom tab interface
interface CustomTab {
  id: string;
  label: string;
  icon: string;
}

export default function DestinationDetailsScreen() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Custom tab items for the destination details
  const tabItems: CustomTab[] = [
    { id: 'overview', label: 'Overview', icon: '🧳' },
    { id: 'itinerary', label: 'Itinerary', icon: '📆' },
    { id: 'weather', label: 'Weather', icon: '☀️' },
    { id: 'awareness', label: 'Awareness', icon: '📝' },
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingState message="Loading trip details..." />;
  }

  // Direct rendering of the Weather section
  const renderWeatherSection = () => {
    return (
      <View className="flex-1">
        <View className="mb-6 rounded-xl bg-quinary p-4 shadow-sm">
          <AppText size="xl" weight="bold" color="primary" className="mb-4">
            Weather Forecast
          </AppText>

          <View className="mb-6 flex-row justify-between">
            {mockItinerary.weather.map((day) => (
              <View key={day.id} className="mx-1 flex-1 items-center rounded-xl bg-tertiary p-4">
                <AppText size="sm" weight="bold" color="text">
                  Day {day.day}
                </AppText>
                <MaterialCommunityIcons
                  name={(day.icon || 'weather-partly-cloudy') as any}
                  size={32}
                  color="#5BBFB5"
                />
                <AppText size="lg" weight="bold" color="primary">
                  {day.high_temp}°
                </AppText>
                <AppText size="xs" color="text">
                  {day.low_temp}°
                </AppText>
                <AppText size="xs" color="text" className="mt-1">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {mockItinerary.weather_overview && (
          <View className="rounded-xl bg-quinary p-4 shadow-sm">
            <AppText size="base" weight="bold" color="primary" className="mb-2">
              Trip Weather Overview
            </AppText>
            <AppText size="sm" color="text">
              {mockItinerary.weather_overview.description}
            </AppText>

            {mockItinerary.weather_overview.recommendations && (
              <View className="mt-4">
                <AppText size="base" weight="bold" color="primary" className="mb-2">
                  Recommendations
                </AppText>
                {mockItinerary.weather_overview.recommendations.map((recommendation) => (
                  <View key={recommendation.id} className="mb-2 flex-row items-center">
                    <MaterialCommunityIcons
                      name={(recommendation.icon || 'information') as any}
                      size={20}
                      color="#5BBFB5"
                      style={{ marginRight: 8 }}
                    />
                    <AppText size="sm" color="text">
                      {recommendation.text}
                    </AppText>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Update the destination title and location
  mockItinerary.title = 'Sample Trip to Bali';
  mockItinerary.destination = 'Bali, Indonesia';

  const handleShareActivity = () => {
    Alert.alert(
      'Invite Users',
      'This would open a modal to invite users to collaborate on this itinerary.'
    );
  };
  // Tabs for different sections of trip details
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TripOverview itinerary={mockItinerary} useMockData />;
      case 'itinerary':
        return <TripItineraryTabs itinerary={mockItinerary} useMockData />;
      case 'weather':
        return renderWeatherSection();
      case 'awareness':
        return (
          <WarningsInfo
            warnings={mockItinerary.warnings}
            packingItems={mockItinerary.packing_recommendation}
            generalTips={mockItinerary.general_tips}
          />
        );
      default:
        return <TripOverview itinerary={mockItinerary} useMockData />;
    }
  };

  // Custom tab bar implementation
  const renderCustomTabs = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          height: 140,
          justifyContent: 'space-between',
          marginHorizontal: 10,
        }}>
        {tabItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                backgroundColor: isActive ? '#5BBFB5' : '#f5f5f5',
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 5,
                paddingVertical: 15,
              }}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{tab.icon}</Text>
              <AppText size="sm" weight="medium" color={isActive ? 'white' : 'text'} align="center">
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Trip Details',
          headerShown: true,
        }}
      />

      <View className="bg-white pt-4">
        <AppText size="2xl" weight="semibold" color="primary" align="center">
          {mockItinerary.title}
        </AppText>
        <AppText size="lg" weight="normal" color="primary" align="center" className="opacity-90">
          {mockItinerary.destination}
        </AppText>
        <View className="mt-2 items-center">
          <Pressable onPress={handleShareActivity} hitSlop={10}>
            <MaterialCommunityIcons name="share-variant-outline" size={18} color="#78B0A8" />
          </Pressable>
        </View>
      </View>

      {renderCustomTabs()}

      <ScrollView className="flex-1 p-4">{renderTabContent()}</ScrollView>
    </View>
  );
}
