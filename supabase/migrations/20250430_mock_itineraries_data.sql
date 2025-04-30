-- Mock data for trip_itineraries tables
-- This file inserts sample data into all the trip-related tables

-- Sample trip itineraries
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
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', 
  'da0642c5-4a46-4fc8-a5f2-7b1a66bb0755', -- This should match an actual user_id
  'Tokyo Adventure', 
  'Tokyo, Japan', 
  'Exploring the vibrant city of Tokyo, from traditional temples to modern skyscrapers.', 
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
  135000,
  'JPY',
  '2025-05-15',
  '2025-05-22'
),
(
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', 
  'da0642c5-4a46-4fc8-a5f2-7b1a66bb0755', -- Same user_id as above
  'Kyoto Cultural Tour', 
  'Kyoto, Japan', 
  'Immersing in the cultural heritage of Kyoto with visits to ancient temples and traditional tea ceremonies.', 
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
  120000,
  'JPY',
  '2025-06-10',
  '2025-06-17'
),
(
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 
  '93d2b9c6-1f7e-4ced-9e62-8044fa98ed9d', -- Different user_id
  'Paris Romance', 
  'Paris, France', 
  'A romantic journey through the City of Light, featuring iconic landmarks and culinary delights.', 
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  2500,
  'EUR',
  '2025-07-20',
  '2025-07-27'
);

-- Sample trip days for Tokyo Adventure
INSERT INTO public.trip_days (
  id,
  itinerary_id,
  day_number,
  date
) VALUES 
(
  'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  1,
  '2025-05-15'
),
(
  'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  2,
  '2025-05-16'
),
(
  'e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  3,
  '2025-05-17'
);

-- Sample trip days for Kyoto Cultural Tour
INSERT INTO public.trip_days (
  id,
  itinerary_id,
  day_number,
  date
) VALUES 
(
  'f4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9',
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', -- Kyoto Cultural Tour ID
  1,
  '2025-06-10'
),
(
  'a5b6c7d8-e9f0-a1b2-c3d4-e5f6a7b8c9d0',
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', -- Kyoto Cultural Tour ID
  2,
  '2025-06-11'
);

-- Sample trip days for Paris Romance
INSERT INTO public.trip_days (
  id,
  itinerary_id,
  day_number,
  date
) VALUES 
(
  'b6c7d8e9-f0a1-b2c3-d4e5-f6a7b8c9d0e1',
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', -- Paris Romance ID
  1,
  '2025-07-20'
),
(
  'c7d8e9f0-a1b2-c3d4-e5f6-a7b8c9d0e1f2',
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', -- Paris Romance ID
  2,
  '2025-07-21'
);

-- Sample activities for Tokyo Adventure - Day 1
INSERT INTO public.trip_activities (
  id,
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
) VALUES 
(
  'd8e9f0a1-b2c3-d4e5-f6a7-b8c9d0e1f2a3',
  'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6', -- Tokyo Day 1 ID
  'Meiji Shrine Visit',
  '09:00',
  'Visit the serene Meiji Shrine surrounded by a lush forest in the heart of Tokyo.',
  'Shibuya, Tokyo',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186',
  0,
  'JPY',
  'sightseeing',
  'temple'
),
(
  'e9f0a1b2-c3d4-e5f6-a7b8-c9d0e1f2a3b4',
  'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6', -- Tokyo Day 1 ID
  'Lunch at Harajuku',
  '12:30',
  'Enjoy creative and colorful food at the trendy cafes of Harajuku.',
  'Harajuku, Tokyo',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
  3000,
  'JPY',
  'food',
  'food'
),
(
  'f0a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
  'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6', -- Tokyo Day 1 ID
  'Shibuya Crossing',
  '15:00',
  'Experience the famous Shibuya Crossing, one of the busiest intersections in the world.',
  'Shibuya, Tokyo',
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989',
  0,
  'JPY',
  'sightseeing',
  'street'
);

-- Sample activities for Tokyo Adventure - Day 2
INSERT INTO public.trip_activities (
  id,
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
) VALUES 
(
  'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
  'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7', -- Tokyo Day 2 ID
  'Tokyo Skytree',
  '10:00',
  'Visit Tokyo Skytree, the tallest tower in Japan with panoramic views of the city.',
  'Sumida, Tokyo',
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
  2100,
  'JPY',
  'sightseeing',
  'skyscraper'
),
(
  'b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7',
  'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7', -- Tokyo Day 2 ID
  'Sushi Making Class',
  '14:00',
  'Learn the art of sushi making from professional chefs in an interactive class.',
  'Tsukiji, Tokyo',
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
  8000,
  'JPY',
  'food',
  'food'
);

-- Sample activities for Kyoto Cultural Tour - Day 1
INSERT INTO public.trip_activities (
  id,
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
) VALUES 
(
  'c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8',
  'f4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9', -- Kyoto Day 1 ID
  'Fushimi Inari Shrine',
  '08:30',
  'Explore the famous mountain trail lined with thousands of vermilion torii gates.',
  'Fushimi Ward, Kyoto',
  'https://images.unsplash.com/photo-1606596338865-5645e76a3f7d',
  0,
  'JPY',
  'sightseeing',
  'temple'
),
(
  'd4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9',
  'f4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9', -- Kyoto Day 1 ID
  'Traditional Tea Ceremony',
  '13:00',
  'Experience the traditional Japanese tea ceremony in an authentic setting.',
  'Gion, Kyoto',
  'https://images.unsplash.com/photo-1576091895361-b8fe568b0e6d',
  4500,
  'JPY',
  'food',
  'tea'
);

-- Sample activities for Paris Romance - Day 1
INSERT INTO public.trip_activities (
  id,
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
) VALUES 
(
  'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0',
  'b6c7d8e9-f0a1-b2c3-d4e5-f6a7b8c9d0e1', -- Paris Day 1 ID
  'Eiffel Tower Visit',
  '10:00',
  'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris.',
  'Champ de Mars, Paris',
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f',
  25,
  'EUR',
  'sightseeing',
  'landmark'
),
(
  'f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1',
  'b6c7d8e9-f0a1-b2c3-d4e5-f6a7b8c9d0e1', -- Paris Day 1 ID
  'Seine River Cruise',
  '16:30',
  'Enjoy a romantic cruise along the Seine River, passing by famous Parisian landmarks.',
  'Seine River, Paris',
  'https://images.unsplash.com/photo-1499856871958-5b9357976b82',
  30,
  'EUR',
  'transport',
  'boat'
);

-- Weather data for Tokyo Adventure
INSERT INTO public.trip_weather (
  id,
  itinerary_id,
  day_number,
  date,
  condition,
  high_temp,
  low_temp,
  icon
) VALUES 
(
  'a7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  1,
  '2025-05-15',
  'sunny',
  28,
  20,
  'weather-sunny'
),
(
  'b8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  2,
  '2025-05-16',
  'cloudy',
  25,
  19,
  'weather-cloudy'
),
(
  'c9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  3,
  '2025-05-17',
  'rainy',
  22,
  18,
  'weather-rainy'
);

-- Weather overview for Tokyo Adventure
INSERT INTO public.trip_weather_overview (
  id,
  itinerary_id,
  description,
  recommendations
) VALUES 
(
  'd0e1f2a3-b4c5-d6e7-f8a9-b0c1d2e3f4a5',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Expect warm and humid conditions with occasional rain showers during your visit to Tokyo.',
  '[{"id": "rec1", "text": "Pack a light raincoat or umbrella", "icon": "umbrella"}, {"id": "rec2", "text": "Comfortable, breathable clothing recommended", "icon": "tshirt-crew"}, {"id": "rec3", "text": "Stay hydrated", "icon": "water"}]'
);

-- Weather data for Kyoto Cultural Tour
INSERT INTO public.trip_weather (
  id,
  itinerary_id,
  day_number,
  date,
  condition,
  high_temp,
  low_temp,
  icon
) VALUES 
(
  'e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6',
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', -- Kyoto Cultural Tour ID
  1,
  '2025-06-10',
  'sunny',
  29,
  21,
  'weather-sunny'
),
(
  'f2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7',
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', -- Kyoto Cultural Tour ID
  2,
  '2025-06-11',
  'sunny',
  30,
  22,
  'weather-sunny'
);

-- Weather overview for Kyoto Cultural Tour
INSERT INTO public.trip_weather_overview (
  id,
  itinerary_id,
  description,
  recommendations
) VALUES 
(
  'a3b4c5d6-e7f8-a9b0-c1d2-e3f4a5b6c7d8',
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', -- Kyoto Cultural Tour ID
  'Hot and sunny conditions expected throughout your stay in Kyoto.',
  '[{"id": "rec1", "text": "Bring sun protection (hat, sunscreen)", "icon": "white-balance-sunny"}, {"id": "rec2", "text": "Light, breathable clothing", "icon": "tshirt-crew"}, {"id": "rec3", "text": "Stay hydrated", "icon": "water"}]'
);

-- Trip highlights for Tokyo Adventure
INSERT INTO public.trip_highlights (
  id,
  itinerary_id,
  title,
  description,
  icon
) VALUES 
(
  'b4c5d6e7-f8a9-b0c1-d2e3-f4a5b6c7d8e9',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Shibuya Crossing',
  'Experience the worlds busiest pedestrian crossing with up to 3,000 people crossing at once.',
  'city'
),
(
  'c5d6e7f8-a9b0-c1d2-e3f4-a5b6c7d8e9f0',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Tokyo Skytree',
  'Visit one of the tallest structures in the world with panoramic views of Tokyo.',
  'tower-transmission'
),
(
  'd6e7f8a9-b0c1-d2e3-f4a5-b6c7d8e9f0a1',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Sushi Making',
  'Learn the art of sushi making from professional chefs in an interactive class.',
  'food-variant'
);

-- Trip tips for Tokyo Adventure
INSERT INTO public.trip_tips (
  id,
  itinerary_id,
  title,
  description,
  icon,
  category
) VALUES 
(
  'e7f8a9b0-c1d2-e3f4-a5b6-c7d8e9f0a1b2',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Subway Etiquette',
  'Maintain silence on the subway and avoid phone calls. Priority seats are for elderly and those in need.',
  'subway-variant',
  'cultural'
),
(
  'f8a9b0c1-d2e3-f4a5-b6c7-d8e9f0a1b2c3',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Suica/Pasmo Card',
  'Get a Suica or Pasmo card for easy access to trains, subways, and buses throughout Tokyo.',
  'wallet',
  'practical'
),
(
  'a9b0c1d2-e3f4-a5b6-c7d8-e9f0a1b2c3d4',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Convenience Stores',
  'Japanese convenience stores (konbini) offer quality food, ATMs, and many services. They are open 24/7.',
  'store',
  'practical'
);

-- Packing items for Tokyo Adventure
INSERT INTO public.packing_items (
  id,
  itinerary_id,
  name,
  icon,
  essential,
  category
) VALUES 
(
  'b0c1d2e3-f4a5-b6c7-d8e9-f0a1b2c3d4e5',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'JR Pass',
  'ticket',
  true,
  'documents'
),
(
  'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Portable WiFi/SIM Card',
  'wifi',
  true,
  'electronics'
),
(
  'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Lightweight Rain Jacket',
  'jacket',
  false,
  'clothing'
),
(
  'e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Passport',
  'passport',
  true,
  'documents'
);

-- Trip warnings for Tokyo Adventure
INSERT INTO public.trip_warnings (
  id,
  itinerary_id,
  title,
  description,
  severity,
  icon
) VALUES 
(
  'f4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Earthquake Awareness',
  'Japan experiences frequent earthquakes. Familiarize yourself with safety procedures at your accommodation.',
  'medium',
  'alert'
),
(
  'a5b6c7d8-e9f0-a1b2-c3d4-e5f6a7b8c9d0',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  'Rush Hour Trains',
  'Trains can be extremely crowded during rush hours (7:30-9:00 AM and 5:30-7:30 PM). Consider adjusting travel times.',
  'low',
  'train'
);

-- Shared itineraries (User sharing Tokyo Adventure)
INSERT INTO public.shared_itineraries (
  id,
  itinerary_id,
  user_id,
  user_email,
  permission,
  created_by
) VALUES 
(
  'b6c7d8e9-f0a1-b2c3-d4e5-f6a7b8c9d0e1',
  '8f7b5a3e-1d2c-4b5a-9d8e-7f6a5b4c3d2e', -- Tokyo Adventure ID
  '93d2b9c6-1f7e-4ced-9e62-8044fa98ed9d', -- Friend's user_id
  'dem3@gmail.com',
  'view',
  'da0642c5-4a46-4fc8-a5f2-7b1a66bb0755' -- Owner's user_id
);

-- Activity votes (Upvoting Tokyo Skytree activity)
INSERT INTO public.activity_votes (
  id,
  activity_id,
  user_id,
  vote_type
) VALUES 
(
  'c7d8e9f0-a1b2-c3d4-e5f6-a7b8c9d0e1f2',
  'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', -- Tokyo Skytree activity ID
  '93d2b9c6-1f7e-4ced-9e62-8044fa98ed9d', -- Friend's user_id
  'upvote'
),
(
  'd8e9f0a1-b2c3-d4e5-f6a7-b8c9d0e1f2a3',
  'd8e9f0a1-b2c3-d4e5-f6a7-b8c9d0e1f2a3', -- Meiji Shrine activity ID
  '93d2b9c6-1f7e-4ced-9e62-8044fa98ed9d', -- Friend's user_id
  'upvote'
),
(
  'e9f0a1b2-c3d4-e5f6-a7b8-c9d0e1f2a3b4',
  'e9f0a1b2-c3d4-e5f6-a7b8-c9d0e1f2a3b4', -- Lunch at Harajuku activity ID
  '93d2b9c6-1f7e-4ced-9e62-8044fa98ed9d', -- Friend's user_id
  'downvote'
);

-- Activity comments
INSERT INTO public.activity_comments (
  id,
  activity_id,
  user_id,
  comment
) VALUES 
(
  'f0a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
  'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', -- Tokyo Skytree activity ID
  '93d2b9c6-1f7e-4ced-9e62-8044fa98ed9d', -- Friend's user_id
  'The view is absolutely breathtaking! I suggest going before sunset to see the city transform from day to night.'
),
(
  'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
  'd8e9f0a1-b2c3-d4e5-f6a7-b8c9d0e1f2a3', -- Meiji Shrine activity ID
  '93d2b9c6-1f7e-4ced-9e62-8044fa98ed9d', -- Friend's user_id
  'Very peaceful place. Go early in the morning to avoid crowds.'
),
(
  'b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7',
  'd8e9f0a1-b2c3-d4e5-f6a7-b8c9d0e1f2a3', -- Meiji Shrine activity ID
  'da0642c5-4a46-4fc8-a5f2-7b1a66bb0755', -- Owner's user_id
  'Great tip! We will try to get there around 8:30 AM.'
);