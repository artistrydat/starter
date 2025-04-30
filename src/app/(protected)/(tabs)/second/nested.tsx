import { useState } from 'react';
import { View, ScrollView } from 'react-native';

import {
  TripItineraryTabs,
  TripOverview,
  WeatherInfo,
  WarningsInfo,
} from '@/src/components/destination';
import { AppText, Tabs } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';

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
