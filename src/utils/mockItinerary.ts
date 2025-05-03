// src/utils/mockItinerary.ts
import {
  TripItinerary,
  PriceLevel,
  WarningSeverity,
  PermissionType,
  VoteType,
} from '@/src/types/destinations';

// Mock data for trip itinerary
export const mockItinerary: TripItinerary = {
  id: 'mock-itinerary-123',
  title: 'Exploring Paris',
  destination: 'Paris, France',
  description: 'A week-long adventure through the city of lights',
  image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  total_cost: 1200,
  currency: 'EUR',
  user_id: 'user-123',
  start_date: '2025-06-15',
  end_date: '2025-06-22',
  created_at: '2025-04-20T10:30:00Z',
  updated_at: '2025-04-25T14:15:00Z',

  // Weather information
  weather: [
    {
      id: 'weather-1',
      itinerary_id: 'mock-itinerary-123',
      day: 1,
      date: '2025-06-15',
      condition: 'Sunny',
      high_temp: 25,
      low_temp: 16,
      icon: 'sunny',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'weather-2',
      itinerary_id: 'mock-itinerary-123',
      day: 2,
      date: '2025-06-16',
      condition: 'Partly Cloudy',
      high_temp: 24,
      low_temp: 15,
      icon: 'partly-cloudy',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'weather-3',
      itinerary_id: 'mock-itinerary-123',
      day: 3,
      date: '2025-06-17',
      condition: 'Light Rain',
      high_temp: 21,
      low_temp: 14,
      icon: 'rainy',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'weather-4',
      itinerary_id: 'mock-itinerary-123',
      day: 4,
      date: '2025-06-18',
      condition: 'Sunny',
      high_temp: 23,
      low_temp: 15,
      icon: 'sunny',
      created_at: '2025-04-20T10:30:00Z',
    },
  ],

  weather_overview: {
    id: 'weather-overview-1',
    itinerary_id: 'mock-itinerary-123',
    description:
      'Paris will be mostly warm and pleasant during your visit, with occasional light showers. Pack a light jacket and umbrella just in case.',
    recommendations: [
      {
        id: 'weather-rec-1',
        weather_overview_id: 'weather-overview-1',
        text: 'Pack a lightweight raincoat',
        icon: 'raincoat',
        created_at: '2025-04-20T10:30:00Z',
      },
      {
        id: 'weather-rec-2',
        weather_overview_id: 'weather-overview-1',
        text: 'Sunscreen for sunny days',
        icon: 'sunscreen',
        created_at: '2025-04-20T10:30:00Z',
      },
      {
        id: 'weather-rec-3',
        weather_overview_id: 'weather-overview-1',
        text: 'Comfortable walking shoes',
        icon: 'shoes',
        created_at: '2025-04-20T10:30:00Z',
      },
    ],
    created_at: '2025-04-20T10:30:00Z',
  },

  // Warnings
  warnings: [
    {
      id: 'warning-1',
      itinerary_id: 'mock-itinerary-123',
      title: 'Pickpocketing',
      description:
        'Be aware of pickpockets in tourist areas, especially around the Eiffel Tower and on public transport.',
      severity: WarningSeverity.Medium,
      icon: 'alert',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'warning-2',
      itinerary_id: 'mock-itinerary-123',
      title: 'Tourist Scams',
      description:
        'Watch out for common scams like the bracelet scam or petition signers near major attractions.',
      severity: WarningSeverity.Low,
      icon: 'info',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'warning-3',
      itinerary_id: 'mock-itinerary-123',
      title: 'Metro Strikes',
      description:
        'Occasional transport strikes may affect travel plans. Check local news for updates.',
      severity: WarningSeverity.Low,
      icon: 'train',
      created_at: '2025-04-20T10:30:00Z',
    },
  ],

  // Packing recommendations
  packing_recommendation: [
    {
      id: 'packing-1',
      itinerary_id: 'mock-itinerary-123',
      name: 'Universal travel adapter',
      category: 'electronics',
      essential: true,
      icon: 'plug',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'packing-2',
      itinerary_id: 'mock-itinerary-123',
      name: 'Comfortable walking shoes',
      category: 'clothing',
      essential: true,
      icon: 'shoes',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'packing-3',
      itinerary_id: 'mock-itinerary-123',
      name: 'Lightweight rain jacket',
      category: 'clothing',
      essential: false,
      icon: 'jacket',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'packing-4',
      itinerary_id: 'mock-itinerary-123',
      name: 'Camera',
      category: 'electronics',
      essential: false,
      icon: 'camera',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'packing-5',
      itinerary_id: 'mock-itinerary-123',
      name: 'French phrasebook',
      category: 'miscellaneous',
      essential: false,
      icon: 'book',
      created_at: '2025-04-20T10:30:00Z',
    },
  ],

  // General tips
  general_tips: [
    {
      id: 'tip-1',
      itinerary_id: 'mock-itinerary-123',
      title: 'Learn basic French phrases',
      description: 'Parisians appreciate visitors who make an effort to speak some French.',
      icon: 'chat',
      category: 'culture',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'tip-2',
      itinerary_id: 'mock-itinerary-123',
      title: 'Museum Pass',
      description:
        'Consider buying a Paris Museum Pass for free entry to over 60 museums and monuments.',
      icon: 'ticket',
      category: 'savings',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'tip-3',
      itinerary_id: 'mock-itinerary-123',
      title: 'Metro Navigation',
      description:
        'The Paris Metro is extensive and efficient. Download the RATP app for easy navigation.',
      icon: 'subway',
      category: 'transport',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'tip-4',
      itinerary_id: 'mock-itinerary-123',
      title: 'Tipping Culture',
      description:
        'Service is usually included in restaurant bills, but leaving a small tip is appreciated.',
      icon: 'euro',
      category: 'culture',
      created_at: '2025-04-20T10:30:00Z',
    },
  ],

  // Trip highlights
  trip_highlights: [
    {
      id: 'highlight-1',
      itinerary_id: 'mock-itinerary-123',
      title: 'Eiffel Tower',
      description: 'Visit the iconic Eiffel Tower, preferably at sunset for spectacular views.',
      icon: 'tower',
      created_at: '2025-04-20T10:30:00Z',
    },
    {
      id: 'highlight-2',
      itinerary_id: 'mock-itinerary-123',
      title: 'Louvre Museum',
      description: 'Home to thousands of works of art including the Mona Lisa.',
      icon: 'museum',
      created_at: '2025-04-20T10:30:00Z',
    },
  ],

  // Days and activities
  days: [
    {
      id: 'day-1',
      itinerary_id: 'mock-itinerary-123',
      day_number: 1,
      date: '2025-06-15',
      created_at: '2025-04-20T10:30:00Z',
      activities: [
        {
          id: 'activity-1',
          day_id: 'day-1',
          name: 'Arrival at Charles de Gaulle Airport',
          time: '10:00',
          description: 'Arrive in Paris and transfer to hotel',
          location: 'Charles de Gaulle Airport',
          cost: 0,
          currency: 'EUR',
          category: 'transport',
          icon: 'airplane',
          created_at: '2025-04-20T10:30:00Z',
          votes: [
            {
              id: 'vote-1',
              user_id: 'user-456',
              activity_id: 'activity-1',
              vote_type: VoteType.Upvote,
              created_at: '2025-04-21T08:30:00Z',
            },
          ],
          comments: [],
        },
        {
          id: 'activity-2',
          day_id: 'day-1',
          name: 'Check-in at Hotel',
          time: '13:00',
          description: 'Check in at your boutique hotel in Le Marais district',
          location: 'Le Marais',
          cost: 0,
          currency: 'EUR',
          category: 'accommodation',
          icon: 'hotel',
          created_at: '2025-04-20T10:30:00Z',
          votes: [
            {
              id: 'vote-2',
              user_id: 'user-789',
              activity_id: 'activity-2',
              vote_type: VoteType.Upvote,
              created_at: '2025-04-22T10:15:00Z',
            },
            {
              id: 'vote-3',
              user_id: 'user-456',
              activity_id: 'activity-2',
              vote_type: VoteType.Downvote,
              created_at: '2025-04-23T14:20:00Z',
            },
          ],
          comments: [],
        },
      ],
    },
    {
      id: 'day-2',
      itinerary_id: 'mock-itinerary-123',
      day_number: 2,
      date: '2025-06-16',
      created_at: '2025-04-20T10:30:00Z',
      activities: [
        {
          id: 'activity-3',
          day_id: 'day-2',
          name: 'Eiffel Tower Visit',
          time: '10:00',
          description: 'Visit the iconic Eiffel Tower',
          location: 'Champ de Mars',
          cost: 25,
          currency: 'EUR',
          category: 'sightseeing',
          icon: 'monument',
          created_at: '2025-04-20T10:30:00Z',
          votes: [
            {
              id: 'vote-4',
              user_id: 'user-123',
              activity_id: 'activity-3',
              vote_type: VoteType.Upvote,
              created_at: '2025-04-24T09:45:00Z',
            },
          ],
          comments: [],
        },
      ],
    },
  ],

  // Shared users
  shared_users: [
    {
      id: 'shared-1',
      user_id: 'user-456',
      itinerary_id: 'mock-itinerary-123',
      user_email: 'friend@example.com',
      permission: PermissionType.View,
      created_at: '2025-04-22T08:45:00Z',
      user_name: 'Travel Buddy',
    },
  ],

  // Optional destination details
  destination_details: {
    id: 'dest-paris',
    title: 'Paris',
    location: 'France',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    tags: ['romantic', 'historic', 'culinary'],
    rating: 4.8,
    price_level: PriceLevel.Moderate,
    description:
      'The City of Light is known for its iconic architecture, world-class museums, and exquisite cuisine.',
    coordinates: {
      lat: 48.856614,
      lng: 2.3522219,
    },
    is_featured: true,
    category: 'city',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
};

// Empty itinerary for loading/error states testing
export const emptyItinerary: TripItinerary = {
  id: '',
  title: '',
  destination: '',
  total_cost: 0,
  currency: 'USD',
  user_id: '',
  days: [],
  weather: [],
  weather_overview: null,
  trip_highlights: [],
  general_tips: [],
  packing_recommendation: [],
  warnings: [],
  shared_users: [],
  created_at: '',
  updated_at: '',
};
