import { useState } from 'react';
import { View } from 'react-native';

import DayContent from './DayContent';

import { AppText, Tabs } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';

/**
 * TripItineraryTabs component - Pure UI component for displaying trip itinerary tabs
 * No data fetching or source-specific logic included
 */
export type TripItineraryTabsProps = {
  itinerary: TripItinerary;
};

export const TripItineraryTabs = ({ itinerary }: TripItineraryTabsProps) => {
  const [activeDay, setActiveDay] = useState(`day1`);

  // Add safety check for undefined itinerary
  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText size="lg" color="text" align="center">
          No itinerary days available.
        </AppText>
      </View>
    );
  }

  // Generate day tab items
  const dayTabs = itinerary.days.map((day) => ({
    id: `day${day.day_number}`,
    label: `Day ${day.day_number}`,
    icon: '🗓',
  }));

  // Render content based on active day tab
  const renderDayContent = () => {
    const dayNumber = parseInt(activeDay.replace('day', ''), 10);
    const dayData = itinerary.days.find((day) => day.day_number === dayNumber);
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
