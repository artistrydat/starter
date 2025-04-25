import { create } from 'zustand';

import { PreferencesType, BudgetPreference } from '@/src/types/preferences';
import { supabase } from '@/src/utils/supabaseClient';

export interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

export const useStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));

interface TravelPreferencesState {
  preferences: PreferencesType;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (newPreferences: Partial<PreferencesType>) => Promise<void>;
  fetchPreferences: () => Promise<void>;
}

export const useTravelPreferencesStore = create<TravelPreferencesState>((set, get) => ({
  preferences: {
    travel_vibe: [],
    travel_companion: [],
    travel_purpose: [],
    budget: {
      amount: 50,
      style: [],
    },
    food_preferences: [],
    tech_preferences: [],
  },
  isLoading: false,
  error: null,
  updatePreferences: async (newPreferences) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // Get current state
      const currentPreferences = get().preferences;

      // Merge new preferences with current ones
      const mergedPreferences = {
        ...currentPreferences,
        ...newPreferences,
      };

      // Update local state
      set({ preferences: mergedPreferences });

      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          travel_preferences: mergedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update preferences' });
      // Revert local state on error
      await get().fetchPreferences();
    } finally {
      set({ isLoading: false });
    }
  },
  fetchPreferences: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .select('travel_preferences')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      set({ preferences: data.travel_preferences });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch preferences' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
