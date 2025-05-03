import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

export const TripOverview = ({
  itinerary,
  useMockData = true,
}: {
  itinerary: TripItinerary;
  useMockData?: boolean;
}) => {
  // Use mock data if specified, or if real data is unavailable
  const data = useMockData ? mockItinerary : itinerary;

  // Add safety checks to handle potential undefined values
  if (!data) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText size="lg" color="text" align="center">
          No itinerary data available.
        </AppText>
      </View>
    );
  }

  // Format date range for display
  const getDateRange = () => {
    if (data.start_date && data.end_date) {
      // If we have explicit start/end dates
      return `${new Date(data.start_date).toLocaleDateString()} - ${new Date(data.end_date).toLocaleDateString()}`;
    } else if (data.days && data.days.length > 0) {
      // Otherwise try to get it from the days array
      return `${data.days[0].date} - ${data.days[data.days.length - 1].date}`;
    }
    return 'No dates available';
  };

  return (
    <View className="flex-1">
      <View className="mb-4 overflow-hidden rounded-xl bg-quinary shadow-sm">
        {data.image_url && (
          <Image source={{ uri: data.image_url }} className="h-48 w-full" resizeMode="cover" />
        )}
        <View className="p-4">
          <AppText size="base" color="text">
            {data.description || 'No description available'}
          </AppText>
        </View>
      </View>

      <View className="mb-4 flex-row justify-between">
        <View className="mr-2 flex-1 rounded-xl bg-quaternary p-4 shadow-sm">
          <View className="mb-2 flex-row items-center">
            <MaterialCommunityIcons name="calendar-range" size={24} color="#5BBFB5" />
            <AppText size="base" weight="bold" color="quaternary" className="ml-2">
              Trip Duration
            </AppText>
          </View>
          <AppText size="sm" color="text">
            {data.days?.length || 0} Days
          </AppText>
          <AppText size="xs" color="text">
            {getDateRange()}
          </AppText>
        </View>

        <View className="ml-2 flex-1 rounded-xl bg-accent p-4 shadow-sm">
          <View className="mb-2 flex-row items-center">
            <MaterialCommunityIcons name="cash-multiple" size={24} color="#5BBFB5" />
            <AppText size="base" weight="bold" color="secondary" className="ml-2">
              Total Budget
            </AppText>
          </View>
          <AppText size="sm" color="text">
            {(data.total_cost || 0).toLocaleString()} {data.currency || 'EUR'}
          </AppText>
          <AppText size="xs" color="text">
            Activities and meals only
          </AppText>
        </View>
      </View>

      <View className="rounded-xl bg-tertiary p-4 shadow-sm">
        <AppText size="base" weight="bold" color="primary" className="mb-4">
          Trip Highlights
        </AppText>

        {data.trip_highlights && data.trip_highlights.length > 0 ? (
          data.trip_highlights.map((highlight) => (
            <View key={highlight.id} className="mb-4 flex-row items-start">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <AppText size="lg" weight="medium" color="text">
                  ?
                </AppText>
              </View>
              <View className="ml-2 flex-1">
                <AppText size="sm" weight="medium" color="text">
                  {highlight.title}
                </AppText>
                {highlight.description && (
                  <AppText size="xs" color="text">
                    {highlight.description}
                  </AppText>
                )}
              </View>
            </View>
          ))
        ) : (
          <AppText size="sm" color="text">
            No highlights available
          </AppText>
        )}
      </View>
    </View>
  );
};

export default TripOverview;
