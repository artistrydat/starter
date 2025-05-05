// src/utils/mockItineraries.ts
import { mockItinerary } from './mockItinerary';

import {
  TripItinerary,
  PriceLevel,
  WarningSeverity,
  PermissionType,
  VoteType,
} from '@/src/types/destinations';

// Paris itinerary (reusing existing mockItinerary)
export const parisItinerary = mockItinerary;

// Tokyo itinerary
export const tokyoItinerary: TripItinerary = {
  id: 'mock-itinerary-tokyo',
  title: 'Tokyo Adventure',
  description: 'Exploring the vibrant metropolis of Tokyo',
  image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
  total_cost: 2500,
  currency: 'USD',
  user_id: 'user-123',
  start_date: '2025-07-10',
  end_date: '2025-07-17',
  created_at: '2025-05-01T14:30:00Z',
  updated_at: '2025-05-02T09:15:00Z',
  city: 'Tokyo',
  location: 'Japan',
  tags: ['modern', 'cultural', 'shopping', 'food'],
  rating: 4.9,
  price_level: PriceLevel.Luxury,
  coordinates: {
    lat: 35.6762,
    lng: 139.6503,
  },
  is_featured: true,
  category: 'city',
  is_bookmarked: true,
  is_shared: false,
  is_public: true,
  is_private: false,
  is_completed: false,

  // Weather information
  weather: [
    {
      id: 'weather-tokyo-1',
      itinerary_id: 'mock-itinerary-tokyo',
      day: 1,
      date: '2025-07-10',
      condition: 'Hot and Humid',
      high_temp: 32,
      low_temp: 25,
      icon: 'hot',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'weather-tokyo-2',
      itinerary_id: 'mock-itinerary-tokyo',
      day: 2,
      date: '2025-07-11',
      condition: 'Rainy',
      high_temp: 28,
      low_temp: 24,
      icon: 'rainy',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'weather-tokyo-3',
      itinerary_id: 'mock-itinerary-tokyo',
      day: 3,
      date: '2025-07-12',
      condition: 'Sunny',
      high_temp: 31,
      low_temp: 25,
      icon: 'sunny',
      created_at: '2025-05-01T14:30:00Z',
    },
  ],

  weather_overview: {
    id: 'weather-overview-tokyo',
    itinerary_id: 'mock-itinerary-tokyo',
    description:
      'Tokyo will be hot and humid during your visit, with occasional rain showers. Pack light clothing and a small umbrella.',
    recommendations: [
      {
        id: 'weather-rec-tokyo-1',
        weather_overview_id: 'weather-overview-tokyo',
        text: 'Pack breathable, light clothing',
        icon: 'tshirt',
        created_at: '2025-05-01T14:30:00Z',
      },
      {
        id: 'weather-rec-tokyo-2',
        weather_overview_id: 'weather-overview-tokyo',
        text: 'Bring a portable umbrella',
        icon: 'umbrella',
        created_at: '2025-05-01T14:30:00Z',
      },
      {
        id: 'weather-rec-tokyo-3',
        weather_overview_id: 'weather-overview-tokyo',
        text: 'Consider a cooling towel',
        icon: 'towel',
        created_at: '2025-05-01T14:30:00Z',
      },
    ],
    created_at: '2025-05-01T14:30:00Z',
  },

  // Warnings
  warnings: [
    {
      id: 'warning-tokyo-1',
      itinerary_id: 'mock-itinerary-tokyo',
      title: 'Language Barrier',
      description:
        'English is not widely spoken outside of major tourist areas. Consider a translation app.',
      severity: WarningSeverity.Medium,
      icon: 'translate',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'warning-tokyo-2',
      itinerary_id: 'mock-itinerary-tokyo',
      title: 'Rush Hour Crowds',
      description:
        'Avoid using the metro during rush hour (7:30-9:00 AM and 5:30-7:30 PM) if possible.',
      severity: WarningSeverity.Medium,
      icon: 'crowd',
      created_at: '2025-05-01T14:30:00Z',
    },
  ],

  // Packing recommendations
  packing_recommendation: [
    {
      id: 'packing-tokyo-1',
      itinerary_id: 'mock-itinerary-tokyo',
      name: 'Portable Wi-Fi or SIM card',
      category: 'electronics',
      essential: true,
      icon: 'wifi',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'packing-tokyo-2',
      itinerary_id: 'mock-itinerary-tokyo',
      name: 'Comfortable walking shoes',
      category: 'clothing',
      essential: true,
      icon: 'shoes',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'packing-tokyo-3',
      itinerary_id: 'mock-itinerary-tokyo',
      name: 'Portable umbrella',
      category: 'accessories',
      essential: true,
      icon: 'umbrella',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'packing-tokyo-4',
      itinerary_id: 'mock-itinerary-tokyo',
      name: 'Translation app',
      category: 'electronics',
      essential: false,
      icon: 'phone',
      created_at: '2025-05-01T14:30:00Z',
    },
  ],

  // General tips
  general_tips: [
    {
      id: 'tip-tokyo-1',
      itinerary_id: 'mock-itinerary-tokyo',
      title: 'Suica/Pasmo Card',
      description: 'Get a rechargeable IC card for easy payment on public transport and in stores.',
      icon: 'card',
      category: 'transport',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'tip-tokyo-2',
      itinerary_id: 'mock-itinerary-tokyo',
      title: 'Convenience Stores',
      description:
        '7-Eleven, Lawson, and FamilyMart are perfect for quick meals, ATMs, and essentials.',
      icon: 'store',
      category: 'food',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'tip-tokyo-3',
      itinerary_id: 'mock-itinerary-tokyo',
      title: 'Vending Machines',
      description: 'Vending machines are everywhere and offer a wide variety of drinks.',
      icon: 'drink',
      category: 'convenience',
      created_at: '2025-05-01T14:30:00Z',
    },
  ],

  // Trip highlights
  trip_highlights: [
    {
      id: 'highlight-tokyo-1',
      itinerary_id: 'mock-itinerary-tokyo',
      title: 'Shibuya Crossing',
      description: 'Experience the famous scramble crossing, busiest in the world.',
      icon: 'crossing',
      created_at: '2025-05-01T14:30:00Z',
    },
    {
      id: 'highlight-tokyo-2',
      itinerary_id: 'mock-itinerary-tokyo',
      title: 'Sensō-ji Temple',
      description: "Tokyo's oldest temple, located in Asakusa.",
      icon: 'temple',
      created_at: '2025-05-01T14:30:00Z',
    },
  ],

  // Days and activities
  days: [
    {
      id: 'day-tokyo-1',
      itinerary_id: 'mock-itinerary-tokyo',
      day_number: 1,
      date: '2025-07-10',
      created_at: '2025-05-01T14:30:00Z',
      activities: [
        {
          id: 'activity-tokyo-1',
          day_id: 'day-tokyo-1',
          name: 'Arrive at Narita Airport',
          time: '14:00',
          description: 'Arrive in Tokyo and take the Narita Express to the city',
          location: 'Narita International Airport',
          cost: 3000,
          currency: 'JPY',
          category: 'transport',
          icon: 'airplane',
          created_at: '2025-05-01T14:30:00Z',
          votes: [],
          ActivityComment: [],
        },
        {
          id: 'activity-tokyo-2',
          day_id: 'day-tokyo-1',
          name: 'Check-in at Hotel',
          time: '17:00',
          description: 'Check in at your hotel in Shinjuku',
          location: 'Shinjuku',
          cost: 0,
          currency: 'JPY',
          category: 'accommodation',
          icon: 'hotel',
          created_at: '2025-05-01T14:30:00Z',
          votes: [],
          ActivityComment: [],
        },
      ],
    },
    {
      id: 'day-tokyo-2',
      itinerary_id: 'mock-itinerary-tokyo',
      day_number: 2,
      date: '2025-07-11',
      created_at: '2025-05-01T14:30:00Z',
      activities: [
        {
          id: 'activity-tokyo-3',
          day_id: 'day-tokyo-2',
          name: 'Tsukiji Outer Market',
          time: '08:00',
          description: 'Visit the famous fish market and enjoy fresh sushi for breakfast',
          location: 'Tsukiji',
          cost: 3000,
          currency: 'JPY',
          category: 'food',
          icon: 'food',
          created_at: '2025-05-01T14:30:00Z',
          votes: [],
          ActivityComment: [],
        },
      ],
    },
  ],

  shared_users: [],
};

// Rome itinerary
export const romeItinerary: TripItinerary = {
  id: 'mock-itinerary-rome',
  title: 'Roman Holiday',
  description: 'Exploring ancient history and modern charm in the Eternal City',
  image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
  total_cost: 1800,
  currency: 'EUR',
  user_id: 'user-123',
  start_date: '2025-09-05',
  end_date: '2025-09-12',
  created_at: '2025-05-03T11:20:00Z',
  updated_at: '2025-05-04T16:45:00Z',
  city: 'Rome',
  location: 'Italy',
  tags: ['historic', 'cultural', 'culinary', 'ancient'],
  rating: 4.7,
  price_level: PriceLevel.Moderate,
  coordinates: {
    lat: 41.9028,
    lng: 12.4964,
  },
  is_featured: false,
  category: 'city',
  is_bookmarked: false,
  is_shared: true,
  is_public: true,
  is_private: false,
  is_completed: false,

  // Weather information
  weather: [
    {
      id: 'weather-rome-1',
      itinerary_id: 'mock-itinerary-rome',
      day: 1,
      date: '2025-09-05',
      condition: 'Sunny',
      high_temp: 29,
      low_temp: 21,
      icon: 'sunny',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'weather-rome-2',
      itinerary_id: 'mock-itinerary-rome',
      day: 2,
      date: '2025-09-06',
      condition: 'Sunny',
      high_temp: 30,
      low_temp: 22,
      icon: 'sunny',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'weather-rome-3',
      itinerary_id: 'mock-itinerary-rome',
      day: 3,
      date: '2025-09-07',
      condition: 'Partly Cloudy',
      high_temp: 28,
      low_temp: 20,
      icon: 'partly-cloudy',
      created_at: '2025-05-03T11:20:00Z',
    },
  ],

  weather_overview: {
    id: 'weather-overview-rome',
    itinerary_id: 'mock-itinerary-rome',
    description:
      'Rome will be warm and sunny in early September. Expect comfortable evenings but hot afternoons.',
    recommendations: [
      {
        id: 'weather-rec-rome-1',
        weather_overview_id: 'weather-overview-rome',
        text: 'Sun protection is essential',
        icon: 'sunscreen',
        created_at: '2025-05-03T11:20:00Z',
      },
      {
        id: 'weather-rec-rome-2',
        weather_overview_id: 'weather-overview-rome',
        text: 'Bring a light layer for evenings',
        icon: 'jacket',
        created_at: '2025-05-03T11:20:00Z',
      },
      {
        id: 'weather-rec-rome-3',
        weather_overview_id: 'weather-overview-rome',
        text: 'Stay hydrated throughout the day',
        icon: 'water',
        created_at: '2025-05-03T11:20:00Z',
      },
    ],
    created_at: '2025-05-03T11:20:00Z',
  },

  // Warnings
  warnings: [
    {
      id: 'warning-rome-1',
      itinerary_id: 'mock-itinerary-rome',
      title: 'Pickpocketing',
      description:
        'Be aware of pickpockets in crowded tourist areas, especially around the Colosseum and on public transport.',
      severity: WarningSeverity.Medium,
      icon: 'alert',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'warning-rome-2',
      itinerary_id: 'mock-itinerary-rome',
      title: 'Tourist Areas Closing Times',
      description: 'Most historical sites close by 7:30 PM. Plan your visits accordingly.',
      severity: WarningSeverity.Low,
      icon: 'clock',
      created_at: '2025-05-03T11:20:00Z',
    },
  ],

  // Packing recommendations
  packing_recommendation: [
    {
      id: 'packing-rome-1',
      itinerary_id: 'mock-itinerary-rome',
      name: 'Modest clothing for Vatican visits',
      category: 'clothing',
      essential: true,
      icon: 'clothes',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'packing-rome-2',
      itinerary_id: 'mock-itinerary-rome',
      name: 'Comfortable walking shoes',
      category: 'clothing',
      essential: true,
      icon: 'shoes',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'packing-rome-3',
      itinerary_id: 'mock-itinerary-rome',
      name: 'Water bottle',
      category: 'accessories',
      essential: true,
      icon: 'bottle',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'packing-rome-4',
      itinerary_id: 'mock-itinerary-rome',
      name: 'Sun hat',
      category: 'accessories',
      essential: false,
      icon: 'hat',
      created_at: '2025-05-03T11:20:00Z',
    },
  ],

  // General tips
  general_tips: [
    {
      id: 'tip-rome-1',
      itinerary_id: 'mock-itinerary-rome',
      title: 'Water Fountains',
      description:
        "Rome has many 'nasoni' (drinking fountains) throughout the city. The water is safe and refreshing.",
      icon: 'fountain',
      category: 'practical',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'tip-rome-2',
      itinerary_id: 'mock-itinerary-rome',
      title: 'Roma Pass',
      description:
        'Consider buying a Roma Pass for free entry to 1-2 museums and unlimited public transport.',
      icon: 'ticket',
      category: 'savings',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'tip-rome-3',
      itinerary_id: 'mock-itinerary-rome',
      title: 'Siesta Hours',
      description: 'Many small shops close from 1-4 PM. Plan your shopping accordingly.',
      icon: 'clock',
      category: 'culture',
      created_at: '2025-05-03T11:20:00Z',
    },
  ],

  // Trip highlights
  trip_highlights: [
    {
      id: 'highlight-rome-1',
      itinerary_id: 'mock-itinerary-rome',
      title: 'Colosseum',
      description: "Visit Rome's iconic ancient amphitheater.",
      icon: 'colosseum',
      created_at: '2025-05-03T11:20:00Z',
    },
    {
      id: 'highlight-rome-2',
      itinerary_id: 'mock-itinerary-rome',
      title: 'Vatican Museums',
      description: 'Home to masterpieces including the Sistine Chapel.',
      icon: 'museum',
      created_at: '2025-05-03T11:20:00Z',
    },
  ],

  // Days and activities
  days: [
    {
      id: 'day-rome-1',
      itinerary_id: 'mock-itinerary-rome',
      day_number: 1,
      date: '2025-09-05',
      created_at: '2025-05-03T11:20:00Z',
      activities: [
        {
          id: 'activity-rome-1',
          day_id: 'day-rome-1',
          name: 'Arrive at Fiumicino Airport',
          time: '11:00',
          description: 'Arrive in Rome and take the Leonardo Express to Roma Termini',
          location: 'Leonardo da Vinci International Airport',
          cost: 14,
          currency: 'EUR',
          category: 'transport',
          icon: 'airplane',
          created_at: '2025-05-03T11:20:00Z',
          votes: [],
          ActivityComment: [],
        },
        {
          id: 'activity-rome-2',
          day_id: 'day-rome-1',
          name: 'Check-in at Hotel',
          time: '14:00',
          description: 'Check in at your hotel near the Spanish Steps',
          location: 'Centro Storico',
          cost: 0,
          currency: 'EUR',
          category: 'accommodation',
          icon: 'hotel',
          created_at: '2025-05-03T11:20:00Z',
          votes: [],
          ActivityComment: [],
        },
      ],
    },
    {
      id: 'day-rome-2',
      itinerary_id: 'mock-itinerary-rome',
      day_number: 2,
      date: '2025-09-06',
      created_at: '2025-05-03T11:20:00Z',
      activities: [
        {
          id: 'activity-rome-3',
          day_id: 'day-rome-2',
          name: 'Colosseum & Roman Forum',
          time: '09:00',
          description: 'Guided tour of the Colosseum and Roman Forum',
          location: 'Colosseum',
          cost: 60,
          currency: 'EUR',
          category: 'sightseeing',
          icon: 'monument',
          created_at: '2025-05-03T11:20:00Z',
          votes: [],
          ActivityComment: [],
        },
      ],
    },
  ],

  shared_users: [
    {
      id: 'shared-rome-1',
      user_id: 'user-456',
      itinerary_id: 'mock-itinerary-rome',
      user_email: 'travel-buddy@example.com',
      permission: PermissionType.Edit,
      created_at: '2025-05-04T09:30:00Z',
      user_name: 'Travel Buddy',
    },
  ],
};

// Export an array of all mock itineraries for easy access
export const mockItineraries: TripItinerary[] = [parisItinerary, tokyoItinerary, romeItinerary];
