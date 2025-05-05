import { create } from 'zustand';

import {
  TripItinerary,
  PriceLevel,
  TripDay,
  TripActivity,
  ActivityComment,
  ActivityVote,
  VoteType,
  TripWeather,
  WeatherOverview,
  TripWarning,
  TripTip,
  TripHighlight,
  PermissionType,
  SharedUser,
} from '@/src/types/destinations';
import { mockItinerary, emptyItinerary } from '@/src/utils/mockItinerary';
import { supabase } from '@/src/utils/supabaseClient';

interface TripStore {
  // Main state
  destinations: TripItinerary[];
  currentItinerary: TripItinerary | null;
  isLoading: boolean;
  error: string | null;
  favorites: string[];
  selectedCategory: string;
  searchQuery: string;
  searchResults: TripItinerary[];
  isSearching: boolean;
  userItineraries: TripItinerary[];
  sharedItineraries: TripItinerary[];

  // Destinations operations
  fetchDestinations: (category?: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (destinationId: string) => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  searchDestinations: (query: string) => void;
  clearSearch: () => void;

  // Core Itinerary operations
  fetchItinerary: (itineraryId: string) => Promise<TripItinerary | null>;
  fetchUserItineraries: () => Promise<void>;
  fetchSharedItineraries: () => Promise<void>;
  createItinerary: (itinerary: Omit<TripItinerary, 'id'>) => Promise<TripItinerary | null>;
  updateItinerary: (itinerary: TripItinerary) => Promise<TripItinerary | null>;
  deleteItinerary: (itineraryId: string) => Promise<boolean>;
  setCurrentItinerary: (itinerary: TripItinerary) => void;

  // Day operations
  fetchDays: (itineraryId: string) => Promise<TripDay[]>;
  updateDay: (day: TripDay) => Promise<TripDay>;
  createDay: (day: Omit<TripDay, 'id'>) => Promise<TripDay>;
  deleteDay: (dayId: string) => Promise<boolean>;

  // Activity operations
  fetchActivities: (dayId: string) => Promise<TripActivity[]>;
  createActivity: (activity: Omit<TripActivity, 'id'>) => Promise<TripActivity>;
  updateActivity: (activity: TripActivity) => Promise<TripActivity>;
  deleteActivity: (dayId: string, activityId: string) => Promise<boolean>;
  addActivityComment: (activityId: string, comment: string) => Promise<ActivityComment>;
  addActivityVote: (activityId: string, voteType: VoteType) => Promise<ActivityVote>;

  // Weather operations
  fetchWeather: (itineraryId: string) => Promise<void>;
  updateWeather: (dailyWeather: TripWeather[]) => Promise<void>;
  fetchWeatherOverview: (itineraryId: string) => Promise<void>;
  updateWeatherOverview: (overview: WeatherOverview) => Promise<void>;

  // Warnings operations
  fetchWarnings: (itineraryId: string) => Promise<void>;
  updateWarnings: (warnings: TripWarning[]) => Promise<void>;

  // Tips operations
  fetchTips: (itineraryId: string) => Promise<void>;
  updateTips: (tips: TripTip[]) => Promise<void>;
  fetchHighlights: (itineraryId: string) => Promise<void>;
  updateHighlights: (highlights: TripHighlight[]) => Promise<void>;

  // Share operations
  fetchSharedUsers: (itineraryId: string) => Promise<void>;
  shareItinerary: (itineraryId: string, email: string, permission: PermissionType) => Promise<void>;
  removeSharedUser: (sharedId: string) => Promise<void>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  // Initial state
  destinations: [],
  currentItinerary: null,
  isLoading: false,
  error: null,
  favorites: [],
  selectedCategory: 'all',
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  userItineraries: [],
  sharedItineraries: [],

  // Destination operations
  fetchDestinations: async (category = 'all') => {
    try {
      set({ isLoading: true, error: null });
      console.log('Fetching itineraries from trip_itineraries table...');

      // Fetch itineraries from Supabase using trip_itineraries table
      let query = supabase.from('trip_itineraries').select(`
          id,
          title,
          destination,
          description,
          image_url,
          total_cost,
          currency,
          user_id,
          created_at,
          updated_at,
          start_date,
          end_date
        `);

      // Apply category filter if not 'all'
      if (category !== 'all') {
        query = query.ilike('destination', `%${category}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching itineraries:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} itineraries`);

      // Transform trip_itineraries data to match TripItinerary structure
      const transformedData: TripItinerary[] =
        data?.map((item) => ({
          id: item.id,
          title: item.title,
          location: item.destination,
          description: item.description || '',
          image_url: item.image_url || '',
          total_cost: item.total_cost || 0,
          currency: item.currency || 'USD',
          user_id: item.user_id || '',
          city: item.destination || '', // Using destination as city if not specified
          rating: 0, // Default value
          price_level: PriceLevel.Moderate,
          tags: [],
          category: '',
          created_at: item.created_at,
          updated_at: item.updated_at,
          start_date: item.start_date,
          end_date: item.end_date,
          // Adding required properties that don't exist in the database
          coordinates: { lat: 0, lng: 0 },
          is_featured: false,
          is_bookmarked: false,
          is_shared: false,
          is_public: true,
          is_private: false,
          is_completed: false,
          days: [],
          weather: [],
          trip_highlights: [],
          packing_recommendation: [],
          warnings: [],
          shared_users: [],
          general_tips: [],
        })) || [];

      set({ destinations: transformedData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itineraries';
      console.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFavorites: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        set({ favorites: [] });
        return;
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select('destination_id')
        .eq('user_id', session.user.id);

      if (error) throw error;

      set({ favorites: data ? data.map((item) => item.destination_id) : [] });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // We don't set an error state here since this is not a critical failure
    }
  },

  toggleFavorite: async (destinationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('You must be logged in to favorite destinations');
      }

      const favorites = get().favorites;
      const isFavorited = favorites.includes(destinationId);

      // Optimistic update
      set({
        favorites: isFavorited
          ? favorites.filter((id) => id !== destinationId)
          : [...favorites, destinationId],
      });

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('destination_id', destinationId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase.from('user_favorites').insert({
          user_id: session.user.id,
          destination_id: destinationId,
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      await get().fetchFavorites();
    }
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
    get().fetchDestinations(category);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });

    // If query is empty, clear search
    if (!query) {
      get().clearSearch();
    }
  },

  searchDestinations: (query: string) => {
    if (!query.trim()) {
      get().clearSearch();
      return;
    }

    set({ isSearching: true });

    // Simple client-side search
    const results = get().destinations.filter(
      (dest) =>
        dest.title.toLowerCase().includes(query.toLowerCase()) ||
        dest.location.toLowerCase().includes(query.toLowerCase()) ||
        dest.description?.toLowerCase().includes(query.toLowerCase()) ||
        dest.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    set({
      searchResults: results,
      isSearching: false,
    });
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      searchResults: [],
      isSearching: false,
    });
  },

  // Core Itinerary operations
  setCurrentItinerary: (itinerary: TripItinerary) => {
    set({ currentItinerary: itinerary });
  },

  fetchItinerary: async (itineraryId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Instead of fetching from Supabase, return mock data
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Return the mock itinerary if IDs match, otherwise return empty
      const itinerary =
        itineraryId === 'mock-itinerary-123' ? { ...mockItinerary } : { ...emptyItinerary };

      set({ currentItinerary: itinerary });
      return itinerary;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserItineraries: async () => {
    try {
      set({ isLoading: true });

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Return array with just the mock itinerary
      set({ userItineraries: [mockItinerary] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSharedItineraries: async () => {
    try {
      set({ isLoading: true });

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Return empty array for now - can populate with mock data if needed
      set({ sharedItineraries: [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  createItinerary: async (itinerary) => {
    try {
      set({ isLoading: true });

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a mock ID and timestamps
      const now = new Date().toISOString();
      const newItinerary: TripItinerary = {
        ...itinerary,
        id: `mock-${Math.random().toString(36).substring(2, 9)}`,
        created_at: now,
        updated_at: now,
      };

      set((state) => ({
        userItineraries: [newItinerary, ...state.userItineraries],
      }));

      return newItinerary;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateItinerary: async (itinerary) => {
    try {
      set({ isLoading: true });

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update timestamp
      const updatedItinerary = {
        ...itinerary,
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        userItineraries: state.userItineraries.map((item) =>
          item.id === itinerary.id ? updatedItinerary : item
        ),
        currentItinerary:
          state.currentItinerary?.id === itinerary.id ? updatedItinerary : state.currentItinerary,
      }));

      return updatedItinerary;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteItinerary: async (itineraryId) => {
    try {
      set({ isLoading: true });

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      set((state) => ({
        userItineraries: state.userItineraries.filter((item) => item.id !== itineraryId),
        currentItinerary:
          state.currentItinerary?.id === itineraryId ? null : state.currentItinerary,
      }));

      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Day operations
  fetchDays: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const days = mockItinerary.days || [];

      // Update current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary) {
        set({
          currentItinerary: {
            ...currentItinerary,
            days,
          },
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      return days;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch days' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  updateDay: async (day) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Update the day in the itinerary
      const updatedDays = currentItinerary.days?.map((d) => (d.id === day.id ? day : d)) || [];

      set({
        currentItinerary: {
          ...currentItinerary,
          days: updatedDays,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return day;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update day' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createDay: async (day) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new day with mock ID
      const newDay: TripDay = {
        ...day,
        id: `day-${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        activities: [],
      };

      const updatedDays = [...(currentItinerary.days || []), newDay];

      set({
        currentItinerary: {
          ...currentItinerary,
          days: updatedDays,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return newDay;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create day' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDay: async (dayId) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Remove the day from the itinerary
      const updatedDays = currentItinerary.days?.filter((d) => d.id !== dayId) || [];

      set({
        currentItinerary: {
          ...currentItinerary,
          days: updatedDays,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete day' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Activity operations
  fetchActivities: async (dayId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data - find the day in the mock itinerary and get its activities
      const day = mockItinerary.days.find((d) => d.id === dayId);
      const activities = day?.activities || [];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      return activities;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch activities' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  createActivity: async (activity) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new activity with mock ID
      const newActivity: TripActivity = {
        ...activity,
        id: `activity-${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        votes: [],
        ActivityComment: [], // Fix: Use correct property name from TripActivity type
      };

      // Find the day and add the activity to it
      const days = currentItinerary.days?.map((d) => {
        if (d.id === activity.day_id) {
          return {
            ...d,
            activities: [...(d.activities || []), newActivity],
          };
        }
        return d;
      });

      set({
        currentItinerary: {
          ...currentItinerary,
          days: days || [],
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return newActivity;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create activity' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateActivity: async (activity) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Find the day and update the activity in it
      const days = currentItinerary.days?.map((d) => {
        if (d.id === activity.day_id) {
          return {
            ...d,
            activities: d.activities?.map((a) => (a.id === activity.id ? activity : a)) || [],
          };
        }
        return d;
      });

      set({
        currentItinerary: {
          ...currentItinerary,
          days: days || [],
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return activity;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update activity' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteActivity: async (dayId, activityId) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Find the day and remove the activity from it
      const days = currentItinerary.days?.map((d) => {
        if (d.id === dayId) {
          return {
            ...d,
            activities: d.activities?.filter((a) => a.id !== activityId) || [],
          };
        }
        return d;
      });

      set({
        currentItinerary: {
          ...currentItinerary,
          days: days || [],
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete activity' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  addActivityComment: async (activityId, comment) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new comment with mock data
      const newComment: ActivityComment = {
        id: `comment-${Math.random().toString(36).substring(2, 9)}`,
        activity_id: activityId,
        user_id: 'current-user',
        text: comment,
        created_at: new Date().toISOString(),
        user_name: 'Current User',
      };

      // Find the activity and add the comment to it
      let activityFound = false;
      const days = currentItinerary.days?.map((d) => {
        const activities = d.activities?.map((a) => {
          if (a.id === activityId) {
            activityFound = true;
            return {
              ...a,
              ActivityComment: [...(a.ActivityComment || []), newComment], // Fix: Use correct property name from TripActivity type
            };
          }
          return a;
        });

        return {
          ...d,
          activities: activities || [],
        };
      });

      if (!activityFound) throw new Error('Activity not found');

      set({
        currentItinerary: {
          ...currentItinerary,
          days: days || [],
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return newComment;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add comment' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addActivityVote: async (activityId, voteType) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new vote with mock data
      const newVote: ActivityVote = {
        id: `vote-${Math.random().toString(36).substring(2, 9)}`,
        activity_id: activityId,
        user_id: 'current-user',
        vote_type: voteType,
        created_at: new Date().toISOString(),
      };

      // Find the activity and add the vote to it
      let activityFound = false;
      const days = currentItinerary.days?.map((d) => {
        const activities = d.activities?.map((a) => {
          if (a.id === activityId) {
            activityFound = true;

            // Check if user already voted and replace if so
            const existingVoteIndex = a.votes?.findIndex((v) => v.user_id === 'current-user');
            const updatedVotes = [...(a.votes || [])];

            if (existingVoteIndex !== undefined && existingVoteIndex >= 0) {
              updatedVotes[existingVoteIndex] = newVote;
            } else {
              updatedVotes.push(newVote);
            }

            return {
              ...a,
              votes: updatedVotes,
            };
          }
          return a;
        });

        return {
          ...d,
          activities: activities || [],
        };
      });

      if (!activityFound) throw new Error('Activity not found');

      set({
        currentItinerary: {
          ...currentItinerary,
          days: days || [],
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return newVote;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add vote' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Weather operations
  fetchWeather: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const formattedWeather = mockItinerary.weather.map((w) => ({
        id: w.id,
        itinerary_id: itineraryId,
        day: w.day,
        date: w.date,
        condition: w.condition,
        high_temp: w.high_temp,
        low_temp: w.low_temp,
        icon: w.icon,
        created_at: w.created_at || new Date().toISOString(),
      }));

      // Update current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary) {
        set({
          currentItinerary: {
            ...currentItinerary,
            weather: formattedWeather,
          },
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch weather data' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateWeather: async (dailyWeather) => {
    try {
      set({ isLoading: true });
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Update the store with provided data
      set({
        currentItinerary: {
          ...currentItinerary,
          weather: dailyWeather,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update weather data' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWeatherOverview: async (itineraryId) => {
    try {
      set({ isLoading: true });

      // Use mock data
      const formattedOverview = mockItinerary.weather_overview
        ? {
            id: mockItinerary.weather_overview.id || `overview-${Date.now()}`,
            itinerary_id: itineraryId,
            description: mockItinerary.weather_overview.description,
            recommendations: mockItinerary.weather_overview.recommendations.map((r) => ({
              id: r.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              weather_overview_id: mockItinerary.weather_overview?.id || `overview-${Date.now()}`,
              text: r.text,
              icon: r.icon,
              created_at: r.created_at || new Date().toISOString(),
            })),
            created_at: mockItinerary.weather_overview.created_at || new Date().toISOString(),
          }
        : undefined; // Fix: Use undefined instead of null to match the WeatherOverview | undefined type

      // Update current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary) {
        set({
          currentItinerary: {
            ...currentItinerary,
            weather_overview: formattedOverview,
          },
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch weather overview' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateWeatherOverview: async (overview) => {
    try {
      set({ isLoading: true });
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Update the store with provided data
      set({
        currentItinerary: {
          ...currentItinerary,
          weather_overview: overview,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update weather overview' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Warnings operations
  fetchWarnings: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const formattedWarnings = mockItinerary.warnings.map((w) => ({
        id: w.id || `warning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        itinerary_id: itineraryId,
        title: w.title,
        description: w.description,
        severity: w.severity,
        icon: w.icon,
        created_at: w.created_at || new Date().toISOString(),
      }));

      // Update current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary) {
        set({
          currentItinerary: {
            ...currentItinerary,
            warnings: formattedWarnings,
          },
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch warnings' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateWarnings: async (warnings) => {
    try {
      set({ isLoading: true });
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Update the store with provided data
      set({
        currentItinerary: {
          ...currentItinerary,
          warnings,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update warnings' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Tips operations
  fetchTips: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const formattedTips = mockItinerary.general_tips.map((t) => ({
        id: t.id || `tip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        itinerary_id: itineraryId,
        title: t.title,
        description: t.description,
        icon: t.icon,
        category: t.category,
        created_at: t.created_at || new Date().toISOString(),
      }));

      // Update current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary) {
        set({
          currentItinerary: {
            ...currentItinerary,
            general_tips: formattedTips,
          },
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tips' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTips: async (tips) => {
    try {
      set({ isLoading: true });
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Update the store with provided data
      set({
        currentItinerary: {
          ...currentItinerary,
          general_tips: tips,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update tips' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHighlights: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const formattedHighlights = mockItinerary.trip_highlights.map((h) => ({
        id: h.id || `highlight-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        itinerary_id: itineraryId,
        title: h.title,
        description: h.description,
        icon: h.icon,
        created_at: h.created_at || new Date().toISOString(),
      }));

      // Update current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary) {
        set({
          currentItinerary: {
            ...currentItinerary,
            trip_highlights: formattedHighlights,
          },
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch highlights' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateHighlights: async (highlights) => {
    try {
      set({ isLoading: true });
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Update the store with provided data
      set({
        currentItinerary: {
          ...currentItinerary,
          trip_highlights: highlights,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update highlights' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Share operations
  fetchSharedUsers: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const sharedUsers = mockItinerary.shared_users || [];

      // Update current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary) {
        set({
          currentItinerary: {
            ...currentItinerary,
            shared_users: sharedUsers,
          },
        });
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch shared users' });
    } finally {
      set({ isLoading: false });
    }
  },

  shareItinerary: async (itineraryId, email, permission) => {
    try {
      set({ isLoading: true, error: null });

      // Create a mock shared user
      const newSharedUser: SharedUser = {
        id: `shared-${Math.random().toString(36).substring(2, 9)}`,
        user_id: `user-${Math.random().toString(36).substring(2, 9)}`,
        itinerary_id: itineraryId,
        user_email: email,
        permission,
        created_at: new Date().toISOString(),
        user_name: 'Mock User',
      };

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      const updatedSharedUsers = [...(currentItinerary.shared_users || []), newSharedUser];

      set({
        currentItinerary: {
          ...currentItinerary,
          shared_users: updatedSharedUsers,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to share itinerary' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeSharedUser: async (sharedId) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      const updatedSharedUsers =
        currentItinerary.shared_users?.filter((user) => user.id !== sharedId) || [];

      set({
        currentItinerary: {
          ...currentItinerary,
          shared_users: updatedSharedUsers,
        },
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove shared user' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
