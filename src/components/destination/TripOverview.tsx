import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Image } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';

export const TripOverview = ({ itinerary }: { itinerary: TripItinerary }) => {
  // Add safety checks to handle potential undefined values
  if (!itinerary) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText size="lg" color="text" align="center">
          No itinerary data available.
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="mb-4 overflow-hidden rounded-xl bg-quinary shadow-sm">
        {itinerary.imageUrl && (
          <Image source={{ uri: itinerary.imageUrl }} className="h-48 w-full" resizeMode="cover" />
        )}
        <View className="p-4">
          <AppText size="base" color="text">
            {itinerary.description || 'No description available'}
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
            {itinerary.days?.length || 0} Days
          </AppText>
          {itinerary.days && itinerary.days.length > 0 ? (
            <AppText size="xs" color="text">
              {itinerary.days[0].date} - {itinerary.days[itinerary.days.length - 1].date}
            </AppText>
          ) : (
            <AppText size="xs" color="text">
              No dates available
            </AppText>
          )}
        </View>

        <View className="ml-2 flex-1 rounded-xl bg-accent p-4 shadow-sm">
          <View className="mb-2 flex-row items-center">
            <MaterialCommunityIcons name="cash-multiple" size={24} color="#5BBFB5" />
            <AppText size="base" weight="bold" color="secondary" className="ml-2">
              Total Budget
            </AppText>
          </View>
          <AppText size="sm" color="text">
            {(itinerary.totalCost || 0).toLocaleString()} {itinerary.currency || 'JPY'}
          </AppText>
          <AppText size="xs" color="text">
            Activities and meals only
          </AppText>
        </View>
      </View>

      <View className="rounded-xl bg-tertiary p-4 shadow-sm">
        <AppText size="base" weight="bold" color="primary" className="mb-2">
          Trip Highlights
        </AppText>

        {itinerary.trip_highlights && itinerary.trip_highlights.length > 0 ? (
          itinerary.trip_highlights.map((highlight) => (
            <View key={highlight.id} className="mb-2 flex-row items-start">
              <MaterialCommunityIcons
                name={highlight.icon}
                size={18}
                color="#78B0A8"
                className="mt-1"
              />
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
