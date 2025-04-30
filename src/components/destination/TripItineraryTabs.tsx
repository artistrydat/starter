import { useState } from 'react';
import { View } from 'react-native';

import DayContent from './DayContent';

import { AppText, Tabs } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';

export const TripItineraryTabs = ({ itinerary }: { itinerary: TripItinerary }) => {
  const [activeDay, setActiveDay] = useState(`day1`);

  // Generate day tab items
  const dayTabs = itinerary.days.map((day) => ({
    id: `day${day.day}`,
    label: `Day ${day.day}`,
    icon: '🗓',
  }));

  // Render content based on active day tab
  const renderDayContent = () => {
    const dayNumber = parseInt(activeDay.replace('day', ''), 10);
    const dayData = itinerary.days.find((day) => day.day === dayNumber);
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
