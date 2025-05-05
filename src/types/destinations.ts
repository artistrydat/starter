// Enums for fixed value sets
export enum PriceLevel {
  Budget = 'budget',
  Moderate = 'moderate',
  Luxury = 'luxury',
}

export enum VoteType {
  Upvote = 'upvote',
  Downvote = 'downvote',
}

export enum PermissionType {
  View = 'view',
  Edit = 'edit',
}

export enum WarningSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// Core interfaces matching tables
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  destination_id: string;
  created_at?: string;
}

export interface DestinationCategory {
  id: string;
  label: string;
}

export interface ActivityComment {
  id: string;
  user_id: string;
  activity_id: string;
  text: string;
  user_name?: string;
  user_avatar?: string;
  created_at?: string;
}

export interface ActivityVote {
  id: string;
  user_id: string;
  activity_id: string;
  vote_type: VoteType;
  created_at?: string;
}

export interface TripActivity {
  id: string;
  day_id: string;
  name: string;
  time: string;
  description?: string;
  location?: string;
  image_url?: string;
  cost: number;
  currency: string;
  category: string;
  icon?: string;
  votes?: ActivityVote[];
  ActivityComment?: ActivityComment[];
  created_at?: string;
}

export interface SharedUser {
  id: string;
  user_id: string;
  itinerary_id: string;
  user_email: string;
  permission: PermissionType;
  created_at?: string;
  created_by?: string;
  user_name?: string;
}

export interface TripDay {
  id: string;
  itinerary_id: string;
  day_number: number;
  date: string;
  activities: TripActivity[];
  created_at?: string;
}

export interface TripWeather {
  id: string;
  itinerary_id: string;
  day: number;
  date: string;
  condition: string;
  high_temp: number;
  low_temp: number;
  icon: string;
  created_at?: string;
}

export interface WeatherRecommendation {
  id: string;
  weather_overview_id: string;
  text: string;
  icon?: string;
  created_at?: string;
}

export interface WeatherOverview {
  id: string;
  itinerary_id: string;
  description: string;
  recommendations: WeatherRecommendation[];
  created_at?: string;
}

export interface TripHighlight {
  id: string;
  itinerary_id: string;
  title: string;
  description?: string;
  icon: string;
  created_at?: string;
}

export interface PackingItem {
  id: string;
  itinerary_id: string;
  name: string;
  category: string;
  essential: boolean;
  icon?: string;
  created_at: string;
}

export interface TripWarning {
  id: string;
  itinerary_id: string;
  title: string;
  description: string;
  severity: WarningSeverity;
  icon?: string;
  created_at?: string;
}
export interface TripTip {
  id: string;
  itinerary_id: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  created_at: string;
}

export interface TripItinerary {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  total_cost: number;
  currency: string;
  user_id: string;
  location: string;
  tags: string[];
  city: string;
  rating?: number;
  price_level?: PriceLevel;
  coordinates?: Coordinates;
  is_featured?: boolean;
  category?: string;
  is_bookmarked?: boolean;
  is_shared?: boolean;
  is_public?: boolean;
  is_private?: boolean;
  is_completed?: boolean;
  days: TripDay[];
  weather: TripWeather[];
  weather_overview?: WeatherOverview;
  trip_highlights: TripHighlight[];
  packing_recommendation: PackingItem[];
  warnings: TripWarning[];
  shared_users: SharedUser[];
  general_tips: TripTip[];
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
}
