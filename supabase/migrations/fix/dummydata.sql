-- Update existing profiles instead of trying to insert new ones
UPDATE public.profiles 
SET
  email = 'dem3@gmail.com',
  phone = '+12025550189',
  onboarding_completed = true,
  onboarding_completed_at = NOW() - INTERVAL '14 days',
  travel_preferences = '{
    "travel_vibe": ["relaxed", "cultural", "foodie"],
    "travel_companion": ["solo", "couple"],
    "travel_purpose": ["adventure", "relaxation"],
    "budget": {
      "amount": 150,
      "style": ["moderate", "luxury"]
    },
    "food_preferences": ["local cuisine", "street food"],
    "tech_preferences": ["tech-savvy"]
  }'::jsonb
WHERE id = '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c';

UPDATE public.profiles 
SET
  email = 'dem2@gmail.com',
  phone = '+12025550191',
  onboarding_completed = true,
  onboarding_completed_at = NOW() - INTERVAL '7 days',
  travel_preferences = '{
    "travel_vibe": ["adventurous", "active", "nature"],
    "travel_companion": ["family", "group"],
    "travel_purpose": ["sightseeing", "adventure"],
    "budget": {
      "amount": 100,
      "style": ["budget", "moderate"]
    },
    "food_preferences": ["international", "vegetarian"],
    "tech_preferences": ["offline maps", "camera"]
  }'::jsonb
WHERE id = '3412d057-5b92-4a0c-8713-029cdfd8fa42';

-- Add user favorites
INSERT INTO public.user_favorites (
  user_id,
  destination_id
) 
SELECT '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c'::uuid, id
FROM public.global_destination 
WHERE title IN ('Cusco', 'Bali', 'Tokyo')
UNION ALL
SELECT '3412d057-5b92-4a0c-8713-029cdfd8fa42'::uuid, id
FROM public.global_destination
WHERE title IN ('Queenstown', 'Iceland Ring Road', 'Bangkok')
ON CONFLICT (user_id, destination_id) DO NOTHING;

-- Create trip itineraries for first user
INSERT INTO public.trip_itineraries (
  id,
  user_id,
  title,
  destination,
  description,
  image_url,
  total_cost,
  currency,
  start_date,
  end_date
) VALUES 
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', -- Valid UUID for Bali trip
  '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c',
  'Dream Vacation to Bali',
  'Bali, Indonesia',
  'A relaxing two-week retreat to explore Bali''s beaches, culture, and cuisine',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200',
  2850.75,
  'USD',
  '2025-06-15',
  '2025-06-29'
),
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e', -- Valid UUID for Japan trip
  '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c',
  'Cultural Experience in Japan',
  'Tokyo, Japan',
  'Exploring Tokyo''s mix of traditional culture and modern technology',
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1200',
  4250.50,
  'USD',
  '2025-08-10',
  '2025-08-20'
);

-- Create trip itineraries for second user
INSERT INTO public.trip_itineraries (
  id,
  user_id,
  title,
  destination,
  description,
  image_url,
  total_cost,
  currency,
  start_date,
  end_date
) VALUES 
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', -- Valid UUID for New Zealand trip
  '3412d057-5b92-4a0c-8713-029cdfd8fa42',
  'Adventure in New Zealand',
  'Queenstown, New Zealand',
  'Ultimate adventure trip with activities like bungee jumping, hiking, and skydiving',
  'https://images.unsplash.com/photo-1589014084744-913ec7076d6f?q=80&w=1200',
  3200.25,
  'USD',
  '2025-07-05',
  '2025-07-15'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a', -- Valid UUID for Iceland trip
  '3412d057-5b92-4a0c-8713-029cdfd8fa42',
  'Iceland Road Trip',
  'Iceland',
  'Driving the Ring Road to explore waterfalls, volcanoes, and hot springs',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=1200',
  2950.00,
  'USD',
  '2025-09-01',
  '2025-09-12'
);

-- Create shared itinerary (user1 shares with user2)
INSERT INTO public.shared_itineraries (
  itinerary_id,
  user_id,
  user_email,
  permission,
  created_by
) VALUES 
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', -- Bali trip UUID
  '3412d057-5b92-4a0c-8713-029cdfd8fa42',
  'dem2@gmail.com',
  'view',
  '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c'
);

-- Create shared itinerary (user2 shares with user1)
INSERT INTO public.shared_itineraries (
  itinerary_id,
  user_id,
  user_email,
  permission,
  created_by
) VALUES 
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', -- New Zealand trip UUID
  '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c',
  'dem3@gmail.com',
  'edit',
  '3412d057-5b92-4a0c-8713-029cdfd8fa42'
);

-- Create trip days for Bali trip
INSERT INTO public.trip_days (
  itinerary_id,
  day_number,
  date
) VALUES 
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 1, '2025-06-15'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 2, '2025-06-16'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 3, '2025-06-17'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 4, '2025-06-18'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 5, '2025-06-19');

-- Create trip days for Japan trip
INSERT INTO public.trip_days (
  itinerary_id,
  day_number,
  date
) VALUES 
('b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e', 1, '2025-08-10'),
('b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e', 2, '2025-08-11'),
('b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e', 3, '2025-08-12');

-- Create trip days for New Zealand trip
INSERT INTO public.trip_days (
  itinerary_id,
  day_number,
  date
) VALUES 
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 1, '2025-07-05'),
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 2, '2025-07-06'),
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 3, '2025-07-07'),
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 4, '2025-07-08');

-- Create trip days for Iceland trip
INSERT INTO public.trip_days (
  itinerary_id,
  day_number,
  date
) VALUES 
('d0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a', 1, '2025-09-01'),
('d0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a', 2, '2025-09-02'),
('d0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a', 3, '2025-09-03');

-- Create activities for Bali trip - Day 1
INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Arrive at Denpasar Airport',
  '10:00',
  'Arrive at Ngurah Rai International Airport and transfer to hotel',
  'Denpasar, Bali',
  'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?q=80&w=1200',
  0.00,
  'USD',
  'transportation',
  'airplane'
FROM public.trip_days
WHERE itinerary_id = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d' AND day_number = 1;

INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Check-in at Luxury Resort',
  '14:00',
  'Check in at beachfront resort in Seminyak',
  'Seminyak, Bali',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
  250.00,
  'USD',
  'accommodation',
  'hotel'
FROM public.trip_days
WHERE itinerary_id = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d' AND day_number = 1;

INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Sunset Dinner at La Lucciola',
  '18:30',
  'Beachfront dinner with spectacular sunset views',
  'Seminyak Beach',
  'https://images.unsplash.com/photo-1540361681569-3cde96741b5d?q=80&w=1200',
  85.00,
  'USD',
  'dining',
  'utensils'
FROM public.trip_days
WHERE itinerary_id = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d' AND day_number = 1;

-- Create activities for Bali trip - Day 2
INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Ubud Monkey Forest Visit',
  '09:00',
  'Visit the sacred monkey forest sanctuary',
  'Ubud, Bali',
  'https://images.unsplash.com/photo-1536146021566-627ce3c4d813?q=80&w=1200',
  15.00,
  'USD',
  'attraction',
  'tree'
FROM public.trip_days
WHERE itinerary_id = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d' AND day_number = 2;

INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Tegallalang Rice Terrace',
  '14:00',
  'Explore the stunning rice terraces and take photos',
  'Tegallalang, Ubud',
  'https://images.unsplash.com/photo-1531592937781-344ad608fabf?q=80&w=1200',
  10.00,
  'USD',
  'sightseeing',
  'mountain'
FROM public.trip_days
WHERE itinerary_id = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d' AND day_number = 2;

-- Create activities for Japan trip - Day 1
INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Arrive at Narita Airport',
  '09:30',
  'Arrive at Narita International Airport and transfer to hotel',
  'Tokyo, Japan',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200',
  0.00,
  'USD',
  'transportation',
  'airplane'
FROM public.trip_days
WHERE itinerary_id = 'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e' AND day_number = 1;

INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Tokyo Skytree Visit',
  '15:00',
  'Visit one of the tallest towers in the world for panoramic views',
  'Sumida, Tokyo',
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1200',
  25.00,
  'USD',
  'sightseeing',
  'building'
FROM public.trip_days
WHERE itinerary_id = 'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e' AND day_number = 1;

-- Create activities for New Zealand trip - Day 1
INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Arrive in Queenstown',
  '11:00',
  'Arrive at Queenstown Airport and transfer to hotel',
  'Queenstown, New Zealand',
  'https://images.unsplash.com/photo-1589014084744-913ec7076d6f?q=80&w=1200',
  0.00,
  'USD',
  'transportation',
  'airplane'
FROM public.trip_days
WHERE itinerary_id = 'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f' AND day_number = 1;

INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Skyline Gondola & Luge',
  '15:00',
  'Take the gondola up for spectacular views and enjoy the luge ride',
  'Queenstown Hill',
  'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=1200',
  45.00,
  'USD',
  'adventure',
  'gondola'
FROM public.trip_days
WHERE itinerary_id = 'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f' AND day_number = 1;

-- Create activities for New Zealand trip - Day 2
INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Milford Sound Cruise',
  '08:00',
  'Full-day tour to Milford Sound including scenic cruise',
  'Fiordland National Park',
  'https://images.unsplash.com/photo-1578284642280-f82fa00d1039?q=80&w=1200',
  150.00,
  'USD',
  'nature',
  'ship'
FROM public.trip_days
WHERE itinerary_id = 'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f' AND day_number = 2;

-- Create activities for Iceland trip - Day 1
INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Pick up rental car',
  '09:00',
  'Pick up 4WD vehicle for Ring Road trip',
  'Keflavik Airport',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200',
  85.00,
  'USD',
  'transportation',
  'car'
FROM public.trip_days
WHERE itinerary_id = 'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a' AND day_number = 1;

INSERT INTO public.trip_activities (
  day_id,
  name,
  time,
  description,
  location,
  image_url,
  cost,
  currency,
  category,
  icon
)
SELECT
  id,
  'Blue Lagoon',
  '11:00',
  'Relax in the geothermal spa with mineral-rich waters',
  'Grindavík, Iceland',
  'https://images.unsplash.com/photo-1585511543633-a4d54c3355ac?q=80&w=1200',
  95.00,
  'USD',
  'relaxation',
  'hot-tub'
FROM public.trip_days
WHERE itinerary_id = 'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a' AND day_number = 1;

-- Add weather data for Bali trip
INSERT INTO public.trip_weather (
  itinerary_id,
  day_number,
  date,
  condition,
  high_temp,
  low_temp,
  icon
) VALUES 
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 1, '2025-06-15', 'Sunny', 32, 24, 'sun'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 2, '2025-06-16', 'Partly Cloudy', 31, 25, 'cloud-sun'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 3, '2025-06-17', 'Scattered Showers', 30, 24, 'cloud-rain'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 4, '2025-06-18', 'Sunny', 33, 25, 'sun'),
('a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d', 5, '2025-06-19', 'Sunny', 32, 26, 'sun');

-- Add weather data for Japan trip
INSERT INTO public.trip_weather (
  itinerary_id,
  day_number,
  date,
  condition,
  high_temp,
  low_temp,
  icon
) VALUES 
('b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e', 1, '2025-08-10', 'Humid', 34, 26, 'thermometer-full'),
('b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e', 2, '2025-08-11', 'Thunderstorm', 32, 25, 'cloud-lightning'),
('b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e', 3, '2025-08-12', 'Partly Cloudy', 33, 27, 'cloud-sun');

-- Add weather data for New Zealand trip
INSERT INTO public.trip_weather (
  itinerary_id,
  day_number,
  date,
  condition,
  high_temp,
  low_temp,
  icon
) VALUES 
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 1, '2025-07-05', 'Clear', 15, 6, 'sun'),
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 2, '2025-07-06', 'Partly Cloudy', 14, 5, 'cloud-sun'),
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 3, '2025-07-07', 'Overcast', 12, 4, 'cloud'),
('c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f', 4, '2025-07-08', 'Light Snow', 8, 2, 'snowflake');

-- Add weather data for Iceland trip
INSERT INTO public.trip_weather (
  itinerary_id,
  day_number,
  date,
  condition,
  high_temp,
  low_temp,
  icon
) VALUES 
('d0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a', 1, '2025-09-01', 'Windy', 11, 5, 'wind'),
('d0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a', 2, '2025-09-02', 'Rainy', 10, 6, 'cloud-rain'),
('d0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a', 3, '2025-09-03', 'Partly Cloudy', 12, 7, 'cloud-sun');

-- Add weather overview for Bali trip
INSERT INTO public.trip_weather_overview (
  itinerary_id,
  description,
  recommendations
) VALUES 
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Warm tropical weather throughout your stay with occasional afternoon showers. Perfect for beach activities and outdoor exploration in the mornings.',
  '[
    "Pack light, breathable clothing",
    "Bring sunscreen and a hat",
    "Carry a light rain jacket or umbrella",
    "Don''t forget swimwear for beach days"
  ]'::jsonb
);

-- Add weather overview for Japan trip
INSERT INTO public.trip_weather_overview (
  itinerary_id,
  description,
  recommendations
) VALUES 
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e',
  'Hot and humid summer weather with a chance of thunderstorms. Urban heat island effect makes Tokyo feel particularly warm.',
  '[
    "Stay hydrated with plenty of water",
    "Use sun protection even on cloudy days",
    "Carry a portable fan",
    "Consider indoor activities during peak heat hours",
    "Be prepared for sudden rain"
  ]'::jsonb
);

-- Add weather overview for New Zealand trip
INSERT INTO public.trip_weather_overview (
  itinerary_id,
  description,
  recommendations
) VALUES 
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Cool winter conditions with cold mornings and evenings. Some snowfall possible at higher elevations.',
  '[
    "Pack layers for variable temperatures",
    "Bring a warm jacket and gloves",
    "Waterproof footwear is essential",
    "Check road conditions before traveling",
    "Sunglasses for snow glare"
  ]'::jsonb
);

-- Add weather overview for Iceland trip
INSERT INTO public.trip_weather_overview (
  itinerary_id,
  description,
  recommendations
) VALUES 
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Typical Icelandic fall weather with wind, rain, and changing conditions. Daylight is still good but decreasing.',
  '[
    "Pack waterproof outer layers",
    "Bring wind-resistant clothing",
    "Layer clothing for changing temperatures",
    "Waterproof hiking boots are essential",
    "Don''t forget a good camera for Northern Lights"
  ]'::jsonb
);

-- Add trip highlights for Bali trip
INSERT INTO public.trip_highlights (
  itinerary_id,
  title,
  description,
  icon
) VALUES 
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Sunset at Tanah Lot Temple',
  'Experience the magical sunset at this iconic sea temple perched on a rock formation.',
  'temple'
),
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Ubud Arts Scene',
  'Explore the artistic heart of Bali with galleries, craft shops, and cultural performances.',
  'palette'
),
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Sacred Monkey Forest',
  'Meet the mischievous macaques in their natural forest sanctuary.',
  'tree'
);

-- Add trip highlights for Japan trip
INSERT INTO public.trip_highlights (
  itinerary_id,
  title,
  description,
  icon
) VALUES 
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e',
  'Shibuya Crossing',
  'Experience the world''s busiest pedestrian crossing with thousands of people crossing at once.',
  'people'
),
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e',
  'Tokyo Skytree',
  'Visit one of the world''s tallest towers for breathtaking views of the megacity.',
  'building'
),
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e',
  'Tsukiji Outer Market',
  'Sample the freshest seafood and Japanese delicacies at this famous market area.',
  'fish'
);

-- Add trip highlights for New Zealand trip
INSERT INTO public.trip_highlights (
  itinerary_id,
  title,
  description,
  icon
) VALUES 
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Milford Sound',
  'Cruise through one of the world''s most beautiful fiords with dramatic cliffs and waterfalls.',
  'mountain'
),
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Queenstown Adventure',
  'Experience the adventure capital with activities like bungee jumping, jet boating, and skydiving.',
  'parachute'
),
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Breathtaking Scenery',
  'Soak in the stunning natural landscapes that were featured in Lord of the Rings.',
  'camera'
);

-- Add trip tips for Bali trip
INSERT INTO public.trip_tips (
  itinerary_id,
  title,
  description,
  icon,
  category
) VALUES 
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Temple Etiquette',
  'When visiting temples, wear a sarong and sash (usually provided at the entrance). Keep shoulders covered and remove shoes before entering temple buildings.',
  'temple',
  'cultural'
),
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Bargaining Tips',
  'Bargaining is expected at markets. Start at 50% of the asking price and negotiate from there. Stay friendly and smile!',
  'tag',
  'shopping'
),
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Water Safety',
  'Only drink bottled or filtered water. Avoid ice in drinks unless at established restaurants.',
  'glass',
  'health'
);

-- Add trip tips for Japan trip
INSERT INTO public.trip_tips (
  itinerary_id,
  title,
  description,
  icon,
  category
) VALUES 
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e',
  'Train Etiquette',
  'Keep quiet on trains and buses. Talking on phones is discouraged. Stand on the left side of escalators in Tokyo.',
  'train',
  'transportation'
),
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e',
  'Tipping',
  'Tipping is not practiced in Japan and can even be considered rude. Service charges are included in bills at restaurants.',
  'money',
  'dining'
),
(
  'b8c9d0e1-f2a3-4b5c-9d0e-1f2a3b4c5d6e',
  'Suica Card',
  'Get a Suica or Pasmo card for easy payment on public transport and at convenience stores.',
  'credit-card',
  'practical'
);

-- Add packing items for New Zealand trip
INSERT INTO public.packing_items (
  itinerary_id,
  name,
  icon,
  essential,
  category
) VALUES 
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Waterproof Hiking Boots',
  'boot',
  true,
  'footwear'
),
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Merino Wool Base Layers',
  'tshirt',
  true,
  'clothing'
),
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Rain Jacket',
  'raincoat',
  true,
  'outerwear'
),
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Sunscreen',
  'sun',
  false,
  'toiletries'
),
(
  'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f',
  'Camera with Extra Batteries',
  'camera',
  false,
  'electronics'
);

-- Add packing items for Iceland trip
INSERT INTO public.packing_items (
  itinerary_id,
  name,
  icon,
  essential,
  category
) VALUES 
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Waterproof Shell Jacket',
  'raincoat',
  true,
  'outerwear'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Insulated Water-resistant Pants',
  'pants',
  true,
  'clothing'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Thermal Underwear',
  'tshirt',
  true,
  'clothing'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Waterproof Gloves',
  'mitten',
  true,
  'accessories'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Swimwear for Hot Springs',
  'swimsuit',
  false,
  'clothing'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Power Adapter',
  'plug',
  true,
  'electronics'
);

-- Add trip warnings for Bali trip
INSERT INTO public.trip_warnings (
  itinerary_id,
  title,
  description,
  severity,
  icon
) VALUES 
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Mosquito-Borne Diseases',
  'Use mosquito repellent, especially during dawn and dusk to prevent dengue fever and other diseases.',
  'medium',
  'bug'
),
(
  'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d',
  'Beach Safety',
  'Pay attention to warning flags at beaches. Red flags indicate dangerous conditions and no swimming.',
  'high',
  'water'
);

-- Add trip warnings for Iceland trip
INSERT INTO public.trip_warnings (
  itinerary_id,
  title,
  description,
  severity,
  icon
) VALUES 
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Road Conditions',
  'Weather can change quickly affecting road conditions. Check road.is before traveling each day.',
  'high',
  'car'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Hot Spring Safety',
  'Test water temperature before entering hot springs. Some natural springs can be dangerously hot.',
  'medium',
  'thermometer'
),
(
  'd0e1f2a3-b4c5-6d7e-1f2a-3b4c5d6e7f8a',
  'Stay on Marked Paths',
  'Venturing off marked paths can damage fragile ecosystems and be dangerous.',
  'low',
  'map-signs'
);

-- Add some activity votes
INSERT INTO public.activity_votes (
  activity_id,
  user_id,
  vote_type
)
SELECT 
  trip_activities.id,
  '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c',
  'upvote'
FROM public.trip_activities
JOIN public.trip_days ON trip_activities.day_id = trip_days.id
WHERE trip_days.itinerary_id = 'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f'
AND trip_activities.name = 'Skyline Gondola & Luge';

INSERT INTO public.activity_votes (
  activity_id,
  user_id,
  vote_type
)
SELECT 
  trip_activities.id,
  '3412d057-5b92-4a0c-8713-029cdfd8fa42',
  'upvote'
FROM public.trip_activities
JOIN public.trip_days ON trip_activities.day_id = trip_days.id
WHERE trip_days.itinerary_id = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d'
AND trip_activities.name = 'Ubud Monkey Forest Visit';

-- Add some activity comments
INSERT INTO public.activity_comments (
  activity_id,
  user_id,
  comment
)
SELECT 
  trip_activities.id,
  '0ba03b00-a5f0-4f5b-a9ee-97401d0cae9c',
  'The views are absolutely incredible! Make sure to bring your camera.'
FROM public.trip_activities
JOIN public.trip_days ON trip_activities.day_id = trip_days.id
WHERE trip_days.itinerary_id = 'c9d0e1f2-a3b4-5c6d-0e1f-2a3b4c5d6e7f'
AND trip_activities.name = 'Skyline Gondola & Luge';

INSERT INTO public.activity_comments (
  activity_id,
  user_id,
  comment
)
SELECT 
  trip_activities.id,
  '3412d057-5b92-4a0c-8713-029cdfd8fa42',
  'Be careful with your belongings around the monkeys! They can be quite mischievous.'
FROM public.trip_activities
JOIN public.trip_days ON trip_activities.day_id = trip_days.id
WHERE trip_days.itinerary_id = 'a7b9c0d1-e2f3-4a5b-8c9d-1e2f3a4b5c6d'
AND trip_activities.name = 'Ubud Monkey Forest Visit';