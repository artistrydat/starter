import { create } from 'zustand';

import { PreferencesType } from '@/src/types/preferences';
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
  setOnboardingCompleted: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
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

      // Ensure we have valid preferences
      if (data && data.travel_preferences) {
        set({ preferences: data.travel_preferences });
      } else {
        // Initialize with default preferences if none found
        const defaultPreferences = {
          travel_vibe: [],
          travel_companion: [],
          travel_purpose: [],
          budget: {
            amount: 50,
            style: [],
          },
          food_preferences: [],
          tech_preferences: [],
        };

        // Save default preferences to Supabase
        await supabase
          .from('profiles')
          .update({
            travel_preferences: defaultPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.user.id);

        set({ preferences: defaultPreferences });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch preferences' });
    } finally {
      set({ isLoading: false });
    }
  },
  setOnboardingCompleted: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      // Update both user metadata and profile
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
        },
      });

      if (authError) throw authError;

      // Also update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update onboarding status' });
    } finally {
      set({ isLoading: false });
    }
  },
  checkOnboardingStatus: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return false;

      // First check user metadata
      const isCompletedInMetadata = session.user.user_metadata?.onboarding_completed === true;

      if (isCompletedInMetadata) return true;

      // If not in metadata, check profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      return data?.onboarding_completed === true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to check onboarding status' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
