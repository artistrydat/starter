import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BudgetPreference, PreferencesType } from '@/src/types/preferences';
import { useTravelPreferencesStore } from '@/store/store';

// Query keys for preferences
export const preferenceKeys = {
  all: ['preferences'] as const,
  details: () => [...preferenceKeys.all, 'details'] as const,
};

// Hook for fetching user preferences
export function usePreferences() {
  const { fetchPreferences } = useTravelPreferencesStore();

  return useQuery({
    queryKey: preferenceKeys.details(),
    queryFn: async () => {
      await fetchPreferences();
      return useTravelPreferencesStore.getState().preferences;
    },
  });
}

// Hook for updating preferences
export function useUpdatePreference() {
  const queryClient = useQueryClient();
  const { updatePreferences } = useTravelPreferencesStore();

  return useMutation({
    mutationFn: async (data: {
      type: keyof PreferencesType;
      values: string[] | BudgetPreference;
    }) => {
      const { type, values } = data;
      await updatePreferences({ [type]: values } as Partial<PreferencesType>);
      return useTravelPreferencesStore.getState().preferences;
    },
    onSuccess: () => {
      // Invalidate preferences queries
      queryClient.invalidateQueries({
        queryKey: preferenceKeys.all,
      });
    },
  });
}
