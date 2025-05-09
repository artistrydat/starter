// This file contains the types for the profile data used in the application.

export interface ProfileUser {
  id: string;
  username: string;
  full_name: string; // Changed from fullName to match DB column name
  email?: string;
  phone?: string;
  bio: string;
  avatar_url: string; // Changed from avatarUrl to match DB column name
  travel_style?: string;

  // Stats
  itineraryCount?: number;
  followersCount?: number;
  followingCount?: number;

  // Status flags
  issubscribed?: boolean;
  isfollowing?: boolean;
  isblocked?: boolean;
  isfollower?: boolean;
  ispremium?: boolean;
  credit?: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;

  // For display purposes - derived from travel_preferences
  preferences?: string[];
}

// Add type for the profile form data (client-side representation)
export interface ProfileFormData {
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  pronouns?: string;
  gender?: string;
  travelStyle?: string;
}
