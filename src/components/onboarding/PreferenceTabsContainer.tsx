import React, { useState } from 'react';

import { PreferenceTabs } from './PreferenceTabs';

import { usePreferences, useUpdatePreference } from '@/src/hooks/profileQueries';
import { BudgetPreference, PreferencesType, sections } from '@/src/types/preferences';

/**
 * Default preferences object with empty arrays and default budget
 */
const defaultPreferences: PreferencesType = {
  travel_vibe: [],
  travel_companion: [],
  travel_purpose: [],
  budget: {
    amount: 50,
    style: ['mid_range'],
  },
  food_preferences: [],
  tech_preferences: [],
};

/**
 * PreferenceTabsContainer - Container component that handles data fetching
 * for the PreferenceTabs pure UI component
 */
export const PreferenceTabsContainer = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof sections>('travel_vibe');
  const { data: preferences, isLoading, error } = usePreferences();
  const updatePreferenceMutation = useUpdatePreference();

  const handleUpdatePreferences = (
    type: keyof PreferencesType,
    values: string[] | BudgetPreference
  ) => {
    updatePreferenceMutation.mutate({ type, values });
  };

  return (
    <PreferenceTabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
      preferences={preferences || defaultPreferences}
      isLoading={isLoading}
      error={error ? String(error) : null}
      onUpdatePreferences={handleUpdatePreferences}
      isUpdating={updatePreferenceMutation.isPending}
    />
  );
};
