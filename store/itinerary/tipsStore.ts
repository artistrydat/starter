import { create } from 'zustand';

import { useItineraryStore } from './itineraryStore';

import { TripHighlight, TripTip } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

interface TipsState {
  isLoading: boolean;
  error: string | null;

  fetchTips: (itineraryId: string) => Promise<void>;
  updateTips: (tips: TripTip[]) => Promise<void>;
  fetchHighlights: (itineraryId: string) => Promise<void>;
  updateHighlights: (highlights: TripHighlight[]) => Promise<void>;
}

export const useTipsStore = create<TipsState>((set) => ({
  isLoading: false,
  error: null,

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

      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        general_tips: formattedTips,
      });

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
      const itineraryId = useItineraryStore.getState().currentItinerary?.id;
      if (!itineraryId) throw new Error('No itinerary loaded');

      // Just update the store with provided data (no Supabase)
      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        general_tips: tips,
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

      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        trip_highlights: formattedHighlights,
      });

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
      const itineraryId = useItineraryStore.getState().currentItinerary?.id;
      if (!itineraryId) throw new Error('No itinerary loaded');

      // Just update the store with provided data (no Supabase)
      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        trip_highlights: highlights,
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
}));
