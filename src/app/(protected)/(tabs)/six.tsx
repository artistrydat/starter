import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';

// Import components
import { TripOverview, TripItineraryTabs, WarningsInfo } from '@/src/components/destination';
import { LoadingState } from '@/src/components/destination/LoadingState';
import { AppText } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';
import { supabase } from '@/src/utils/supabaseClient';

// Custom tab interface
interface CustomTab {
  id: string;
  label: string;
  icon: string;
}

// Define a default itinerary ID to use if none is provided via params
const DEFAULT_ITINERARY_ID = '8e94475e-cb1f-54ff-96d0-738e6d9fc97d';

export default function DestinationDetailsScreen() {
  // Get the ID from params or use the default ID
  const params = useLocalSearchParams();
  const paramId = typeof params.id === 'string' ? params.id : undefined;
  const itineraryId = paramId || DEFAULT_ITINERARY_ID;

  // State variables
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tripData, setTripData] = useState<TripItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Custom tab items for the destination details
  const tabItems: CustomTab[] = [
    { id: 'overview', label: 'Overview', icon: '🧳' },
    { id: 'itinerary', label: 'Itinerary', icon: '📆' },
    { id: 'weather', label: 'Weather', icon: '☀️' },
    { id: 'awareness', label: 'Awareness', icon: '📝' },
  ];

  // Helper to add debug logs
  const addDebugLog = (message: string) => {
    console.log(`[DEBUG] ${message}`);
    setDebugInfo((prev) => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  const fetchItinerary = async () => {
    try {
      addDebugLog(`Starting data fetch for itinerary: ${itineraryId}`);

      // 1. Fetch core itinerary data with trip days and activities
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('trip_itineraries')
        .select(
          `
          id,
          title,
          destination,
          description,
          image_url,
          total_cost,
          currency,
          user_id,
          created_at,
          updated_at,
          start_date,
          end_date,
          trip_days (
            id,
            day_number,
            date,
            created_at,
            itinerary_id,
            trip_activities (
              id,
              name,
              time,
              description,
              location,
              cost,
              currency,
              category,
              icon,
              created_at,
              day_id
            )
          )
        `
        )
        .eq('id', itineraryId)
        .single();

      if (itineraryError) {
        addDebugLog(`Itinerary fetch error: ${itineraryError.message}`);
        throw itineraryError;
      }

      addDebugLog(`Core itinerary data fetched successfully for: ${itineraryData.title}`);

      // 2. Fetch weather data
      addDebugLog(`Fetching weather data...`);
      const { data: weatherData, error: weatherError } = await supabase
        .from('trip_weather')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (weatherError) {
        addDebugLog(`Weather fetch error: ${weatherError.message}`);
      } else {
        addDebugLog(`Fetched ${weatherData?.length || 0} weather records`);
      }

      // 3. Fetch weather overview information
      addDebugLog(`Fetching weather overview...`);
      const { data: weatherOverview, error: overviewError } = await supabase
        .from('weather_overviews')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .single();

      if (overviewError && overviewError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is OK - we'll handle null data
        addDebugLog(`Weather overview fetch error: ${overviewError.message}`);
      } else if (weatherOverview) {
        addDebugLog(`Weather overview fetched successfully`);
      }

      // 4. Fetch weather recommendations if we have an overview
      let weatherRecommendations = [];
      if (weatherOverview) {
        addDebugLog(`Fetching weather recommendations...`);
        const { data: recommendations, error: recommendationsError } = await supabase
          .from('weather_recommendations')
          .select('*')
          .eq('weather_overview_id', weatherOverview.id);

        if (recommendationsError) {
          addDebugLog(`Recommendations fetch error: ${recommendationsError.message}`);
        } else {
          addDebugLog(`Fetched ${recommendations?.length || 0} recommendations`);
          weatherRecommendations = recommendations || [];
        }
      }

      // 5. Fetch trip warnings
      addDebugLog(`Fetching trip warnings...`);
      const { data: warningsData, error: warningsError } = await supabase
        .from('trip_warnings')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (warningsError) {
        addDebugLog(`Warnings fetch error: ${warningsError.message}`);
      } else {
        addDebugLog(`Fetched ${warningsData?.length || 0} warnings`);
      }

      // 6. Fetch packing items
      addDebugLog(`Fetching packing items...`);
      const { data: packingData, error: packingError } = await supabase
        .from('packing_items')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (packingError) {
        addDebugLog(`Packing items fetch error: ${packingError.message}`);
      } else {
        addDebugLog(`Fetched ${packingData?.length || 0} packing items`);
      }

      // 7. Fetch trip highlights
      addDebugLog(`Fetching trip highlights...`);
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('trip_highlights')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (highlightsError) {
        addDebugLog(`Highlights fetch error: ${highlightsError.message}`);
      } else {
        addDebugLog(`Fetched ${highlightsData?.length || 0} highlights`);
      }

      // 8. Fetch shared users
      addDebugLog(`Fetching shared users...`);
      const { data: sharedUsersData, error: sharedUsersError } = await supabase
        .from('shared_users')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (sharedUsersError) {
        addDebugLog(`Shared users fetch error: ${sharedUsersError.message}`);
      } else {
        addDebugLog(`Fetched ${sharedUsersData?.length || 0} shared users`);
      }

      // Combine weather overview with recommendations
      const formattedWeatherOverview = weatherOverview
        ? {
            ...weatherOverview,
            recommendations: weatherRecommendations.map((rec) => ({
              id: rec.id,
              text: rec.text,
              icon: rec.icon || getIconForRecommendation(rec.text),
              weather_overview_id: rec.weather_overview_id,
              created_at: rec.created_at || new Date().toISOString(),
            })),
          }
        : null;

      // Format days with their activities
      const formattedDays =
        itineraryData.trip_days?.map((day) => ({
          id: day.id,
          itinerary_id: day.itinerary_id,
          day_number: day.day_number,
          date: day.date,
          created_at: day.created_at,
          activities: day.trip_activities || [],
        })) || [];

      // Combine all the data into one structure that matches TripItinerary interface
      const transformedData: TripItinerary = {
        id: itineraryData.id,
        title: itineraryData.title,
        destination: itineraryData.destination,
        description: itineraryData.description,
        image_url: itineraryData.image_url,
        total_cost: itineraryData.total_cost || 0,
        currency: itineraryData.currency || 'USD',
        user_id: itineraryData.user_id,
        created_at: itineraryData.created_at,
        updated_at: itineraryData.updated_at,
        start_date: itineraryData.start_date,
        end_date: itineraryData.end_date,
        // Properly formatted data arrays matching the interface
        days: formattedDays,
        weather: weatherData || [],
        weather_overview: formattedWeatherOverview,
        trip_highlights: highlightsData || [],
        general_tips: [], // No direct table for this, could be added later
        packing_recommendation: packingData || [],
        warnings: warningsData || [],
        shared_users: sharedUsersData || [],
      };

      setTripData(transformedData);
      setError(null);
      addDebugLog('Data loaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      addDebugLog(`ERROR: ${message}`);
      console.error('Full error object:', err);
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      addDebugLog('Fetch complete');
    }
  };

  // Helper function to determine an icon for a weather recommendation
  const getIconForRecommendation = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('sun') || lowerText.includes('hat')) return 'weather-sunny';
    if (lowerText.includes('rain') || lowerText.includes('umbrella')) return 'weather-rainy';
    if (lowerText.includes('jacket') || lowerText.includes('coat')) return 'jacket';
    if (lowerText.includes('layer')) return 'layers';
    if (lowerText.includes('water') || lowerText.includes('hydrat')) return 'water';
    if (lowerText.includes('map')) return 'map';
    return 'information-outline';
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await fetchItinerary();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [itineraryId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItinerary();
  };

  const showDebugInfo = () => {
    Alert.alert(
      'Debug Information',
      debugInfo.length > 0 ? debugInfo.slice(-20).join('\n\n') : 'No debug information available',
      [{ text: 'OK' }]
    );
  };

  const handleShareActivity = () => {
    Alert.alert(
      'Invite Users',
      'This would open a modal to invite users to collaborate on this itinerary.'
    );
  };

  // Direct rendering of the Weather section - using real data
  const renderWeatherSection = () => {
    if (!tripData?.weather || tripData.weather.length === 0) {
      return (
        <View className="flex-1">
          <View className="mb-6 rounded-xl bg-quinary p-4 shadow-sm">
            <AppText size="xl" weight="bold" color="primary" className="mb-4">
              Weather Forecast
            </AppText>

            <View className="items-center justify-center p-8">
              <MaterialCommunityIcons name="weather-cloudy" size={48} color="#CCCCCC" />
              <AppText size="lg" weight="medium" color="text" className="mt-4 text-center">
                No weather data available for this trip
              </AppText>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1">
        <View className="mb-6 rounded-xl bg-quinary p-4 shadow-sm">
          <AppText size="xl" weight="bold" color="primary" className="mb-4">
            Weather Forecast
          </AppText>

          <View className="mb-6 flex-row justify-between">
            {tripData.weather.slice(0, 5).map((day) => (
              <View key={day.id} className="mx-1 flex-1 items-center rounded-xl bg-tertiary p-4">
                <AppText size="sm" weight="bold" color="text">
                  Day {day.day}
                </AppText>
                <MaterialCommunityIcons
                  name={(`weather-${day.icon}` as any) || ('weather-partly-cloudy' as any)}
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

        {tripData.weather_overview && (
          <View className="rounded-xl bg-quinary p-4 shadow-sm">
            <AppText size="base" weight="bold" color="primary" className="mb-2">
              Trip Weather Overview
            </AppText>
            <AppText size="sm" color="text">
              {tripData.weather_overview.description}
            </AppText>

            {tripData.weather_overview.recommendations &&
              tripData.weather_overview.recommendations.length > 0 && (
                <View className="mt-4">
                  <AppText size="base" weight="bold" color="primary" className="mb-2">
                    Recommendations
                  </AppText>
                  {tripData.weather_overview.recommendations.map((recommendation) => (
                    <View key={recommendation.id} className="mb-2 flex-row items-center">
                      <MaterialCommunityIcons
                        name={(recommendation.icon || 'information-outline') as any}
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

  // Tabs for different sections of trip details
  const renderTabContent = () => {
    if (!tripData) return null;

    switch (activeTab) {
      case 'overview':
        return <TripOverview itinerary={tripData} />;
      case 'itinerary':
        return <TripItineraryTabs itinerary={tripData} />;
      case 'weather':
        return renderWeatherSection();
      case 'awareness':
        return (
          <WarningsInfo
            warnings={tripData.warnings}
            packingItems={tripData.packing_recommendation}
            generalTips={tripData.general_tips || []}
          />
        );
      default:
        return <TripOverview itinerary={tripData} />;
    }
  };

  // Debug button component
  const DebugButton = () => (
    <TouchableOpacity
      onPress={showDebugInfo}
      className="absolute bottom-4 right-4 rounded-md bg-primary/10 p-2">
      <AppText color="primary" className="underline">
        Debug ({debugInfo.length})
      </AppText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <LoadingState message="Loading trip details..." />
        <DebugButton />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <AppText size="lg" weight="bold" color="error" className="mb-2">
          Error Loading Itinerary
        </AppText>
        <AppText color="text" align="center">
          {error}
        </AppText>
        <TouchableOpacity onPress={showDebugInfo} className="mt-4 rounded-md bg-primary/10 p-2">
          <AppText color="primary" className="underline">
            Show Debug Info
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchItinerary} className="mt-4 rounded-md bg-primary p-2">
          <AppText color="white">Retry</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  if (!tripData) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <AppText size="lg" weight="bold" color="text">
          No Itinerary Data
        </AppText>
        <AppText color="text" className="mt-2" align="center">
          The itinerary could not be loaded
        </AppText>
        <TouchableOpacity onPress={showDebugInfo} className="mt-4 rounded-md bg-primary/10 p-2">
          <AppText color="primary" className="underline">
            Show Debug Info
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

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
          {tripData.title}
        </AppText>
        <AppText size="lg" weight="normal" color="primary" align="center" className="opacity-90">
          {tripData.destination}
        </AppText>
        <View className="mt-2 items-center">
          <Pressable onPress={handleShareActivity} hitSlop={10}>
            <MaterialCommunityIcons name="share-variant-outline" size={18} color="#78B0A8" />
          </Pressable>
        </View>
      </View>

      {renderCustomTabs()}

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5BBFB5" />
        }>
        {renderTabContent()}
        <TouchableOpacity onPress={showDebugInfo} className="mb-10 mt-6 items-center">
          <AppText color="primary" className="underline">
            Debug Info
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
