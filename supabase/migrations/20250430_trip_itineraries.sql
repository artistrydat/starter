-- Create trip itineraries tables for managing detailed trip plans
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

-- Create triggers for updated_at timestamps for all relevant tables
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

-- Set up Row Level Security (RLS) policies

-- Trip itineraries - Fix the infinite recursion by modifying the policies
ALTER TABLE public.trip_itineraries ENABLE ROW LEVEL SECURITY;

-- Replace the problematic policies with simplified versions
DROP POLICY IF EXISTS "Users can view their own itineraries" ON public.trip_itineraries;
DROP POLICY IF EXISTS "Users can view shared itineraries" ON public.trip_itineraries;

-- Create a single consolidated policy for SELECT operations
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

-- Keep the other policies unchanged
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

-- Apply similar RLS to all other tables
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

-- RLS policy for trip_days based on itinerary ownership or shared access
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

-- Similar policies need to be created for all other tables
-- This is a representative example for activities
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

-- Shared itineraries management
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

-- Add table comments
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