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

  // Core operations directly using Supabase
  fetchDestinations: (category?: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (destinationId: string) => Promise<void>;
  toggleFavoriteProperty: (destinationId: string) => Promise<boolean>;
  searchDestinations: (query: string) => void;
  fetchItinerary: (itineraryId: string) => Promise<TripItinerary | null>;
  fetchUserItineraries: () => Promise<void>;
  fetchSharedItineraries: () => Promise<void>;
  createItinerary: (itinerary: Omit<TripItinerary, 'id'>) => Promise<TripItinerary | null>;
  updateItinerary: (itinerary: TripItinerary) => Promise<TripItinerary | null>;
  deleteItinerary: (itineraryId: string) => Promise<boolean>;
  setCurrentItinerary: (itinerary: TripItinerary) => void;

  // Generic Supabase query helper
  supabaseQuery: (options: {
    from: string;
    select?: string;
    eq?: Record<string, any>;
    in?: Record<string, any[]>;
    delete?: boolean;
    update?: Record<string, any>;
    insert?: Record<string, any>;
  }) => Promise<{ data: any; error: any }>;

  // UI actions
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

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

  // Supabase implementation for destinations operations
  fetchDestinations: async (category = 'all') => {
    try {
      set({ isLoading: true, error: null });

      console.log('Fetching itineraries from trip_itineraries table...');

      // Check if Supabase client is properly configured
      if (!supabase || !supabase.from) {
        throw new Error('Supabase client is not properly initialized');
      }

      // Fetch itineraries from Supabase using trip_itineraries table with timeout
      const fetchPromise = async () => {
        let query = supabase.from('trip_itineraries').select('*');

        // Apply category filter if not 'all'
        if (category === 'favorites') {
          // For favorites, we need to use the user_favorites table to find favorites
          const { data: favoritesData, error: favoritesError } = await supabase
            .from('user_favorites')
            .select('trip_itinerary_id') // Updated from destination_id to trip_itinerary_id
            .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id || '');

          if (favoritesError) {
            throw new Error(`Failed to fetch favorites: ${favoritesError.message}`);
          }

          const favoriteIds = favoritesData.map((fav) => fav.trip_itinerary_id).filter(Boolean); // Filter out nulls

          if (favoriteIds.length > 0) {
            query = query.in('id', favoriteIds);
          } else {
            // No favorites found, return empty array
            return [];
          }
        } else if (category !== 'all') {
          // For category filtering, first check the category field
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch itineraries: ${error.message}`);
        }

        console.log(`Fetched ${data?.length || 0} itineraries`);
        return data || [];
      };

      // Add timeout to the fetch request
      const timeoutPromise = new Promise<never>((resolve, reject) => {
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000);
      });

      try {
        // Race between fetch and timeout
        const data = await Promise.race<any[]>([fetchPromise(), timeoutPromise]);

        // Transform trip_itineraries data to match TripItinerary structure
        const transformedData = data.map((item: any) => ({
          id: item.id,
          title: item.title,
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
          days: [],
          category: item.category || '',
          weather: [],
          weather_overview: undefined, // Changed from null to undefined
          general_tips: [],
          trip_highlights: [],
          warnings: [],
          shared_users: [],
          packing_recommendation: [],
          coordinates: item.coordinates || { lat: 0, lng: 0 },
          price_level: item.price_level || 'moderate',
          rating: item.rating || 0,
          is_bookmarked: item.is_bookmarked || false,
          is_shared: item.is_shared || false,
          is_private: item.is_private || false,
          is_completed: item.is_completed || false,
          is_featured: item.is_featured || false,
        })) as TripItinerary[];

        set({
          destinations: transformedData,
          isLoading: false,
        });
      } catch (networkError: unknown) {
        // Network error or timeout occurred
        const errorMessage =
          networkError instanceof Error ? networkError.message : String(networkError);
        console.error(`Network error: ${errorMessage}`);

        set({
          error: `Network error: ${errorMessage}. Please check your connection and try again.`,
          isLoading: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Failed to fetch itineraries: ${error.message}`
          : 'Failed to fetch itineraries: Unknown error';

      console.error(errorMessage);

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  searchDestinations: (query: string) => {
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

  fetchItinerary: async (itineraryId: string): Promise<TripItinerary | null> => {
    try {
      set({ isLoading: true, error: null });

      // First, fetch the basic itinerary data
      const { data, error } = await supabase
        .from('trip_itineraries')
        .select('*')
        .eq('id', itineraryId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch itinerary: ${error.message}`);
      }

      // Now fetch all the related data needed for the different tabs

      // Fetch days and activities
      const { data: daysData, error: daysError } = await supabase
        .from('trip_days')
        .select(
          `
          *,
          trip_activities (*)
        `
        )
        .eq('itinerary_id', itineraryId)
        .order('day_number', { ascending: true });

      if (daysError) {
        console.error(`Failed to fetch days: ${daysError.message}`);
      }

      // Fetch weather data
      const { data: weatherData, error: weatherError } = await supabase
        .from('trip_weather')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (weatherError) {
        console.error(`Failed to fetch weather: ${weatherError.message}`);
      }

      // Fetch weather overview
      const { data: weatherOverviewData, error: weatherOverviewError } = await supabase
        .from('trip_weather_overview')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .single();

      let weatherRecommendations = [];
      if (weatherOverviewData && !weatherOverviewError) {
        // Fetch weather recommendations
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('weather_recommendations')
          .select('*')
          .eq('weather_overview_id', weatherOverviewData.id);

        if (recommendationsError) {
          console.error(`Failed to fetch weather recommendations: ${recommendationsError.message}`);
        } else {
          weatherRecommendations = recommendationsData || [];
        }
      }

      // Fetch trip warnings
      const { data: warningsData, error: warningsError } = await supabase
        .from('trip_warnings')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (warningsError) {
        console.error(`Failed to fetch warnings: ${warningsError.message}`);
      }

      // Fetch packing recommendations
      const { data: packingData, error: packingError } = await supabase
        .from('packing_items')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (packingError) {
        console.error(`Failed to fetch packing items: ${packingError.message}`);
      }

      // Fetch general tips
      const { data: tipsData, error: tipsError } = await supabase
        .from('trip_tips')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (tipsError) {
        console.error(`Failed to fetch tips: ${tipsError.message}`);
      }

      // Fetch trip highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('trip_highlights')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (highlightsError) {
        console.error(`Failed to fetch highlights: ${highlightsError.message}`);
      }

      // Fetch shared users
      const { data: sharedUsersData, error: sharedUsersError } = await supabase
        .from('shared_itineraries')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (sharedUsersError) {
        console.error(`Failed to fetch shared users: ${sharedUsersError.message}`);
      }

      // Combine all data into the itinerary object with proper type handling
      const enrichedItinerary: TripItinerary = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        image_url: data.image_url || '',
        total_cost: data.total_cost || 0,
        currency: data.currency || 'USD',
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        start_date: data.start_date,
        end_date: data.end_date,
        location: data.location || '',
        tags: data.tags || [],
        city: data.city || '',
        category: data.category || '',
        coordinates: data.coordinates || { lat: 0, lng: 0 },
        price_level: data.price_level || 'moderate',
        rating: data.rating || 0,
        is_bookmarked: data.is_bookmarked || false,
        is_shared: data.is_shared || false,
        is_private: data.is_private || false,
        is_completed: data.is_completed || false,
        is_favorite: data.is_favorite || false,
        is_featured: data.is_featured || false,
        is_public: data.is_public || false,

        // Map days and activities
        days:
          daysData?.map((day) => ({
            id: day.id,
            itinerary_id: day.itinerary_id,
            day_number: day.day_number,
            date: day.date,
            created_at: day.created_at,
            updated_at: day.updated_at || day.created_at, // Add updated_at field
            activities: (day.trip_activities || []).map((activity: any) => ({
              id: activity.id,
              day_id: activity.day_id,
              name: activity.name,
              time: activity.time || '',
              description: activity.description || '',
              location: activity.location || '',
              cost: activity.cost || 0,
              currency: activity.currency || 'USD',
              category: activity.category || '',
              icon: activity.icon || '',
              created_at: activity.created_at,
              updated_at: activity.updated_at || activity.created_at, // Add updated_at field
              image_url: activity.image_url || '',
              votes: [], // We'll fetch these separately if needed
              ActivityComment: [], // We'll fetch these separately if needed
            })),
          })) || [],

        // Map weather data
        weather: (weatherData || []).map((w) => ({
          id: w.id,
          itinerary_id: w.itinerary_id,
          day: w.day,
          date: w.date,
          condition: w.condition || '',
          high_temp: w.high_temp || 0,
          low_temp: w.low_temp || 0,
          icon: w.icon || '',
          created_at: w.created_at,
        })),

        // Map weather overview with proper type handling
        weather_overview: weatherOverviewData
          ? {
              id: weatherOverviewData.id,
              itinerary_id: weatherOverviewData.itinerary_id,
              description: weatherOverviewData.description,
              created_at: weatherOverviewData.created_at,
              updated_at: weatherOverviewData.updated_at || weatherOverviewData.created_at, // Add updated_at field
              recommendations: weatherRecommendations.map((rec) => ({
                id: rec.id,
                weather_overview_id: rec.weather_overview_id,
                text: rec.text,
                icon: rec.icon || '',
                created_at: rec.created_at,
              })),
            }
          : undefined, // Use undefined instead of null to match the type definition

        // Map warnings
        warnings: (warningsData || []).map((w) => ({
          id: w.id,
          itinerary_id: w.itinerary_id,
          title: w.title,
          description: w.description,
          icon: w.icon || '',
          severity: w.severity || 'low',
          created_at: w.created_at,
        })),

        // Map packing recommendations
        packing_recommendation: (packingData || []).map((p) => ({
          id: p.id,
          itinerary_id: p.itinerary_id,
          name: p.name,
          category: p.category || '',
          essential: p.essential || false,
          icon: p.icon || '',
          created_at: p.created_at,
        })),

        // Map general tips
        general_tips: (tipsData || []).map((t) => ({
          id: t.id,
          itinerary_id: t.itinerary_id,
          title: t.title,
          description: t.description || '',
          icon: t.icon || '',
          category: t.category || '',
          created_at: t.created_at,
        })),

        // Map highlights
        trip_highlights: (highlightsData || []).map((h) => ({
          id: h.id,
          itinerary_id: h.itinerary_id,
          title: h.title,
          description: h.description || '',
          icon: h.icon || '',
          created_at: h.created_at,
        })),

        // Map shared users
        shared_users: (sharedUsersData || []).map((s) => ({
          id: s.id,
          user_id: s.user_id,
          itinerary_id: s.itinerary_id,
          user_email: s.user_email,
          permission: s.permission,
          created_at: s.created_at,
          created_by: s.created_by,
          user_name: s.user_name || '',
        })),
      };

      set({ currentItinerary: enrichedItinerary, isLoading: false });
      return enrichedItinerary;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return null;
    }
  },

  fetchUserItineraries: async () => {
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

  fetchSharedItineraries: async () => {
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

  createItinerary: async (itinerary: Omit<TripItinerary, 'id'>) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // Prepare the itinerary data for Supabase
      const itineraryData = {
        title: itinerary.title,
        description: itinerary.description || '',
        location: itinerary.location, // Fixed from destination to location
        image_url: itinerary.image_url || '',
        total_cost: itinerary.total_cost || 0,
        currency: itinerary.currency || 'USD',
        user_id: session.user.id,
        start_date: itinerary.start_date || null,
        end_date: itinerary.end_date || null,
        city: itinerary.city || '',
        category: itinerary.category || '',
        tags: itinerary.tags || [],
        price_level: itinerary.price_level || 'moderate',
        rating: itinerary.rating || 0,
        coordinates: itinerary.coordinates || { lat: 0, lng: 0 },
        is_public: itinerary.is_public || false,
        is_private: itinerary.is_private || false,
        is_bookmarked: itinerary.is_bookmarked || false,
        is_shared: itinerary.is_shared || false,
        is_completed: itinerary.is_completed || false,
        is_favorite: itinerary.is_favorite || false,
        is_featured: itinerary.is_featured || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('trip_itineraries')
        .insert(itineraryData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create itinerary: ${error.message}`);
      }

      // Transform the returned data to match our TripItinerary type
      const createdItinerary: TripItinerary = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        image_url: data.image_url || '',
        total_cost: data.total_cost || 0,
        currency: data.currency || 'USD',
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        start_date: data.start_date,
        end_date: data.end_date,
        is_public: data.is_public || false,
        is_favorite: data.is_favorite || false,
        location: data.location || '',
        tags: data.tags || [],
        city: data.city || '',
        days: [],
        category: data.category || '',
        weather: [],
        weather_overview: undefined, // Changed from null to undefined
        general_tips: [],
        trip_highlights: [],
        warnings: [],
        shared_users: [],
        packing_recommendation: [],
        coordinates: data.coordinates || { lat: 0, lng: 0 },
        price_level: data.price_level || 'moderate',
        rating: data.rating || 0,
        is_bookmarked: data.is_bookmarked || false,
        is_shared: data.is_shared || false,
        is_private: data.is_private || false,
        is_completed: data.is_completed || false,
        is_featured: data.is_featured || false,
      };

      set((state) => ({
        userItineraries: [createdItinerary, ...state.userItineraries],
        isLoading: false,
      }));

      return createdItinerary;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return null;
    }
  },

  updateItinerary: async (itinerary: TripItinerary) => {
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

  deleteItinerary: async (itineraryId) => {
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
    get().fetchDestinations(category);
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

  fetchFavorites: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // Fetch favorites from the user_favorites table
      const { data, error } = await supabase
        .from('user_favorites')
        .select('destination_id')
        .eq('user_id', session.user.id);

      if (error) {
        throw new Error(`Failed to fetch favorites: ${error.message}`);
      }

      // Extract the destination ids from the user_favorites records
      const favoriteIds = data ? data.map((item) => item.destination_id) : [];

      set({ favorites: favoriteIds });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // We don't set an error state here since this is not a critical failure
      // But we do ensure favorites is initialized to an empty array
      set({ favorites: [] });
    }
  },

  toggleFavorite: async (destinationId: string) => {
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
          .eq('destination_id', destinationId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase.from('user_favorites').insert({
          user_id: session.user.id,
          destination_id: destinationId,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
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

  toggleFavoriteProperty: async (destinationId: string) => {
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

      // Also update the destinations in the current state
      const { destinations } = get();
      const updatedDestinations = destinations.map((item) =>
        item.id === destinationId ? { ...item, is_favorite: !currentIsFavorite } : item
      );

      set({ destinations: updatedDestinations });

      return !currentIsFavorite;
    } catch (error) {
      console.error('Error toggling favorite property:', error);
      throw error;
    }
  },

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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Prepare the day data for Supabase
      const dayData = {
        itinerary_id: day.itinerary_id,
        day_number: day.day_number,
        date: day.date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), // Add updated_at field
      };

      // Insert into trip_days table
      const { data, error } = await supabase.from('trip_days').insert(dayData).select().single();

      if (error) {
        throw new Error(`Failed to create day: ${error.message}`);
      }

      // Create a new day with the returned data
      const newDay: TripDay = {
        id: data.id,
        itinerary_id: data.itinerary_id,
        day_number: data.day_number,
        date: data.date,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at, // Add the updated_at field
        activities: [],
      };

      // Add the day to the current itinerary
      const updatedDays = [...(currentItinerary.days || []), newDay];
      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
      };

      // Update the store
      set({ currentItinerary: updatedItinerary });

      return newDay;
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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Ensure days is an array before mapping
      const days = Array.isArray(currentItinerary.days) ? currentItinerary.days : [];
      const updatedDays = days.map((d) => (d.id === day.id ? day : d));

      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
      };

      // Update the store
      set({ currentItinerary: updatedItinerary });

      // Update the itinerary in Supabase
      await get().updateItinerary(updatedItinerary);

      return day;
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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Ensure days is an array before filtering
      const days = Array.isArray(currentItinerary.days) ? currentItinerary.days : [];
      const updatedDays = days.filter((d) => d.id !== dayId);

      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
      };

      // Update the store
      set({ currentItinerary: updatedItinerary });

      // Update the itinerary in Supabase
      await get().updateItinerary(updatedItinerary);

      return true;
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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Prepare the activity data for Supabase
      const activityData = {
        day_id: activity.day_id,
        name: activity.name,
        time: activity.time || '',
        description: activity.description || '',
        location: activity.location || '',
        cost: activity.cost || 0,
        currency: activity.currency || 'USD',
        category: activity.category || '',
        icon: activity.icon || '',
        image_url: activity.image_url || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), // Add updated_at field
      };

      // Insert into trip_activities table
      const { data, error } = await supabase
        .from('trip_activities')
        .insert(activityData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create activity: ${error.message}`);
      }

      // Create a new activity with the returned data
      const newActivity: TripActivity = {
        id: data.id,
        day_id: data.day_id,
        name: data.name,
        time: data.time || '',
        description: data.description || '',
        location: data.location || '',
        cost: data.cost || 0,
        currency: data.currency || 'USD',
        category: data.category || '',
        icon: data.icon || '',
        image_url: data.image_url || '',
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at, // Add the updated_at field
        votes: [],
        ActivityComment: [],
      };

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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Ensure days and activities are arrays before mapping
      const days = Array.isArray(currentItinerary.days) ? currentItinerary.days : [];
      const updatedDays = days.map((d) => {
        if (d.id === activity.day_id) {
          const activities = Array.isArray(d.activities) ? d.activities : [];
          return {
            ...d,
            activities: activities.map((a) => (a.id === activity.id ? activity : a)),
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

      // Update the itinerary in Supabase
      await get().updateItinerary(updatedItinerary);

      return activity;
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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Ensure days and activities are arrays before mapping and filtering
      const days = Array.isArray(currentItinerary.days) ? currentItinerary.days : [];
      const updatedDays = days.map((d) => {
        if (d.id === dayId) {
          const activities = Array.isArray(d.activities) ? d.activities : [];
          return {
            ...d,
            activities: activities.filter((a) => a.id !== activityId),
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

      // Update the itinerary in Supabase
      await get().updateItinerary(updatedItinerary);

      return true;
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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // Create a new comment in the activity_comments table
      const commentData = {
        activity_id: activityId,
        user_id: session.user.id,
        text: comment,
        user_name: 'Current User', // This should come from user profile in a real app
        user_avatar: '', // This should come from user profile in a real app
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('activity_comments')
        .insert(commentData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }

      // Create a comment object from the returned data
      const newComment: ActivityComment = {
        id: data.id,
        activity_id: data.activity_id,
        user_id: data.user_id,
        text: data.text,
        user_name: data.user_name || 'Current User',
        user_avatar: data.user_avatar || '',
        created_at: data.created_at,
      };

      // Add the comment to the activity in our local state
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

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // First check if user already voted on this activity
      const { data: existingVote, error: checkError } = await supabase
        .from('activity_votes')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Failed to check existing vote: ${checkError.message}`);
      }

      let voteResult;

      if (existingVote) {
        // If vote exists and it's the same type, delete it (toggle off)
        if (existingVote.vote_type === voteType) {
          const { error: deleteError } = await supabase
            .from('activity_votes')
            .delete()
            .eq('id', existingVote.id);

          if (deleteError) {
            throw new Error(`Failed to delete vote: ${deleteError.message}`);
          }

          // Return a "deleted" vote
          voteResult = {
            id: existingVote.id,
            activity_id: existingVote.activity_id,
            user_id: existingVote.user_id,
            vote_type: voteType,
            created_at: existingVote.created_at,
            deleted: true,
          };
        } else {
          // If vote exists but different type, update it
          const { data: updatedVote, error: updateError } = await supabase
            .from('activity_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
            .select()
            .single();

          if (updateError) {
            throw new Error(`Failed to update vote: ${updateError.message}`);
          }

          voteResult = updatedVote;
        }
      } else {
        // If no vote exists, create a new one
        const voteData = {
          activity_id: activityId,
          user_id: session.user.id,
          vote_type: voteType,
          created_at: new Date().toISOString(),
        };

        const { data: newVote, error: insertError } = await supabase
          .from('activity_votes')
          .insert(voteData)
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to create vote: ${insertError.message}`);
        }

        voteResult = newVote;
      }

      // Now update our local state
      // First get all votes for this activity to update our local state properly
      const { data: activityVotes, error: votesError } = await supabase
        .from('activity_votes')
        .select('*')
        .eq('activity_id', activityId);

      if (votesError) {
        throw new Error(`Failed to fetch activity votes: ${votesError.message}`);
      }

      // Update the activity in our local state with the latest votes
      const updatedDays = currentItinerary.days.map((d) => {
        const updatedActivities = d.activities.map((a) => {
          if (a.id === activityId) {
            return {
              ...a,
              votes: activityVotes || [],
            };
          }
          return a;
        });

        return {
          ...d,
          activities: updatedActivities,
        };
      });

      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
      };

      // Update the store
      set({ currentItinerary: updatedItinerary });

      return voteResult;
    } catch (error) {
      console.error('Error handling vote:', error);
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

      // Update in Supabase
      await get().updateItinerary(updatedItinerary);
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

      // Update in Supabase
      await get().updateItinerary(updatedItinerary);
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

      // Update in Supabase
      await get().updateItinerary(updatedItinerary);
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

      // Update in Supabase
      await get().updateItinerary(updatedItinerary);
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

      // Update in Supabase
      await get().updateItinerary(updatedItinerary);
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      if (!currentItinerary || currentItinerary.id !== itineraryId) {
        await get().fetchItinerary(itineraryId);
      }

      if (!currentItinerary) {
        throw new Error('Itinerary not found');
      }

      // Create a new shared_itineraries entry
      const sharedData = {
        itinerary_id: itineraryId,
        user_id: 'pending', // Will be populated when user accepts invitation
        user_email: email,
        permission,
        created_at: new Date().toISOString(),
        created_by: session.user.id,
      };

      const { data, error } = await supabase
        .from('shared_itineraries')
        .insert(sharedData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to share itinerary: ${error.message}`);
      }

      // Also update the is_shared flag on the itinerary
      if (!currentItinerary.is_shared) {
        const { error: updateError } = await supabase
          .from('trip_itineraries')
          .update({ is_shared: true })
          .eq('id', itineraryId);

        if (updateError) {
          console.error(`Failed to update is_shared flag: ${updateError.message}`);
        }
      }

      // Add to the current itinerary in local state
      const newSharedUser: SharedUser = {
        id: data.id,
        user_id: data.user_id,
        itinerary_id: data.itinerary_id,
        user_email: data.user_email,
        permission: data.permission,
        created_at: data.created_at,
        created_by: data.created_by,
        user_name: data.user_name || '',
      };

      const updatedItinerary = {
        ...currentItinerary,
        is_shared: true,
        shared_users: [...(currentItinerary.shared_users || []), newSharedUser],
      };

      set({ currentItinerary: updatedItinerary });
    } catch (error) {
      console.error('Error sharing itinerary:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeSharedUser: async (sharedId: string): Promise<void> => {
    try {
      set({ isLoading: true });
      const { currentItinerary } = get();

      if (!currentItinerary) {
        throw new Error('No itinerary selected');
      }

      // Find the shared user to get the itinerary ID
      const sharedUser = currentItinerary.shared_users?.find((user) => user.id === sharedId);

      if (!sharedUser) {
        throw new Error('Shared user not found');
      }

      // Remove the shared user from the itinerary
      const updatedItinerary = {
        ...currentItinerary,
        shared_users: (currentItinerary.shared_users || []).filter((user) => user.id !== sharedId),
      };

      set({ currentItinerary: updatedItinerary });

      // Update in Supabase
      await get().updateItinerary(updatedItinerary);

      // Remove from shared_itineraries table
      const { error } = await supabase
        .from('shared_itineraries')
        .delete()
        .eq('itinerary_id', sharedUser.itinerary_id)
        .eq('user_email', sharedUser.user_email);

      if (error) {
        console.error('Error removing from shared_itineraries table:', error);
      }
    } catch (error) {
      console.error('Error removing shared user:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Generic Supabase query helper
  supabaseQuery: async (options) => {
    try {
      const { from, select = '*', eq, in: inClause, delete: isDelete, update, insert } = options;

      let query: any = supabase.from(from);

      if (isDelete) {
        query = query.delete();
      } else if (update) {
        query = query.update(update);
      } else if (insert) {
        query = query.insert(insert);
      } else {
        query = query.select(select);
      }

      // Apply equality filters
      if (eq) {
        Object.entries(eq).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }

      // Apply IN filters
      if (inClause) {
        Object.entries(inClause).forEach(([column, values]) => {
          query = query.in(column, values);
        });
      }

      const { data, error } = await query;

      return { data, error };
    } catch (error) {
      console.error('Error in supabaseQuery:', error);
      return { data: null, error };
    }
  },
}));
