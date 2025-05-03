import { create } from 'zustand';

import { TripItinerary } from '@/src/types/destinations';
import { mockItinerary, emptyItinerary } from '@/src/utils/mockItinerary';

interface ItineraryState {
  currentItinerary: TripItinerary | null;
  isLoading: boolean;
  error: string | null;
  userItineraries: TripItinerary[];
  sharedItineraries: TripItinerary[];

  fetchItinerary: (itineraryId: string) => Promise<TripItinerary | null>;
  fetchUserItineraries: () => Promise<void>;
  fetchSharedItineraries: () => Promise<void>;
  createItinerary: (itinerary: Omit<TripItinerary, 'id'>) => Promise<TripItinerary | null>;
  updateItinerary: (itinerary: TripItinerary) => Promise<TripItinerary | null>;
  deleteItinerary: (itineraryId: string) => Promise<boolean>;
  setCurrentItinerary: (itinerary: TripItinerary) => void;
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  currentItinerary: null,
  isLoading: false,
  error: null,
  userItineraries: [],
  sharedItineraries: [],

  // Set current itinerary (new helper method)
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
}));
