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
  destination_id: string; // References GlobalDestination.id
  trip_itinerary_id?: string; // Optional reference to TripItinerary
  created_at: string; // Made required to match DB schema
}

export interface ActivityComment {
  id: string;
  user_id: string;
  activity_id: string;
  text: string;
  user_name?: string;
  user_avatar?: string;
  created_at: string; // Made required to match DB schema
}

export interface ActivityVote {
  id: string;
  user_id: string;
  activity_id: string;
  vote_type: VoteType;
  created_at: string; // Made required to match DB schema
  deleted?: boolean; // Helper for UI state
}

export interface TripActivity {
  id: string;
  day_id: string;
  name: string;
  time?: string; // Made optional to match DB schema
  description?: string;
  location?: string;
  image_url?: string;
  cost?: number; // Made optional to match DB schema
  currency?: string; // Made optional to match DB schema
  category?: string; // Made optional to match DB schema
  icon?: string;
  votes?: ActivityVote[];
  ActivityComment?: ActivityComment[];
  created_at: string; // Made required to match DB schema
  updated_at: string; // Added to match DB schema
}

export interface SharedUser {
  id: string;
  user_id: string;
  itinerary_id: string;
  user_email: string;
  permission: PermissionType;
  created_at: string; // Made required to match DB schema
  created_by: string; // Made required to match DB schema
  user_name?: string;
}

export interface TripDay {
  id: string;
  itinerary_id: string;
  day_number: number;
  date?: string; // Made optional to match DB schema
  activities: TripActivity[];
  created_at: string; // Made required to match DB schema
  updated_at: string; // Added to match DB schema
}

export interface TripWeather {
  id: string;
  itinerary_id: string;
  day: number;
  date: string;
  condition?: string; // Made optional to match DB schema
  high_temp?: number; // Made optional to match DB schema
  low_temp?: number; // Made optional to match DB schema
  icon?: string; // Made optional to match DB schema
  created_at: string; // Made required to match DB schema
}

export interface WeatherRecommendation {
  id: string;
  weather_overview_id: string;
  text: string;
  icon?: string;
  created_at: string; // Made required to match DB schema
}

export interface WeatherOverview {
  id: string;
  itinerary_id: string;
  description: string;
  recommendations: WeatherRecommendation[];
  created_at: string; // Made required to match DB schema
  updated_at: string; // Added to match DB schema
}

export interface TripHighlight {
  id: string;
  itinerary_id: string;
  title: string;
  description?: string;
  icon?: string; // Made optional to match DB schema
  created_at: string; // Made required to match DB schema
}

export interface PackingItem {
  id: string;
  itinerary_id: string;
  name: string;
  category?: string; // Made optional to match DB schema
  essential?: boolean; // Made optional to match DB schema
  icon?: string;
  created_at: string;
}

export interface TripWarning {
  id: string;
  itinerary_id: string;
  title: string;
  description: string;
  severity?: WarningSeverity; // Made optional to match DB schema
  icon?: string;
  created_at: string; // Made required to match DB schema
}

export interface TripTip {
  id: string;
  itinerary_id: string;
  title: string;
  description: string; // Made required to match DB schema
  icon?: string;
  category?: string;
  created_at: string;
}

export interface TripItinerary {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  total_cost?: number; // Made optional to match DB schema
  currency?: string; // Made optional to match DB schema
  user_id: string;
  location: string; // Renamed from destination to match DB schema
  tags?: string[]; // Made optional to match DB schema
  city?: string; // Made optional to match DB schema
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
  is_favorite?: boolean;
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
  global_destination?: GlobalDestination; // Optional 1:1 relationship
  favorites?: UserFavorite[]; // Add relationship
}

export interface GlobalDestination {
  id: string;
  trip_itinerary_id: string; // Reference to the original itinerary
  title: string;
  location: string;
  image_url: string; // Made required to match DB schema
  tags?: string[]; // Made optional to match DB schema
  rating?: number;
  price_level?: PriceLevel;
  description?: string;
  coordinates?: Coordinates;
  is_featured?: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
  user_favorites?: UserFavorite[];
}

export enum DestinationType {
  Itinerary = 'itinerary',
  Global = 'global',
}

export enum FavoriteType {
  Destination = 'destination',
  Itinerary = 'itinerary',
}

export function isItineraryFavorite(
  favorite: UserFavorite
): favorite is UserFavorite & { trip_itinerary_id: string } {
  return !!favorite.trip_itinerary_id;
}

export type AnyDestination = TripItinerary | GlobalDestination;
