import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { View } from 'react-native';

import ActivityItem from './ActivityItem';

import { AppText } from '@/src/components/ui';
import { TripDay } from '@/src/types/destinations';

// Define a type for the valid icon names we're using
type MaterialCommunityIconName =
  | 'weather-sunny'
  | 'weather-partly-cloudy'
  | 'weather-night'
  | 'calendar-check'
  | 'cash';

export const DayContent = ({ day }: { day: TripDay }) => {
  // Calculate schedule coverage for timeline visualization
  const timelineMarkers = useMemo(() => {
    // Time markers for a full day (8am to 10pm)
    return [
      {
        time: '08:00',
        label: 'Morning',
        icon: 'weather-sunny' as MaterialCommunityIconName,
        color: '#5BBFB5',
      },
      {
        time: '12:00',
        label: 'Noon',
        icon: 'weather-sunny' as MaterialCommunityIconName,
        color: '#FFD166',
      },
      {
        time: '16:00',
        label: 'Afternoon',
        icon: 'weather-partly-cloudy' as MaterialCommunityIconName,
        color: '#06D6A0',
      },
      {
        time: '20:00',
        label: 'Evening',
        icon: 'weather-night' as MaterialCommunityIconName,
        color: '#118AB2',
      },
    ];
  }, []);

  // Format the date for display if available
  const formattedDate = day.date
    ? new Date(day.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  // Calculate total cost of activities
  const totalCost = day.activities.reduce((sum, act) => sum + (act.cost || 0), 0);

  return (
    <View className="flex-1">
      <View className="mb-6 rounded-xl bg-primary/10 p-4">
        <AppText size="xl" weight="bold" color="primary" className="mb-1">
          Day {day.day_number} - {formattedDate}
        </AppText>
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="calendar-check" size={16} color="#5BBFB5" />
          <AppText size="sm" color="text" className="ml-1">
            {day.activities.length} Activities Planned
          </AppText>
          <MaterialCommunityIcons name="cash" size={16} color="#5BBFB5" className="ml-4" />
          <AppText size="sm" color="text" className="ml-1">
            {totalCost.toLocaleString()} {day.activities[0]?.currency || 'EUR'}
          </AppText>
        </View>
      </View>

      {/* Enhanced Time Schedule */}
      <View className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <AppText size="sm" weight="medium" color="primary" className="mb-4">
          Daily Schedule
        </AppText>

        {/* Timeline bar - adjusted to match design */}
        <View className="relative mb-3">
          {/* Background track */}
          <View className="h-2 w-full rounded-full bg-[#E6F5F3]" />

          {/* Activity markers */}
          {timelineMarkers.map((marker, index) => (
            <View
              key={marker.time}
              className="absolute h-4 w-4 rounded-full border-2 border-[#5BBFB5] bg-white"
              style={{
                left: `${(index / (timelineMarkers.length - 1)) * 100}%`,
                top: -5,
                marginLeft: -8, // Center the dot
              }}>
              <View className="absolute inset-0 m-[3px] rounded-full bg-[#5BBFB5]" />
            </View>
          ))}
        </View>

        {/* Time markers */}
        <View className="flex-row justify-between">
          {timelineMarkers.map((marker) => (
            <View key={marker.time} className="items-center" style={{ width: '22%' }}>
              <MaterialCommunityIcons name={marker.icon} size={16} color={marker.color} />
              <AppText size="xs" weight="medium" color="primary" className="mt-1">
                {marker.label}
              </AppText>
              <AppText size="xs" color="text" className="opacity-70">
                {marker.time}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <AppText size="base" weight="bold" color="primary" className="mb-2">
        Today's Itinerary
      </AppText>

      {day.activities.length > 0 ? (
        day.activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} dayId={day.id} />
        ))
      ) : (
        <View className="items-center justify-center py-8">
          <AppText size="sm" color="text" className="opacity-70">
            No activities planned for this day.
          </AppText>
        </View>
      )}
    </View>
  );
};

export default DayContent;
