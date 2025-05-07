// Profile related types
export interface ProfileStats {
  itineraryCount: number;
  followersCount: number;
  followingCount: number;
  issubscribed: boolean;
  isfollowing: boolean;
  isblocked: boolean;
  isfollower: boolean;
  credit: number;
  ispremium: boolean;
}

export interface ProfileUser {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  stats: ProfileStats;
  preferences: string[];
  travelStyle: string;
}
