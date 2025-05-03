import { create } from 'zustand';

import { useItineraryStore } from './itineraryStore';

import { TripWeather, WeatherOverview } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

interface WeatherState {
  isLoading: boolean;
  error: string | null;

  fetchWeather: (itineraryId: string) => Promise<void>;
  updateWeather: (dailyWeather: TripWeather[]) => Promise<void>;
  fetchWeatherOverview: (itineraryId: string) => Promise<void>;
  updateWeatherOverview: (overview: WeatherOverview) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  isLoading: false,
  error: null,

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

      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        weather: formattedWeather,
      });

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
      const itineraryId = useItineraryStore.getState().currentItinerary?.id;
      if (!itineraryId) throw new Error('No itinerary loaded');

      // Just update the store with provided data (no Supabase)
      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        weather: dailyWeather,
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
        : null;

      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        weather_overview: formattedOverview,
      });

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
      const itineraryId = useItineraryStore.getState().currentItinerary?.id;
      if (!itineraryId) throw new Error('No itinerary loaded');

      // Just update the store with provided data (no Supabase)
      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        weather_overview: overview,
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
}));
