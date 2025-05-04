import { create } from 'zustand';

import { GlobalDestination, PriceLevel } from '@/src/types/destinations';
import { supabase } from '@/src/utils/supabaseClient';

interface DestinationState {
  destinations: GlobalDestination[];
  isLoading: boolean;
  error: string | null;
  favorites: string[];
  selectedCategory: string;
  searchQuery: string;
  searchResults: GlobalDestination[];
  isSearching: boolean;

  fetchDestinations: (category?: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (destinationId: string) => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  searchDestinations: (query: string) => void;
  clearSearch: () => void;
}

export const useDestinationStore = create<DestinationState>((set, get) => ({
  destinations: [],
  isLoading: false,
  error: null,
  favorites: [],
  selectedCategory: 'all',
  searchQuery: '',
  searchResults: [],
  isSearching: false,

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
        // Adjust this based on what field you want to filter by
        // Using destination field as fallback if there's no category field
        query = query.ilike('destination', `%${category}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching itineraries:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} itineraries`);

      // Transform trip_itineraries data to match GlobalDestination structure
      const transformedData: GlobalDestination[] =
        data?.map((item) => ({
          id: item.id,
          title: item.title,
          location: item.destination,
          description: item.description || '',
          image_url: item.image_url || '', // Match the exact property name from GlobalDestination
          rating: 0, // Default value as this may not exist in trip_itineraries
          price_level: PriceLevel.Moderate, // Using enum value from the type definition
          tags: [], // Default empty array as this may not exist in trip_itineraries
          category: '', // Default empty string
          created_at: item.created_at,
          updated_at: item.updated_at,
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
        dest.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
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
}));
