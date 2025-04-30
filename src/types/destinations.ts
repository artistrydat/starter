export type Coordinates = {
  lat: number;
  lng: number;
};

export type Destination = {
  id: string;
  title: string;
  location: string;
  image_url: string;
  tags: string[];
  rating?: number;
  price_level?: 'budget' | 'moderate' | 'luxury';
  description?: string;
  coordinates?: Coordinates;
  is_featured?: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserFavorite = {
  id: string;
  user_id: string;
  destination_id: string;
  created_at: string;
};

export type DestinationCategory = {
  id: string;
  label: string;
};

export type TripActivity = {
  id: string;
  name: string;
  time: string;
  description: string;
  location: string;
  imageUrl?: string;
  cost: number;
  currency?: string;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'other';
  icon?: string;
  votes?: ActivityVote[];
  comments?: ActivityComment[];
};

// New types for activity interactions
export type ActivityVote = {
  id: string;
  user_id: string;
  activity_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
};

export type ActivityComment = {
  id: string;
  user_id: string;
  activity_id: string;
  comment: string;
  created_at: string;
  user_name?: string;
};

export type SharedUser = {
  id: string;
  user_id: string;
  itinerary_id: string;
  user_email: string;
  permission: 'view' | 'edit';
  created_at: string;
};

export type TripDay = {
  id: string;
  day: number;
  date: string;
  activities: TripActivity[];
};

export type TripWeather = {
  day: number;
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  highTemp: number;
  lowTemp: number;
  icon: string;
};

export type WeatherOverview = {
  description: string;
  recommendations: {
    id: string;
    text: string;
    icon: string;
  }[];
};

export type TripHighlight = {
  id: string;
  title: string;
  description?: string;
  icon: string;
};

export type TripTip = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'cultural' | 'practical' | 'safety' | 'transport' | 'other';
};

export type PackingItem = {
  id: string;
  name: string;
  icon: string;
  essential: boolean;
  category: 'clothing' | 'electronics' | 'toiletries' | 'documents' | 'other';
};

export type TripWarning = {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
};

export type TripItinerary = {
  id: string;
  title: string;
  destination: string;
  description: string;
  imageUrl: string;
  days: TripDay[];
  weather: TripWeather[];
  weather_overview: WeatherOverview;
  trip_highlights: TripHighlight[];
  general_tips: TripTip[];
  packing_recommendation: PackingItem[];
  warnings: TripWarning[];
  totalCost: number;
  currency: string;
  user_id?: string;
  shared_users?: SharedUser[];
};
