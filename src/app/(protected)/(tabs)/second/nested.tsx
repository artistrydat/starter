import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, ScrollView, Image } from 'react-native';

import { AppText, Tabs } from '@/src/components/ui';
import {
  TripItinerary,
  TripActivity,
  TripDay,
  TripWeather,
  TripWarning,
  PackingItem,
  TripTip,
} from '@/src/types/destinations';

// Mock data for the trip itinerary
const mockTripItinerary: TripItinerary = {
  id: '123',
  title: 'Tokyo Adventure',
  destination: 'Tokyo, Japan',
  description:
    'Explore the vibrant city of Tokyo with this 3-day adventure through traditional and modern Japanese culture.',
  imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
  days: [
    {
      id: 'day1',
      day: 1,
      date: 'May 10, 2025',
      activities: [
        {
          id: 'act1',
          name: 'Meiji Shrine',
          time: '09:00 - 11:00',
          description:
            'Visit the serene Meiji Shrine surrounded by a lush forest in the heart of Tokyo.',
          location: 'Shibuya City',
          imageUrl: 'https://images.unsplash.com/photo-1558862107-d49ef2a04d72',
          cost: 0,
          currency: 'JPY',
          category: 'sightseeing',
          icon: 'atom',
        },
        {
          id: 'act2',
          name: 'Lunch at Ichiran Ramen',
          time: '12:00 - 13:30',
          description:
            'Enjoy authentic Japanese ramen at this popular chain known for individual booths.',
          location: 'Shibuya',
          imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e',
          cost: 1500,
          currency: 'JPY',
          category: 'food',
          icon: 'bowl-mix',
        },
        {
          id: 'act3',
          name: 'Shibuya Crossing',
          time: '14:00 - 16:00',
          description:
            "Experience the world's busiest pedestrian crossing and surrounding shopping district.",
          location: 'Shibuya',
          imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989',
          cost: 0,
          currency: 'JPY',
          category: 'sightseeing',
          icon: 'axis',
        },
        {
          id: 'act4',
          name: 'Dinner at Izakaya',
          time: '18:00 - 20:00',
          description:
            'Traditional Japanese pub experience with variety of small dishes and drinks.',
          location: 'Shinjuku',
          imageUrl: 'https://images.unsplash.com/photo-1554502078-ef0fc409efce',
          cost: 3500,
          currency: 'JPY',
          category: 'food',
          icon: 'food-variant',
        },
      ],
    },
    {
      id: 'day2',
      day: 2,
      date: 'May 11, 2025',
      activities: [
        {
          id: 'act5',
          name: 'TeamLab Borderless',
          time: '10:00 - 12:30',
          description:
            'Digital art museum featuring interactive installations that respond to visitors.',
          location: 'Odaiba',
          imageUrl: 'https://images.unsplash.com/photo-1594010074997-8059e8fc4c0b',
          cost: 3200,
          currency: 'JPY',
          category: 'sightseeing',
          icon: 'palette',
        },
        {
          id: 'act6',
          name: 'Lunch at Sushi Train',
          time: '13:00 - 14:30',
          description: 'Enjoy conveyor belt sushi with fresh fish and other Japanese delicacies.',
          location: 'Odaiba',
          imageUrl: 'https://images.unsplash.com/photo-1563612116625-9a3203e6f7fc',
          cost: 2500,
          currency: 'JPY',
          category: 'food',
          icon: 'fish',
        },
        {
          id: 'act7',
          name: 'Tokyo Tower',
          time: '16:00 - 18:00',
          description: 'Visit the iconic Tokyo Tower for panoramic views of the city.',
          location: 'Minato City',
          imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
          cost: 1800,
          currency: 'JPY',
          category: 'sightseeing',
          icon: 'tower-fire',
        },
      ],
    },
    {
      id: 'day3',
      day: 3,
      date: 'May 12, 2025',
      activities: [
        {
          id: 'act8',
          name: 'Sensoji Temple',
          time: '09:00 - 11:00',
          description:
            "Tokyo's oldest temple with traditional architecture and bustling shopping street.",
          location: 'Asakusa',
          imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
          cost: 0,
          currency: 'JPY',
          category: 'sightseeing',
          icon: 'buddhism',
        },
        {
          id: 'act9',
          name: 'Lunch at Tempura Restaurant',
          time: '12:00 - 13:30',
          description:
            'Traditional tempura in a restaurant specializing in this Japanese delicacy.',
          location: 'Asakusa',
          imageUrl: 'https://images.unsplash.com/photo-1584992236310-6ded6d2b3110',
          cost: 2800,
          currency: 'JPY',
          category: 'food',
          icon: 'food',
        },
      ],
    },
  ],
  weather: [
    {
      day: 1,
      date: 'May 10, 2025',
      condition: 'sunny',
      highTemp: 24,
      lowTemp: 18,
      icon: 'weather-sunny',
    },
    {
      day: 2,
      date: 'May 11, 2025',
      condition: 'cloudy',
      highTemp: 22,
      lowTemp: 17,
      icon: 'weather-partly-cloudy',
    },
    {
      day: 3,
      date: 'May 12, 2025',
      condition: 'rainy',
      highTemp: 20,
      lowTemp: 16,
      icon: 'weather-rainy',
    },
  ],
  weather_overview: {
    description:
      "Tokyo in May offers comfortable temperatures with gradually increasing humidity. Your trip starts with sunny skies perfect for outdoor exploration, transitions to partly cloudy conditions on day 2, and concludes with spring showers on day 3. Evenings will be cool and pleasant, perfect for exploring Tokyo's vibrant nightlife.",
    recommendations: [
      { id: 'w-rec1', text: 'UV protection for sunny days', icon: 'sunglasses' },
      { id: 'w-rec2', text: 'Light layers for temperature changes', icon: 'tshirt-crew' },
      { id: 'w-rec3', text: 'Compact umbrella for day 3', icon: 'umbrella' },
    ],
  },
  trip_highlights: [
    {
      id: 'high1',
      title: 'Meiji Shrine Immersion',
      description:
        'Walk through towering torii gates and lush forest to reach this peaceful Shinto shrine.',
      icon: 'atom',
    },
    {
      id: 'high2',
      title: 'Shibuya Crossing Experience',
      description: "Cross the world's busiest intersection with up to 3,000 people at once.",
      icon: 'axis',
    },
    {
      id: 'high3',
      title: 'Digital Art at TeamLab',
      description: 'Immerse yourself in cutting-edge interactive digital art installations.',
      icon: 'palette',
    },
    {
      id: 'high4',
      title: 'Authentic Japanese Cuisine',
      description: 'Sample everything from high-end sushi to casual street food.',
      icon: 'food-variant',
    },
    {
      id: 'high5',
      title: 'Ancient Temple Culture',
      description: "Visit Tokyo's oldest Buddhist temple dating back to 645 AD.",
      icon: 'arch',
    },
  ],
  general_tips: [
    {
      id: 'tip1',
      title: 'Power Adapters',
      description:
        'Japan uses Type A and B power outlets (100V), which are different from many other countries.',
      icon: 'power-plug',
      category: 'practical',
    },
    {
      id: 'tip2',
      title: 'Public Wi-Fi',
      description:
        'Free Wi-Fi is available at most major stations, convenience stores, and tourist spots. Consider renting a portable Wi-Fi device for consistent connectivity.',
      icon: 'wifi',
      category: 'practical',
    },
    {
      id: 'tip3',
      title: 'Transit Cards',
      description:
        'Purchase a Suica or Pasmo card for seamless travel on trains, buses, and even for purchases at convenience stores.',
      icon: 'subway-variant',
      category: 'transport',
    },
    {
      id: 'tip4',
      title: 'Tipping Culture',
      description:
        'Tipping is not customary in Japan and can sometimes be considered rude. Service charges are included in bills at restaurants.',
      icon: 'cash-refund',
      category: 'cultural',
    },
    {
      id: 'tip5',
      title: 'Trash Disposal',
      description:
        'Public trash cans are surprisingly scarce in Tokyo. Be prepared to carry your trash until you find a proper disposal bin.',
      icon: 'trash-can',
      category: 'practical',
    },
    {
      id: 'tip6',
      title: 'Quiet in Public',
      description:
        'Speaking loudly on phones in public transportation is considered impolite. Maintain a moderate volume in public spaces.',
      icon: 'volume-off',
      category: 'cultural',
    },
  ],
  packing_recommendation: [
    {
      id: 'pack1',
      name: 'Light jacket or cardigan',
      icon: 'hanger',
      essential: true,
      category: 'clothing',
    },
    {
      id: 'pack2',
      name: 'Portable umbrella',
      icon: 'umbrella',
      essential: true,
      category: 'other',
    },
    {
      id: 'pack3',
      name: 'Comfortable walking shoes',
      icon: 'shoe-formal',
      essential: true,
      category: 'clothing',
    },
    {
      id: 'pack4',
      name: 'Power adapter',
      icon: 'power-plug',
      essential: true,
      category: 'electronics',
    },
    {
      id: 'pack5',
      name: 'Portable phone charger',
      icon: 'battery-charging',
      essential: false,
      category: 'electronics',
    },
    {
      id: 'pack6',
      name: 'Hand sanitizer',
      icon: 'hand-water',
      essential: false,
      category: 'toiletries',
    },
    {
      id: 'pack7',
      name: 'Passport & copies',
      icon: 'passport',
      essential: true,
      category: 'documents',
    },
    {
      id: 'pack8',
      name: 'Japanese phrase book/app',
      icon: 'translate',
      essential: false,
      category: 'other',
    },
    {
      id: 'pack9',
      name: 'Lightweight raincoat',
      icon: 'coat-rack',
      essential: false,
      category: 'clothing',
    },
  ],
  warnings: [
    {
      id: 'w1',
      title: 'Language Barrier',
      description: 'English is not widely spoken. Consider downloading a translation app.',
      severity: 'medium',
      icon: 'translate',
    },
    {
      id: 'w2',
      title: 'Cash-Preferred',
      description: 'Many places only accept cash. Make sure to have Japanese Yen on hand.',
      severity: 'medium',
      icon: 'cash',
    },
    {
      id: 'w3',
      title: 'Rainy Weather',
      description: 'Forecasted rain on day 3. Bring umbrella or raincoat.',
      severity: 'low',
      icon: 'weather-rainy',
    },
  ],
  totalCost: 15300,
  currency: 'JPY',
};

// Component for rendering activity items in the day tabs
const ActivityItem = ({ activity }: { activity: TripActivity }) => {
  return (
    <View className="mb-4 overflow-hidden rounded-xl bg-tertiary shadow-sm">
      {activity.imageUrl && (
        <Image source={{ uri: activity.imageUrl }} className="h-40 w-full" resizeMode="cover" />
      )}
      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <AppText size="xl" weight="bold" color="primary">
            {activity.name}
          </AppText>
          <AppText size="sm" color="text" className="opacity-70">
            {activity.time}
          </AppText>
        </View>

        <AppText size="sm" color="text" className="mb-2">
          {activity.description}
        </AppText>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="map-marker" size={18} color="#78B0A8" />
            <AppText size="xs" color="text" className="ml-1">
              {activity.location}
            </AppText>
          </View>

          <View className="rounded-full bg-secondary px-3 py-1">
            <AppText size="xs" weight="bold" color="text">
              {activity.cost === 0 ? 'Free' : `${activity.cost} ${activity.currency || 'JPY'}`}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

// Component for each day's content
const DayContent = ({ day }: { day: TripDay }) => {
  return (
    <View className="flex-1">
      <View className="mb-6 rounded-xl bg-primary/10 p-4">
        <AppText size="xl" weight="bold" color="primary" className="mb-1">
          Day {day.day} - {day.date}
        </AppText>
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="calendar-check" size={16} color="#5BBFB5" />
          <AppText size="sm" color="text" className="ml-1">
            {day.activities.length} Activities Planned
          </AppText>
          <MaterialCommunityIcons name="cash" size={16} color="#5BBFB5" className="ml-4" />
          <AppText size="sm" color="text" className="ml-1">
            {day.activities.reduce((sum, act) => sum + act.cost, 0).toLocaleString()} JPY
          </AppText>
        </View>
      </View>

      <View className="mb-4 rounded-xl bg-quinary p-2 shadow-sm">
        <View className="mb-2 h-6 overflow-hidden rounded-full bg-primary/10">
          <View className="h-full bg-primary/30" style={{ width: '100%' }} />

          {/* Time markers */}
          <View className="absolute w-full flex-row justify-between px-2">
            <AppText size="xs" color="text">
              08:00
            </AppText>
            <AppText size="xs" color="text">
              14:00
            </AppText>
            <AppText size="xs" color="text">
              20:00
            </AppText>
          </View>
        </View>
      </View>

      <AppText size="base" weight="bold" color="primary" className="mb-2">
        Today's Itinerary
      </AppText>

      {day.activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </View>
  );
};

// Weather component for the Weather tab
const WeatherInfo = ({
  weather,
  weatherOverview,
}: {
  weather: TripWeather[];
  weatherOverview: TripItinerary['weather_overview'];
}) => {
  return (
    <View className="flex-1">
      <View className="mb-6 rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="xl" weight="bold" color="primary" className="mb-4">
          Weather Forecast
        </AppText>

        <View className="mb-6 flex-row justify-between">
          {weather.map((day) => (
            <View key={day.day} className="mx-1 flex-1 items-center rounded-xl bg-tertiary p-4">
              <AppText size="sm" weight="bold" color="text">
                Day {day.day}
              </AppText>
              <MaterialCommunityIcons name={day.icon} size={32} color="primary" />
              <AppText size="lg" weight="bold" color="primary">
                {day.highTemp}°
              </AppText>
              <AppText size="xs" color="text">
                {day.lowTemp}°
              </AppText>
              <AppText size="xs" color="text" className="mt-1">
                {day.date.split(', ')[0]}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <View className="rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="base" weight="bold" color="primary" className="mb-2">
          Trip Weather Overview
        </AppText>
        <AppText size="sm" color="text">
          {weatherOverview.description}
        </AppText>
      </View>
    </View>
  );
};

// Packing recommendation component
const PackingRecommendation = ({ packingItems }: { packingItems: PackingItem[] }) => {
  return (
    <View className="mt-4 rounded-lg bg-primary/10 p-4">
      <View className="mb-2 flex-row items-center">
        <MaterialCommunityIcons name="bag-checked" size={20} color="#5BBFB5" />
        <AppText size="base" weight="medium" color="primary" className="ml-2">
          Packing Recommendation
        </AppText>
      </View>

      <View className="flex-row flex-wrap">
        {packingItems.map((item) => (
          <View key={item.id} className="mt-2 w-1/2 flex-row items-center">
            <MaterialCommunityIcons
              name={item.icon}
              size={16}
              color={item.essential ? '#5BBFB5' : '#78B0A8'}
            />
            <AppText size="xs" color="text" weight="normal" className="ml-2">
              {item.name} {item.essential && '★'}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

// Warnings component for the Awareness tab
const WarningsInfo = ({
  warnings,
  packingItems,
  generalTips,
}: {
  warnings: TripWarning[];
  packingItems: PackingItem[];
  generalTips: TripTip[];
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-400';
      case 'medium':
        return 'bg-yellow-100 border-yellow-400';
      case 'low':
        return 'bg-blue-100 border-blue-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <View className="flex-1">
      <View className="mb-4 rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="xl" weight="bold" color="primary" className="mb-4">
          Things to Be Aware Of
        </AppText>

        {warnings.map((warning) => (
          <View
            key={warning.id}
            className={`mb-4 rounded-xl border p-4 ${getSeverityColor(warning.severity)}`}>
            <View className="mb-2 flex-row items-center">
              <MaterialCommunityIcons name={warning.icon} size={24} color="#5BBFB5" />
              <AppText size="lg" weight="bold" color="primary" className="ml-2">
                {warning.title}
              </AppText>
            </View>
            <AppText size="sm" color="text">
              {warning.description}
            </AppText>
          </View>
        ))}

        {/* Packing recommendation moved here */}
        <PackingRecommendation packingItems={packingItems} />
      </View>

      <View className="rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="base" weight="bold" color="primary" className="mb-2">
          General Tips
        </AppText>
        {generalTips.map((tip) => (
          <View key={tip.id} className="mb-2 flex-row items-center">
            <MaterialCommunityIcons name={tip.icon} size={18} color="#78B0A8" />
            <View className="ml-2 flex-1">
              <AppText size="sm" weight="medium" color="text">
                {tip.title}
              </AppText>
              <AppText size="xs" color="text">
                {tip.description}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Overview component
const TripOverview = ({ itinerary }: { itinerary: TripItinerary }) => {
  return (
    <View className="flex-1">
      <View className="mb-4 overflow-hidden rounded-xl bg-quinary shadow-sm">
        <Image source={{ uri: itinerary.imageUrl }} className="h-48 w-full" resizeMode="cover" />
        <View className="p-4">
          <AppText size="base" color="text">
            {itinerary.description}
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
            {itinerary.days.length} Days
          </AppText>
          <AppText size="xs" color="text">
            {itinerary.days[0].date} - {itinerary.days[itinerary.days.length - 1].date}
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
            {itinerary.totalCost.toLocaleString()} {itinerary.currency}
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

        {itinerary.trip_highlights.map((highlight) => (
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
        ))}
      </View>
    </View>
  );
};

// Itinerary component that shows days as tabs
const TripItineraryTabs = ({ itinerary }: { itinerary: TripItinerary }) => {
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

export default function SecondNestedScreen() {
  // State for active main section tab
  const [activeSection, setActiveSection] = useState('overview');

  // Main section tabs
  const sectionTabs = [
    { id: 'overview', label: 'Overview', icon: '🧳' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗓' },
    { id: 'weather', label: 'Weather', icon: '🌦' },
    { id: 'aware', label: 'Awareness', icon: '📝' },
  ];

  // Render content based on active section tab
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <TripOverview itinerary={mockTripItinerary} />;
      case 'itinerary':
        return <TripItineraryTabs itinerary={mockTripItinerary} />;
      case 'weather':
        return (
          <WeatherInfo
            weather={mockTripItinerary.weather}
            weatherOverview={mockTripItinerary.weather_overview}
          />
        );
      case 'aware':
        return (
          <WarningsInfo
            warnings={mockTripItinerary.warnings}
            packingItems={mockTripItinerary.packing_recommendation}
            generalTips={mockTripItinerary.general_tips}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-quinary">
      {/* Header with trip title */}
      <View className="rounded-b-xl px-4 py-6 shadow-sm">
        <AppText size="2xl" weight="semibold" color="primary" align="center">
          {mockTripItinerary.title}
        </AppText>
        <AppText size="lg" weight="normal" color="primary" align="center" className="opacity-90">
          {mockTripItinerary.destination}
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
