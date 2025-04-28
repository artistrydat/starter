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
