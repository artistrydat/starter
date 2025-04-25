-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create profiles table with all necessary columns
create table if not exists public.profiles (
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

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create consolidated RLS policies
create policy "Users can read their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Add policy for inserting profiles
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Create a trigger to create profile records when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email,
    onboarding_completed,
    travel_preferences
  )
  values (
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
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create an index for better performance when querying travel preferences
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

-- Update RLS policies to allow users to update their travel preferences
CREATE POLICY "Users can update their own travel preferences"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

COMMENT ON COLUMN public.profiles.travel_preferences IS 'User travel preferences including vibe, companions, purpose, budget (amount and style), food, and tech preferences';