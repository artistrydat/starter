import { create } from 'zustand';

import { useItineraryStore } from './itineraryStore';

import { TripWarning } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

interface WarningsState {
  isLoading: boolean;
  error: string | null;

  fetchWarnings: (itineraryId: string) => Promise<void>;
  updateWarnings: (warnings: TripWarning[]) => Promise<void>;
}

export const useWarningsStore = create<WarningsState>((set) => ({
  isLoading: false,
  error: null,

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

      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        warnings: formattedWarnings,
      });

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
      const itineraryId = useItineraryStore.getState().currentItinerary?.id;
      if (!itineraryId) throw new Error('No itinerary loaded');

      // Just update the store with provided data (no Supabase)
      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        warnings,
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
}));
