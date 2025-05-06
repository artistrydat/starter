import { create } from 'zustand';

import {
  TripItinerary,
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
import { mockItineraries } from '@/src/utils/mockItinerary';
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

  // Mock data toggle - this stays at the top level
  useMock: boolean;
  setUseMock: (useMock: boolean) => void;

  // Supabase operations - clearly named to indicate they use Supabase
  // Destinations operations
  supabaseFetchDestinations: (category?: string) => Promise<void>;
  supabaseFetchFavorites: () => Promise<void>;
  supabaseToggleFavorite: (destinationId: string) => Promise<void>;
  supabaseToggleFavoriteProperty: (destinationId: string) => Promise<boolean>;
  supabaseSearchDestinations: (query: string) => void;

  // Core Itinerary operations
  supabaseFetchItinerary: (itineraryId: string) => Promise<TripItinerary | null>;
  supabaseFetchUserItineraries: () => Promise<void>;
  supabaseFetchSharedItineraries: () => Promise<void>;
  supabaseCreateItinerary: (itinerary: Omit<TripItinerary, 'id'>) => Promise<TripItinerary | null>;
  supabaseUpdateItinerary: (itinerary: TripItinerary) => Promise<TripItinerary | null>;
  supabaseDeleteItinerary: (itineraryId: string) => Promise<boolean>;
  setCurrentItinerary: (itinerary: TripItinerary) => void;

  // UI actions
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Main operations that delegate to either mock or real implementation
  fetchDestinations: (category?: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (destinationId: string) => Promise<void>;
  searchDestinations: (query: string) => void;
  fetchItinerary: (itineraryId: string) => Promise<TripItinerary | null>;
  fetchUserItineraries: () => Promise<void>;
  fetchSharedItineraries: () => Promise<void>;
  createItinerary: (itinerary: Omit<TripItinerary, 'id'>) => Promise<TripItinerary | null>;
  updateItinerary: (itinerary: TripItinerary) => Promise<TripItinerary | null>;
  deleteItinerary: (itineraryId: string) => Promise<boolean>;

  // Rest of the operations... (keeping the existing interface)
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

  // Mock data is now hardcoded to true
  useMock: true,

  // We keep this method for compatibility but it won't do anything
  setUseMock: () => set({ useMock: true }),

  // Supabase implementation for destinations operations and other Supabase operations...
  supabaseFetchDestinations: async (category = 'all') => {
    try {
      set({ isLoading: true, error: null });

      console.log('Fetching itineraries from trip_itineraries table...');

      // Fetch itineraries from Supabase using trip_itineraries table
      let query = supabase.from('trip_itineraries').select('*').eq('is_public', true);

      // Apply category filter if not 'all'
      if (category === 'favorites') {
        // For favorites, we need to filter by is_favorite
        query = query.eq('is_favorite', true);
      } else if (category !== 'all') {
        // For other categories, filter by tags
        query = query.containedBy('tags', [category]);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch itineraries: ${error.message}`);
      }

      console.log(`Fetched ${data?.length || 0} itineraries`);

      // Transform trip_itineraries data to match TripItinerary structure
      // We need to cast the result to TripItinerary and provide default values
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        destination: item.destination,
        description: item.description || '',
        image_url: item.image_url || '',
        total_cost: item.total_cost || 0,
        currency: item.currency || 'USD',
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        start_date: item.start_date,
        end_date: item.end_date,
        is_public: item.is_public || false,
        is_favorite: item.is_favorite || false,
        location: item.location || '',
        tags: item.tags || [],
        city: item.city || '',
        days: item.days || [],
        distance: item.distance || 0,
        category: item.category || '',
        weather: item.weather || [],
        weather_overview: item.weather_overview || null,
        general_tips: item.general_tips || [],
        trip_highlights: item.trip_highlights || [],
        warnings: item.warnings || [],
        shared_users: item.shared_users || [],
        packing_recommendation: item.packing_recommendation || [],
      })) as TripItinerary[];

      set({
        destinations: transformedData,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itineraries';
      console.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
    }
  },

  supabaseSearchDestinations: (query: string) => {
    if (!query.trim()) {
      get().clearSearch();
      return;
    }

    set({ isSearching: true });

    // This should be a Supabase fulltext search in production
    // For now implementing basic client-side filtering
    const filteredResults = get().destinations.filter(
      (dest) =>
        dest.title.toLowerCase().includes(query.toLowerCase()) ||
        dest.location?.toLowerCase().includes(query.toLowerCase()) ||
        dest.description?.toLowerCase().includes(query.toLowerCase()) ||
        dest.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    set({
      searchResults: filteredResults,
      isSearching: false,
    });
  },

  supabaseFetchItinerary: async (itineraryId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('trip_itineraries')
        .select('*')
        .eq('id', itineraryId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch itinerary: ${error.message}`);
      }

      set({ currentItinerary: data, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return null;
    }
  },

  supabaseFetchUserItineraries: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('trip_itineraries')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        throw new Error(`Failed to fetch user itineraries: ${error.message}`);
      }

      set({ userItineraries: data || [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  supabaseFetchSharedItineraries: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // First get shared_itinerary IDs for this user
      const { data: sharedData, error: sharedError } = await supabase
        .from('shared_itineraries')
        .select('itinerary_id')
        .eq('user_id', session.user.id);

      if (sharedError) {
        throw new Error(`Failed to fetch shared itineraries: ${sharedError.message}`);
      }

      if (!sharedData || sharedData.length === 0) {
        set({ sharedItineraries: [], isLoading: false });
        return;
      }

      // Then fetch the actual itineraries
      const itineraryIds = sharedData.map((item) => item.itinerary_id);
      const { data, error } = await supabase
        .from('trip_itineraries')
        .select('*')
        .in('id', itineraryIds);

      if (error) {
        throw new Error(`Failed to fetch shared itineraries: ${error.message}`);
      }

      set({ sharedItineraries: data || [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  supabaseCreateItinerary: async (itinerary) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('trip_itineraries')
        .insert({
          ...itinerary,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create itinerary: ${error.message}`);
      }

      set((state) => ({
        userItineraries: [data, ...state.userItineraries],
        isLoading: false,
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return null;
    }
  },

  supabaseUpdateItinerary: async (itinerary) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('trip_itineraries')
        .update({
          ...itinerary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itinerary.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update itinerary: ${error.message}`);
      }

      set((state) => ({
        userItineraries: state.userItineraries.map((item) =>
          item.id === itinerary.id ? data : item
        ),
        currentItinerary:
          state.currentItinerary?.id === itinerary.id ? data : state.currentItinerary,
        isLoading: false,
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return null;
    }
  },

  supabaseDeleteItinerary: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.from('trip_itineraries').delete().eq('id', itineraryId);

      if (error) {
        throw new Error(`Failed to delete itinerary: ${error.message}`);
      }

      set((state) => ({
        userItineraries: state.userItineraries.filter((item) => item.id !== itineraryId),
        currentItinerary:
          state.currentItinerary?.id === itineraryId ? null : state.currentItinerary,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return false;
    }
  },

  // UI actions that don't directly involve data fetching
  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
    // Note that we call either mock or real fetch based on useMock flag
    if (get().useMock) {
      get().fetchDestinations(category);
    } else {
      get().supabaseFetchDestinations(category);
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });

    // If query is empty, clear search
    if (!query) {
      get().clearSearch();
    }
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      searchResults: [],
      isSearching: false,
    });
  },

  setCurrentItinerary: (itinerary: TripItinerary) => {
    set({ currentItinerary: itinerary });
  },

  // The original mock implementations remain unchanged
  fetchDestinations: async (category = 'all') => {
    try {
      set({ isLoading: true, error: null });

      // Check if using mock data
      const useMock = get().useMock;

      if (useMock) {
        // Use mock data from mockItineraries
        console.log('Using mock data for destinations');

        // Get public itineraries from the mock data
        let filteredItineraries = mockItineraries.filter(
          (itinerary) => itinerary.is_public === true
        );

        // Apply category filter if needed
        if (category === 'favorites') {
          // Filter by is_favorite property
          filteredItineraries = filteredItineraries.filter(
            (itinerary) => itinerary.is_favorite === true
          );
        } else if (category !== 'all') {
          // Filter by tag or category that matches the selected category
          filteredItineraries = filteredItineraries.filter(
            (itinerary) => itinerary.tags?.includes(category) || itinerary.category === category
          );
        }

        set({ destinations: filteredItineraries });
      } else {
        // Use the Supabase implementation
        await get().supabaseFetchDestinations(category);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itineraries';
      console.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  // For the rest of the methods, follow the same pattern:
  // 1. Check useMock flag
  // 2. If true, use mock implementation
  // 3. If false, call the Supabase implementation
  supabaseFetchFavorites: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select('itinerary_id')
        .eq('user_id', session.user.id);

      if (error) {
        throw new Error(`Failed to fetch favorites: ${error.message}`);
      }

      set({ favorites: data ? data.map((item) => item.itinerary_id) : [] });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // We don't set an error state here since this is not a critical failure
    }
  },

  supabaseToggleFavorite: async (destinationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
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
          .eq('itinerary_id', destinationId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase.from('user_favorites').insert({
          user_id: session.user.id,
          itinerary_id: destinationId,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      await get().supabaseFetchFavorites();
    }
  },
  supabaseToggleFavoriteProperty: async (destinationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // Get the current itinerary to check its is_favorite status
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('trip_itineraries')
        .select('is_favorite')
        .eq('id', destinationId)
        .single();

      if (itineraryError) {
        throw new Error(`Failed to get itinerary: ${itineraryError.message}`);
      }

      const currentIsFavorite = itineraryData?.is_favorite || false;

      // Update the is_favorite field in the trip_itineraries table
      const { error: updateError } = await supabase
        .from('trip_itineraries')
        .update({ is_favorite: !currentIsFavorite })
        .eq('id', destinationId);

      if (updateError) {
        throw new Error(`Failed to update favorite status: ${updateError.message}`);
      }

      // Also update the favorites array in the store for UI consistency
      const favorites = get().favorites;
      const isFavorited = favorites.includes(destinationId);

      set({
        favorites: isFavorited
          ? favorites.filter((id) => id !== destinationId)
          : [...favorites, destinationId],
      });

      // Also update any destinations in the current state
      const { destinations } = get();
      const updatedDestinations = destinations.map((item) =>
        item.id === destinationId ? { ...item, is_favorite: !currentIsFavorite } : item
      );

      set({ destinations: updatedDestinations });

      // Also maintain backward compatibility with user_favorites table
      await get().supabaseToggleFavorite(destinationId);

      return !currentIsFavorite;
    } catch (error) {
      console.error('Error toggling favorite property:', error);
      throw error;
    }
  },
  fetchFavorites: async () => {
    try {
      const useMock = get().useMock;

      if (useMock) {
        // Use mock data
        console.log('Using mock data for favorites');
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        // Include the Tokyo itinerary in favorites
        set({ favorites: ['mock-itinerary-tokyo'] });
      } else {
        // Use Supabase implementation
        await get().supabaseFetchFavorites();
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  },

  toggleFavorite: async (destinationId: string) => {
    try {
      const useMock = get().useMock;

      if (useMock) {
        // Mock implementation
        console.log(`Toggling favorite for destination ${destinationId} (mock)`);

        // Find the itinerary in our mock data
        const mockIndex = mockItineraries.findIndex((item) => item.id === destinationId);

        if (mockIndex >= 0) {
          // Toggle the is_favorite property directly
          mockItineraries[mockIndex].is_favorite = !mockItineraries[mockIndex].is_favorite;

          // Update the destination in the store if it's currently loaded
          const { destinations } = get();
          const updatedDestinations = destinations.map((item) =>
            item.id === destinationId
              ? { ...item, is_favorite: mockItineraries[mockIndex].is_favorite }
              : item
          );

          set({ destinations: updatedDestinations });

          // Update the favorites array for backwards compatibility
          const favorites = get().favorites;
          const isFavorited = favorites.includes(destinationId);

          set({
            favorites: isFavorited
              ? favorites.filter((id) => id !== destinationId)
              : [...favorites, destinationId],
          });
        }
      } else {
        // Supabase implementation
        await get().supabaseToggleFavoriteProperty(destinationId);
      }

      // Refresh the list if we're viewing favorites to ensure UI consistency
      if (get().selectedCategory === 'favorites') {
        await get().fetchDestinations('favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Refresh favorites to ensure UI is in sync with backend
      get().fetchFavorites();
    }
  },

  searchDestinations: (query: string) => {
    if (!query.trim()) {
      get().clearSearch();
      return;
    }

    const useMock = get().useMock;

    if (useMock) {
      set({ isSearching: true });

      // Simple client-side search for mock data
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
    } else {
      // Use Supabase implementation
      get().supabaseSearchDestinations(query);
    }
  },

  // Continue pattern for remaining methods...
  fetchItinerary: async (itineraryId: string) => {
    try {
      set({ isLoading: true, error: null });
      const useMock = get().useMock;

      if (useMock) {
        // Use mock data
        console.log(`Fetching mock itinerary ${itineraryId}`);

        // Find the itinerary in mock data
        const mockItinerary = mockItineraries.find((item) => item.id === itineraryId);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (mockItinerary) {
          set({ currentItinerary: mockItinerary });
          return mockItinerary;
        }
        return null;
      } else {
        // Use Supabase implementation
        return await get().supabaseFetchItinerary(itineraryId);
      }
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
      const useMock = get().useMock;

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Return array with just the mock itinerary
        set({ userItineraries: [mockItineraries[0]] });
      } else {
        // Use Supabase implementation
        await get().supabaseFetchUserItineraries();
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSharedItineraries: async () => {
    try {
      set({ isLoading: true });
      const useMock = get().useMock;

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Return empty array for now - can populate with mock data if needed
        set({ sharedItineraries: [] });
      } else {
        // Use Supabase implementation
        await get().supabaseFetchSharedItineraries();
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  createItinerary: async (itinerary) => {
    try {
      set({ isLoading: true });
      const useMock = get().useMock;

      if (useMock) {
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
      } else {
        // Use Supabase implementation
        return await get().supabaseCreateItinerary(itinerary);
      }
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
      const useMock = get().useMock;

      if (useMock) {
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
      } else {
        // Use Supabase implementation
        return await get().supabaseUpdateItinerary(itinerary);
      }
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
      const useMock = get().useMock;

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 700));

        set((state) => ({
          userItineraries: state.userItineraries.filter((item) => item.id !== itineraryId),
          currentItinerary:
            state.currentItinerary?.id === itineraryId ? null : state.currentItinerary,
        }));

        return true;
      } else {
        // Use Supabase implementation
        return await get().supabaseDeleteItinerary(itineraryId);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Keep the rest of the methods with the same pattern
  // Day operations
  fetchDays: async (itineraryId: string): Promise<TripDay[]> => {
    try {
      const { currentItinerary } = get();

      // If we have the current itinerary loaded with the requested ID, return its days
      if (currentItinerary && currentItinerary.id === itineraryId) {
        return currentItinerary.days || [];
      }

      // Otherwise, fetch the itinerary first
      const itinerary = await get().fetchItinerary(itineraryId);
      return itinerary?.days || [];
    } catch (error) {
      console.error('Error fetching days:', error);
      return [];
    }
  },

  createDay: async (day: Omit<TripDay, 'id'>): Promise<TripDay> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Create a new day with a generated ID
      const newDay: TripDay = {
        ...day,
        id: useMock ? `day-${Math.random().toString(36).substring(2, 9)}` : crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Add the day to the current itinerary
        const updatedDays = [...(currentItinerary.days || []), newDay];
        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newDay;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Add the day to the current itinerary
        const updatedDays = [...(currentItinerary.days || []), newDay];
        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newDay;
      }
    } catch (error) {
      console.error('Error creating day:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateDay: async (day: TripDay): Promise<TripDay> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Update the day in the current itinerary
        const updatedDays = currentItinerary.days.map((d) => (d.id === day.id ? day : d));

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return day;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Update the day in the current itinerary
        const updatedDays = currentItinerary.days.map((d) => (d.id === day.id ? day : d));

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return day;
      }
    } catch (error) {
      console.error('Error updating day:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDay: async (dayId: string): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Remove the day from the current itinerary
        const updatedDays = currentItinerary.days.filter((d) => d.id !== dayId);

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return true;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Remove the day from the current itinerary
        const updatedDays = currentItinerary.days.filter((d) => d.id !== dayId);

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return true;
      }
    } catch (error) {
      console.error('Error deleting day:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Activity operations
  fetchActivities: async (dayId: string): Promise<TripActivity[]> => {
    try {
      const { currentItinerary } = get();

      if (currentItinerary) {
        // Find the day in the current itinerary
        const day = currentItinerary.days.find((d) => d.id === dayId);

        if (day) {
          return day.activities || [];
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },

  createActivity: async (activity: Omit<TripActivity, 'id'>): Promise<TripActivity> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Create a new activity with a generated ID
      const newActivity: TripActivity = {
        ...activity,
        id: useMock
          ? `activity-${Math.random().toString(36).substring(2, 9)}`
          : crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 700));

        // Add the activity to the day
        const updatedDays = currentItinerary.days.map((d) => {
          if (d.id === activity.day_id) {
            return {
              ...d,
              activities: [...(d.activities || []), newActivity],
            };
          }
          return d;
        });

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newActivity;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 700));

        // Add the activity to the day
        const updatedDays = currentItinerary.days.map((d) => {
          if (d.id === activity.day_id) {
            return {
              ...d,
              activities: [...(d.activities || []), newActivity],
            };
          }
          return d;
        });

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newActivity;
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateActivity: async (activity: TripActivity): Promise<TripActivity> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Update the activity in the day
        const updatedDays = currentItinerary.days.map((d) => {
          if (d.id === activity.day_id) {
            return {
              ...d,
              activities: d.activities.map((a) => (a.id === activity.id ? activity : a)),
            };
          }
          return d;
        });

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return activity;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Update the activity in the day
        const updatedDays = currentItinerary.days.map((d) => {
          if (d.id === activity.day_id) {
            return {
              ...d,
              activities: d.activities.map((a) => (a.id === activity.id ? activity : a)),
            };
          }
          return d;
        });

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return activity;
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteActivity: async (dayId: string, activityId: string): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Remove the activity from the day
        const updatedDays = currentItinerary.days.map((d) => {
          if (d.id === dayId) {
            return {
              ...d,
              activities: d.activities.filter((a) => a.id !== activityId),
            };
          }
          return d;
        });

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return true;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Remove the activity from the day
        const updatedDays = currentItinerary.days.map((d) => {
          if (d.id === dayId) {
            return {
              ...d,
              activities: d.activities.filter((a) => a.id !== activityId),
            };
          }
          return d;
        });

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return true;
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  addActivityComment: async (activityId: string, comment: string): Promise<ActivityComment> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Create a new comment
      const newComment: ActivityComment = {
        id: useMock ? `comment-${Math.random().toString(36).substring(2, 9)}` : crypto.randomUUID(),
        user_id: 'current-user-id', // This should come from auth context in a real app
        activity_id: activityId,
        text: comment,
        user_name: 'Current User', // This should come from auth context in a real app
        created_at: new Date().toISOString(),
      };

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Add the comment to the activity
        let activityFound = false;

        const updatedDays = currentItinerary.days.map((d) => {
          const updatedActivities = d.activities.map((a) => {
            if (a.id === activityId) {
              activityFound = true;
              return {
                ...a,
                ActivityComment: [...(a.ActivityComment || []), newComment],
              };
            }
            return a;
          });

          return {
            ...d,
            activities: updatedActivities,
          };
        });

        if (!activityFound) {
          throw new Error('Activity not found');
        }

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newComment;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Add the comment to the activity
        let activityFound = false;

        const updatedDays = currentItinerary.days.map((d) => {
          const updatedActivities = d.activities.map((a) => {
            if (a.id === activityId) {
              activityFound = true;
              return {
                ...a,
                ActivityComment: [...(a.ActivityComment || []), newComment],
              };
            }
            return a;
          });

          return {
            ...d,
            activities: updatedActivities,
          };
        });

        if (!activityFound) {
          throw new Error('Activity not found');
        }

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newComment;
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addActivityVote: async (activityId: string, voteType: VoteType): Promise<ActivityVote> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Create a new vote
      const newVote: ActivityVote = {
        id: useMock ? `vote-${Math.random().toString(36).substring(2, 9)}` : crypto.randomUUID(),
        user_id: 'current-user-id', // This should come from auth context in a real app
        activity_id: activityId,
        vote_type: voteType,
        created_at: new Date().toISOString(),
      };

      if (useMock) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Add the vote to the activity
        let activityFound = false;

        const updatedDays = currentItinerary.days.map((d) => {
          const updatedActivities = d.activities.map((a) => {
            if (a.id === activityId) {
              activityFound = true;

              // Remove any existing votes from this user
              const filteredVotes = (a.votes || []).filter((v) => v.user_id !== newVote.user_id);

              return {
                ...a,
                votes: [...filteredVotes, newVote],
              };
            }
            return a;
          });

          return {
            ...d,
            activities: updatedActivities,
          };
        });

        if (!activityFound) {
          throw new Error('Activity not found');
        }

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newVote;
      } else {
        // This should be implemented with Supabase in a real app
        // For now, just use the mock implementation
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Add the vote to the activity
        let activityFound = false;

        const updatedDays = currentItinerary.days.map((d) => {
          const updatedActivities = d.activities.map((a) => {
            if (a.id === activityId) {
              activityFound = true;

              // Remove any existing votes from this user
              const filteredVotes = (a.votes || []).filter((v) => v.user_id !== newVote.user_id);

              return {
                ...a,
                votes: [...filteredVotes, newVote],
              };
            }
            return a;
          });

          return {
            ...d,
            activities: updatedActivities,
          };
        });

        if (!activityFound) {
          throw new Error('Activity not found');
        }

        const updatedItinerary = {
          ...currentItinerary,
          days: updatedDays,
        };

        // Update the store
        set({ currentItinerary: updatedItinerary });

        return newVote;
      }
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Weather operations
  fetchWeather: async (itineraryId: string): Promise<void> => {
    try {
      const { currentItinerary } = get();
      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      // Weather data should already be part of the itinerary, no additional fetch needed
      // This method exists for API consistency
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  },

  updateWeather: async (dailyWeather: TripWeather[]): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      const updatedItinerary = {
        ...currentItinerary,
        weather: dailyWeather,
      };

      set({ currentItinerary: updatedItinerary });

      // In a real app, you'd sync this with the database
      if (!get().useMock) {
        await get().supabaseUpdateItinerary(updatedItinerary);
      }
    } catch (error) {
      console.error('Error updating weather:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWeatherOverview: async (itineraryId: string): Promise<void> => {
    try {
      const { currentItinerary } = get();

      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      // Weather overview should already be part of the itinerary, no additional fetch needed
    } catch (error) {
      console.error('Error fetching weather overview:', error);
    }
  },

  updateWeatherOverview: async (overview: WeatherOverview): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      const updatedItinerary = {
        ...currentItinerary,
        weather_overview: overview,
      };

      set({ currentItinerary: updatedItinerary });

      // In a real app, you'd sync this with the database
      if (!get().useMock) {
        await get().supabaseUpdateItinerary(updatedItinerary);
      }
    } catch (error) {
      console.error('Error updating weather overview:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Warnings operations
  fetchWarnings: async (itineraryId: string): Promise<void> => {
    try {
      const { currentItinerary } = get();

      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      // Warnings should already be part of the itinerary, no additional fetch needed
    } catch (error) {
      console.error('Error fetching warnings:', error);
    }
  },

  updateWarnings: async (warnings: TripWarning[]): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      const updatedItinerary = {
        ...currentItinerary,
        warnings,
      };

      set({ currentItinerary: updatedItinerary });

      // In a real app, you'd sync this with the database
      if (!get().useMock) {
        await get().supabaseUpdateItinerary(updatedItinerary);
      }
    } catch (error) {
      console.error('Error updating warnings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Tips operations
  fetchTips: async (itineraryId: string): Promise<void> => {
    try {
      const { currentItinerary } = get();

      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      // Tips should already be part of the itinerary, no additional fetch needed
    } catch (error) {
      console.error('Error fetching tips:', error);
    }
  },

  updateTips: async (tips: TripTip[]): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      const updatedItinerary = {
        ...currentItinerary,
        general_tips: tips,
      };

      set({ currentItinerary: updatedItinerary });

      // In a real app, you'd sync this with the database
      if (!get().useMock) {
        await get().supabaseUpdateItinerary(updatedItinerary);
      }
    } catch (error) {
      console.error('Error updating tips:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHighlights: async (itineraryId: string): Promise<void> => {
    try {
      const { currentItinerary } = get();

      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      // Highlights should already be part of the itinerary, no additional fetch needed
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  },

  updateHighlights: async (highlights: TripHighlight[]): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      const updatedItinerary = {
        ...currentItinerary,
        trip_highlights: highlights,
      };

      set({ currentItinerary: updatedItinerary });

      // In a real app, you'd sync this with the database
      if (!get().useMock) {
        await get().supabaseUpdateItinerary(updatedItinerary);
      }
    } catch (error) {
      console.error('Error updating highlights:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Share operations
  fetchSharedUsers: async (itineraryId: string): Promise<void> => {
    try {
      const { currentItinerary } = get();

      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      // Shared users should already be part of the itinerary, no additional fetch needed
    } catch (error) {
      console.error('Error fetching shared users:', error);
    }
  },

  shareItinerary: async (
    itineraryId: string,
    email: string,
    permission: PermissionType
  ): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      if (!currentItinerary) {
        throw new Error('Itinerary not found');
      }

      // Create a new shared user entry
      const newSharedUser: SharedUser = {
        id: useMock ? `share-${Math.random().toString(36).substring(2, 9)}` : crypto.randomUUID(),
        user_id: 'pending', // Will be populated when user accepts invitation
        itinerary_id: itineraryId,
        user_email: email,
        permission,
        created_at: new Date().toISOString(),
        created_by: 'current-user-id', // Should come from auth context
      };

      // Add to the current itinerary
      const updatedItinerary = {
        ...currentItinerary,
        shared_users: [...(currentItinerary.shared_users || []), newSharedUser],
      };

      set({ currentItinerary: updatedItinerary });

      // In a real app, you would:
      // 1. Create an entry in the shared_itineraries table
      // 2. Send an email invitation
      // 3. Handle invitation acceptance flows

      if (!useMock) {
        await get().supabaseUpdateItinerary(updatedItinerary);
        // Additional Supabase operations for sharing
      }
    } catch (error) {
      console.error('Error sharing itinerary:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeSharedUser: async (sharedId: string): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();
      const useMock = get().useMock;

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Remove the shared user
      const updatedItinerary = {
        ...currentItinerary,
        shared_users: (currentItinerary.shared_users || []).filter((user) => user.id !== sharedId),
      };

      set({ currentItinerary: updatedItinerary });

      // In a real app, you'd remove the entry from the shared_itineraries table
      if (!useMock) {
        await get().supabaseUpdateItinerary(updatedItinerary);
        // Additional Supabase operations for removing sharing
      }
    } catch (error) {
      console.error('Error removing shared user:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
