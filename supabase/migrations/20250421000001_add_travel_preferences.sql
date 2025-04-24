-- Add travel preferences columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS travel_preferences JSONB DEFAULT '{
  "travel_vibe": [],
  "travel_companion": [],
  "travel_purpose": [],
  "budget_style": [],
  "food_preferences": [],
  "tech_preferences": []
}'::jsonb;

-- Create an index for better performance when querying travel preferences
CREATE INDEX IF NOT EXISTS idx_profiles_travel_preferences ON public.profiles USING gin (travel_preferences);

-- Add validation for travel preferences structure
ALTER TABLE public.profiles
ADD CONSTRAINT travel_preferences_check CHECK (
  (travel_preferences ? 'travel_vibe') AND
  (travel_preferences ? 'travel_companion') AND
  (travel_preferences ? 'travel_purpose') AND
  (travel_preferences ? 'budget_style') AND
  (travel_preferences ? 'food_preferences') AND
  (travel_preferences ? 'tech_preferences')
);

-- Update RLS policies to allow users to update their travel preferences
CREATE POLICY "Users can update their own travel preferences"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

COMMENT ON COLUMN public.profiles.travel_preferences IS 'User travel preferences including vibe, companions, purpose, budget, food, and tech preferences';