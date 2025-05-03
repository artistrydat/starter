import { create } from 'zustand';

import { useItineraryStore } from './itineraryStore';

import { TripDay } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

interface DayState {
  isLoading: boolean;
  error: string | null;

  fetchDays: (itineraryId: string) => Promise<TripDay[]>;
  updateDay: (day: TripDay) => Promise<TripDay>;
  createDay: (day: Omit<TripDay, 'id'>) => Promise<TripDay>;
  deleteDay: (dayId: string) => Promise<boolean>;
}

export const useDayStore = create<DayState>((set) => ({
  isLoading: false,
  error: null,

  fetchDays: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const days = mockItinerary.days || [];

      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        days,
      });

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

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Update the day in the itinerary
      const updatedDays = currentItinerary.days?.map((d) => (d.id === day.id ? day : d)) || [];

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: updatedDays,
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

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new day with mock ID
      const newDay: TripDay = {
        ...day,
        id: `day-${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        activities: [],
      };

      const updatedDays = [...(currentItinerary.days || []), newDay];

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: updatedDays,
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

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Remove the day from the itinerary
      const updatedDays = currentItinerary.days?.filter((d) => d.id !== dayId) || [];

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: updatedDays,
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
}));
