// Defining enums for fixed sets of values
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

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GlobalDestination {
  id: string;
  title: string;
  location: string;
  image_url: string;
  tags: string[] | null;
  rating?: number;
  price_level?: PriceLevel;
  description?: string;
  coordinates?: Coordinates;
  is_featured?: boolean;
  category?: string;
  created_at: string; // Consider using Date if working with actual Date objects
  updated_at: string; // Consider using Date if working with actual Date objects
}

export interface UserFavorite {
  id: string;
  user_id: string;
  destination_id: string;
  created_at: string; // Consider using Date
}

export interface DestinationCategory {
  id: string;
  label: string;
}

export interface ActivityComment {
  id: string;
  user_id: string;
  activity_id: string;
  comment: string;
  created_at: string; // Consider using Date
  user_name?: string;
}

export interface ActivityVote {
  id: string;
  user_id: string;
  activity_id: string;
  vote_type: VoteType;
  created_at: string; // Consider using Date
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
  comments?: ActivityComment[];
  created_at: string; // Consider using Date
}

export interface SharedUser {
  id: string;
  user_id: string;
  itinerary_id: string;
  user_email: string;
  permission: PermissionType;
  created_at: string; // Consider using Date
  created_by?: string;
  user_name?: string;
}

export interface TripDay {
  id: string;
  itinerary_id: string;
  day_number: number;
  date: string; // Consider using Date
  activities: TripActivity[];
  created_at: string; // Consider using Date
}

export interface TripWeather {
  id: string;
  itinerary_id: string;
  day: number;
  date: string; // Consider using Date
  condition: string;
  high_temp: number;
  low_temp: number;
  icon: string;
  created_at: string; // Consider using Date
}

export interface WeatherRecommendation {
  id: string;
  weather_overview_id: string;
  text: string;
  icon: string;
  created_at: string; // Consider using Date
}

export interface WeatherOverview {
  id: string;
  itinerary_id: string;
  description: string;
  recommendations: WeatherRecommendation[];
  created_at: string; // Consider using Date
}

export interface TripHighlight {
  id: string;
  itinerary_id: string;
  title: string;
  description?: string;
  icon: string;
  created_at: string; // Consider using Date
}

export interface TripTip {
  id: string;
  itinerary_id: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  created_at: string; // Consider using Date
}

export interface PackingItem {
  id: string;
  itinerary_id: string;
  name: string;
  category: string;
  essential: boolean;
  icon?: string;
  created_at: string; // Consider using Date
}

export interface TripWarning {
  id: string;
  itinerary_id: string;
  title: string;
  description: string;
  severity: WarningSeverity;
  icon?: string;
  created_at: string; // Consider using Date
}

export interface TripItinerary {
  id: string;
  title: string;
  destination: string;
  description?: string;
  image_url?: string;
  total_cost: number;
  currency: string;
  user_id: string;
  days: TripDay[];
  weather: TripWeather[];
  weather_overview?: WeatherOverview | null;
  trip_highlights: TripHighlight[];
  general_tips: TripTip[];
  packing_recommendation: PackingItem[];
  warnings: TripWarning[];
  shared_users: SharedUser[];
  created_at: string; // Consider using Date
  updated_at: string; // Consider using Date
  destination_details?: GlobalDestination;
  start_date?: string; // Consider using Date
  end_date?: string; // Consider using Date
}
