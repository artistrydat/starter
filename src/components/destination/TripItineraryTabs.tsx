import { useState } from 'react';
import { View } from 'react-native';

import DayContent from './DayContent';

import { AppText, Tabs } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

export const TripItineraryTabs = ({
  itinerary,
  useMockData = true,
}: {
  itinerary: TripItinerary;
  useMockData?: boolean;
}) => {
  const [activeDay, setActiveDay] = useState(`day1`);

  // Use mock data if specified or if real data is unavailable
  const data = useMockData ? mockItinerary : itinerary;

  // Add safety check for undefined itinerary
  if (!data || !data.days || data.days.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText size="lg" color="text" align="center">
          No itinerary days available.
        </AppText>
      </View>
    );
  }

  // Generate day tab items
  const dayTabs = data.days.map((day) => ({
    id: `day${day.day_number}`,
    label: `Day ${day.day_number}`,
    icon: '🗓',
  }));

  // Render content based on active day tab
  const renderDayContent = () => {
    const dayNumber = parseInt(activeDay.replace('day', ''), 10);
    const dayData = data.days.find((day) => day.day_number === dayNumber);
    return dayData ? <DayContent day={dayData} /> : null;
  };

  return (
    <View className="flex-1">
      <View className="mb-4 overflow-hidden rounded-xl bg-quinary shadow-sm">
        <AppText size="xl" weight="bold" color="primary" className="p-4">
          Trip Itinerary
        </AppText>
      </View>

      {/* Days tabs */}
      <Tabs
        items={dayTabs}
        activeTab={activeDay}
        onTabChange={setActiveDay}
        variant="pills"
        size="sm"
        className="mb-4"
      />

      {/* Day content */}
      {renderDayContent()}
    </View>
  );
};

export default TripItineraryTabs;
