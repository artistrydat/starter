import { create } from 'zustand';

import { Destination, UserFavorite } from '@/src/types/destinations';
import { supabase } from '@/src/utils/supabaseClient';

interface DestinationState {
  // Destinations
  destinations: Destination[];
  isLoading: boolean;
  error: string | null;

  // Favorites
  favorites: string[];
  isFavoritesLoading: boolean;

  // Category and Search
  selectedCategory: string;
  searchQuery: string;
  searchResults: Destination[];
  isSearching: boolean;

  // Actions
  fetchDestinations: (category?: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addFavorite: (destinationId: string) => Promise<void>;
  removeFavorite: (destinationId: string) => Promise<void>;
  toggleFavorite: (destinationId: string) => Promise<void>;
  setSelectedCategory: (category: string) => void;

  // Search Actions
  setSearchQuery: (query: string) => void;
  searchDestinations: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useDestinationStore = create<DestinationState>((set, get) => ({
  destinations: [],
  isLoading: false,
  error: null,
  favorites: [],
  isFavoritesLoading: false,
  selectedCategory: 'all',
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  fetchDestinations: async (category?: string) => {
    try {
      set({ isLoading: true, error: null });

      let query = supabase.from('global_destination').select('*');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('is_featured', { ascending: false });

      if (error) throw error;

      set({ destinations: data as Destination[] });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch destinations',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFavorites: async () => {
    try {
      set({ isFavoritesLoading: true });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('user_favorites')
        .select('destination_id')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const favoriteIds = data.map((fav) => fav.destination_id);
      set({ favorites: favoriteIds });
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      set({ isFavoritesLoading: false });
    }
  },

  addFavorite: async (destinationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('You must be logged in to add favorites');
      }

      const { error } = await supabase.from('user_favorites').insert({
        user_id: session.user.id,
        destination_id: destinationId,
      });

      if (error) throw error;

      set((state) => ({
        favorites: [...state.favorites, destinationId],
      }));
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  },

  removeFavorite: async (destinationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('destination_id', destinationId);

      if (error) throw error;

      set((state) => ({
        favorites: state.favorites.filter((id) => id !== destinationId),
      }));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  },

  toggleFavorite: async (destinationId: string) => {
    const isFavorite = get().favorites.includes(destinationId);
    if (isFavorite) {
      await get().removeFavorite(destinationId);
    } else {
      await get().addFavorite(destinationId);
    }
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
    get().fetchDestinations(category);
  },

  // New search functions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  searchDestinations: async (query: string) => {
    try {
      if (!query.trim()) {
        set({ searchResults: [], searchQuery: '', isSearching: false });
        return;
      }

      set({ isSearching: true, error: null });

      // Convert query to lowercase for case-insensitive search
      const searchTerm = query.trim().toLowerCase();

      // Use Supabase text search capabilities
      const { data, error } = await supabase
        .from('global_destination')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (error) throw error;

      set({
        searchResults: data as Destination[],
        searchQuery: query,
        isSearching: false,
      });

    } catch (error) {
      set({
        error: error instanceof Error
          ? error.message
          : 'Search failed',
        isSearching: false,
      });
    }
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      searchResults: [],
      isSearching: false,
    });
  }
}));
