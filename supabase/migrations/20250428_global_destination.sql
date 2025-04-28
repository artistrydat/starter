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

-- Add RLS policies
ALTER TABLE public.global_destination ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to destinations
CREATE POLICY "Allow anonymous read access to destinations" 
  ON public.global_destination FOR SELECT 
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.global_destination
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
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
  'Vietnam\'s capital city known for its centuries-old architecture and rich culture with Southeast Asian, Chinese and French influences.',
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
  'Thailand\'s vibrant capital, known for ornate shrines, street food and vibrant nightlife.',
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
  'Italy\'s capital city with nearly 3,000 years of globally influential art, architecture and culture on display.',
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
);

-- Create user_favorites table to track favorite destinations
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  destination_id UUID REFERENCES public.global_destination NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, destination_id)
);

-- Add RLS policies to user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own favorites
CREATE POLICY "Users can manage their own favorites"
  ON public.user_favorites
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.global_destination IS 'Stores global travel destinations for the app';
COMMENT ON TABLE public.user_favorites IS 'Tracks which destinations users have favorited';