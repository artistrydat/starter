-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create profiles table with all necessary columns
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  phone text,
  last_seen_at timestamp with time zone default timezone('utc'::text, now()),
  onboarding_completed_at timestamp with time zone,
  preferences jsonb default '{}'::jsonb,
  travel_preferences jsonb default '{}'::jsonb,
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

-- Create a trigger to create profile records when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();