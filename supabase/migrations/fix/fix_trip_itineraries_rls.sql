-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table with all necessary columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  phone text,
  last_seen_at timestamp with time zone default timezone('utc'::text, now()),
  onboarding_completed_at timestamp with time zone,
  onboarding_completed boolean default false,
  preferences jsonb default '{}'::jsonb,
  travel_preferences jsonb default '{
    "travel_vibe": [],
    "travel_companion": [],
    "travel_purpose": [],
    "budget": {
      "amount": 50,
      "style": []
    },
    "food_preferences": [],
    "tech_preferences": []
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create global_destination table for storing travel destinations
CREATE TABLE IF NOT EXISTS public.global_destination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(3,1),
  price_level TEXT,
  description TEXT,
  coordinates JSONB DEFAULT '{"lat": 0, "lng": 0}'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_favorites table to track favorite destinations
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  destination_id UUID REFERENCES public.global_destination NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, destination_id)
);

-- Create trip_itineraries table for storing the main itinerary information
CREATE TABLE IF NOT EXISTS public.trip_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  total_cost NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trip_days table for storing daily itinerary information
CREATE TABLE IF NOT EXISTS public.trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(itinerary_id, day_number)
);

-- Create trip_activities table for storing activities within each day
CREATE TABLE IF NOT EXISTS public.trip_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.trip_days ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  time TEXT,
  description TEXT,
  location TEXT,
  image_url TEXT,
  cost NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trip_weather table for storing weather information for each day
CREATE TABLE IF NOT EXISTS public.trip_weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE,
  condition TEXT,
  high_temp INTEGER,
  low_temp INTEGER,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(itinerary_id, day_number)
);

-- Create trip_weather_overview table for overall weather information
CREATE TABLE IF NOT EXISTS public.trip_weather_overview (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(itinerary_id)
);

-- Create trip_highlights table for storing trip highlights
CREATE TABLE IF NOT EXISTS public.trip_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trip_tips table for storing general tips about the trip
CREATE TABLE IF NOT EXISTS public.trip_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create packing_items table for storing packing recommendations
CREATE TABLE IF NOT EXISTS public.packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  essential BOOLEAN DEFAULT false,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trip_warnings table for storing trip warnings
CREATE TABLE IF NOT EXISTS public.trip_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create shared_itineraries table for shared access to itineraries
CREATE TABLE IF NOT EXISTS public.shared_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.trip_itineraries ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_email TEXT NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(itinerary_id, user_id)
);

-- Create activity_votes table for upvotes/downvotes on activities
CREATE TABLE IF NOT EXISTS public.activity_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.trip_activities ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(activity_id, user_id)
);

-- Create activity_comments table for comments on activities
CREATE TABLE IF NOT EXISTS public.activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.trip_activities ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a trigger to create profile records when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email,
    onboarding_completed,
    travel_preferences
  )
  VALUES (
    new.id, 
    new.email,
    false,
    '{
      "travel_vibe": [],
      "travel_companion": [],
      "travel_purpose": [],
      "budget": {
        "amount": 50,
        "style": []
      },
      "food_preferences": [],
      "tech_preferences": []
    }'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for all tables that need updated_at timestamps
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.global_destination
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_trip_itineraries_updated_at
  BEFORE UPDATE ON public.trip_itineraries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_trip_days_updated_at
  BEFORE UPDATE ON public.trip_days
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_trip_activities_updated_at
  BEFORE UPDATE ON public.trip_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_trip_weather_overview_updated_at
  BEFORE UPDATE ON public.trip_weather_overview
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indices
CREATE INDEX IF NOT EXISTS idx_profiles_travel_preferences ON public.profiles USING gin (travel_preferences);

-- Add validation for travel preferences structure
ALTER TABLE public.profiles
ADD CONSTRAINT travel_preferences_check CHECK (
  (travel_preferences ? 'travel_vibe') AND
  (travel_preferences ? 'travel_companion') AND
  (travel_preferences ? 'travel_purpose') AND
  (travel_preferences ? 'budget') AND
  jsonb_typeof(travel_preferences->'budget') = 'object' AND
  (travel_preferences->'budget' ? 'amount') AND
  (travel_preferences->'budget' ? 'style') AND
  (travel_preferences ? 'food_preferences') AND
  (travel_preferences ? 'tech_preferences')
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_destination ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_weather_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles
CREATE POLICY "Users can read their own profile."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own travel preferences"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Global destinations
CREATE POLICY "Allow anonymous read access to destinations" 
  ON public.global_destination FOR SELECT 
  USING (true);

-- User favorites
CREATE POLICY "Users can manage their own favorites"
  ON public.user_favorites
  USING (auth.uid() = user_id);

-- Trip itineraries
DROP POLICY IF EXISTS "Users can view their own itineraries" ON public.trip_itineraries;
DROP POLICY IF EXISTS "Users can view shared itineraries" ON public.trip_itineraries;

CREATE POLICY "Users can view owned or shared itineraries" 
  ON public.trip_itineraries
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.shared_itineraries si
      WHERE si.itinerary_id = id AND si.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own itineraries"
  ON public.trip_itineraries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
  ON public.trip_itineraries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries"
  ON public.trip_itineraries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trip days
CREATE POLICY "Users can access their own or shared itinerary days"
  ON public.trip_days
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = trip_days.itinerary_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Trip activities
CREATE POLICY "Users can access their own or shared itinerary activities"
  ON public.trip_activities
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_days
      JOIN public.trip_itineraries ON trip_itineraries.id = trip_days.itinerary_id
      WHERE trip_days.id = trip_activities.day_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Similar policy for trip_weather
CREATE POLICY "Users can access their own or shared trip weather information"
  ON public.trip_weather
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = trip_weather.itinerary_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Similar policy for trip_weather_overview
CREATE POLICY "Users can access their own or shared trip weather overview"
  ON public.trip_weather_overview
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = trip_weather_overview.itinerary_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Similar policy for trip_highlights
CREATE POLICY "Users can access their own or shared trip highlights"
  ON public.trip_highlights
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = trip_highlights.itinerary_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Similar policy for trip_tips
CREATE POLICY "Users can access their own or shared trip tips"
  ON public.trip_tips
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = trip_tips.itinerary_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Similar policy for packing_items
CREATE POLICY "Users can access their own or shared packing items"
  ON public.packing_items
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = packing_items.itinerary_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Similar policy for trip_warnings
CREATE POLICY "Users can access their own or shared trip warnings"
  ON public.trip_warnings
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = trip_warnings.itinerary_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Shared itineraries
CREATE POLICY "Users can manage sharing of their own itineraries"
  ON public.shared_itineraries
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_itineraries
      WHERE trip_itineraries.id = shared_itineraries.itinerary_id
      AND trip_itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can see where itineraries are shared with them"
  ON public.shared_itineraries
  FOR SELECT
  USING (user_id = auth.uid());

-- Activity votes
CREATE POLICY "Users can manage their own votes"
  ON public.activity_votes
  USING (user_id = auth.uid());

-- Activity comments
CREATE POLICY "Users can manage their own comments"
  ON public.activity_comments
  USING (user_id = auth.uid());

CREATE POLICY "Users can view comments on activities they can access"
  ON public.activity_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_activities
      JOIN public.trip_days ON trip_days.id = trip_activities.day_id
      JOIN public.trip_itineraries ON trip_itineraries.id = trip_days.itinerary_id
      WHERE trip_activities.id = activity_comments.activity_id
      AND (
        trip_itineraries.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.shared_itineraries
          WHERE shared_itineraries.itinerary_id = trip_itineraries.id
          AND shared_itineraries.user_id = auth.uid()
        )
      )
    )
  );

-- Insert sample data for destinations
INSERT INTO public.global_destination (
  title, 
  location, 
  image_url, 
  tags, 
  rating, 
  price_level,
  description,
  coordinates,
  is_featured,
  category
) VALUES 
(
  'Cusco', 
  'Peru', 
  'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200', 
  '["Cultural Tours", "After dark"]'::jsonb, 
  4.7,
  'moderate',
  'Historic capital of the Inca Empire, known for its archaeological remains and Spanish colonial architecture.',
  '{"lat": -13.53195, "lng": -71.96746}'::jsonb,
  true,
  'cultural'
),
(
  'Hanoi', 
  'Vietnam', 
  'https://images.unsplash.com/photo-1573167710701-35950a41e251?q=80&w=1200', 
  '["4WD Tours"]'::jsonb, 
  4.5,
  'budget',
  'Vietnams capital city known for its centuries-old architecture and rich culture with Southeast Asian, Chinese and French influences.',
  '{"lat": 21.0278, "lng": 105.8342}'::jsonb,
  false,
  'cultural'
),
(
  'Bangkok', 
  'Thailand', 
  'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1200',
  '["City Tours", "Food"]'::jsonb, 
  4.3,
  'budget',
  'Thailands vibrant capital, known for ornate shrines, street food and vibrant nightlife.',
  '{"lat": 13.7563, "lng": 100.5018}'::jsonb,
  true,
  'trending'
),
(
  'Rome', 
  'Italy', 
  'https://images.unsplash.com/photo-1525874684015-58379d421a52?q=80&w=1200', 
  '["History", "Art"]'::jsonb,
  4.8,
  'luxury',
  'Italys capital city with nearly 3,000 years of globally influential art, architecture and culture on display.',
  '{"lat": 41.9028, "lng": 12.4964}'::jsonb,
  true,
  'cultural'
),
(
  'Bali', 
  'Indonesia', 
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200', 
  '["Beaches", "Relaxation"]'::jsonb,
  4.6,
  'moderate',
  'Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.',
  '{"lat": -8.4095, "lng": 115.1889}'::jsonb,
  true,
  'relaxing'
),
(
  'Queenstown', 
  'New Zealand', 
  'https://images.unsplash.com/photo-1589014084744-913ec7076d6f?q=80&w=1200', 
  '["Adventure", "Scenic"]'::jsonb,
  4.9,
  'luxury',
  'New Zealand resort town set against the dramatic Southern Alps, known for adventure sports and stunning scenery.',
  '{"lat": -45.0312, "lng": 168.6626}'::jsonb,
  false,
  'adventure'
),
(
  'Tokyo', 
  'Japan', 
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1200', 
  '["Technology", "Food", "Shopping"]'::jsonb,
  4.7,
  'luxury',
  'Japans busy capital, mixing the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.',
  '{"lat": 35.6762, "lng": 139.6503}'::jsonb,
  true,
  'urban'
),
(
  'Marrakech', 
  'Morocco', 
  'https://images.unsplash.com/photo-1597212618440-806262de4f6e?q=80&w=1200', 
  '["Markets", "Culture", "History"]'::jsonb,
  4.4,
  'moderate',
  'A major economic center and home to mosques, palaces and gardens, with mazing markets and vibrant culture.',
  '{"lat": 31.6295, "lng": -7.9811}'::jsonb,
  false,
  'cultural'
),
(
  'Iceland Ring Road', 
  'Iceland', 
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=1200', 
  '["Scenic Drive", "Nature", "Adventure"]'::jsonb,
  4.9,
  'moderate',
  'Epic road trip around Icelands stunning landscapes including glaciers, waterfalls, volcanoes and geysers.',
  '{"lat": 64.9631, "lng": -19.0208}'::jsonb,
  true,
  'adventure'
);

-- Add table comments
COMMENT ON TABLE public.profiles IS 'Stores user profile information including travel preferences';
COMMENT ON TABLE public.global_destination IS 'Stores global travel destinations for the app';
COMMENT ON TABLE public.user_favorites IS 'Tracks which destinations users have favorited';
COMMENT ON TABLE public.trip_itineraries IS 'Stores main trip itinerary information';
COMMENT ON TABLE public.trip_days IS 'Stores day-by-day information for each trip itinerary';
COMMENT ON TABLE public.trip_activities IS 'Stores activities for each day of a trip';
COMMENT ON TABLE public.trip_weather IS 'Stores weather forecasts for each day of the trip';
COMMENT ON TABLE public.trip_weather_overview IS 'Stores overall weather information for the trip';
COMMENT ON TABLE public.trip_highlights IS 'Stores highlight points of interest for a trip';
COMMENT ON TABLE public.trip_tips IS 'Stores general travel tips for a specific trip';
COMMENT ON TABLE public.packing_items IS 'Stores recommended packing items for a trip';
COMMENT ON TABLE public.trip_warnings IS 'Stores warnings and alerts for a trip';
COMMENT ON TABLE public.shared_itineraries IS 'Tracks which users have access to shared itineraries';
COMMENT ON TABLE public.activity_votes IS 'Stores upvotes/downvotes on trip activities';
COMMENT ON TABLE public.activity_comments IS 'Stores comments on trip activities';
COMMENT ON COLUMN public.profiles.travel_preferences IS 'User travel preferences including vibe, companions, purpose, budget (amount and style), food, and tech preferences';