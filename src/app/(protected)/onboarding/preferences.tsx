import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { OnboardingScreen } from '@/src/components/onboarding';
import { usePreferences } from '@/src/hooks/profileQueries';
import { PreferencesType } from '@/src/types/preferences';

export default function PreferencesScreen() {
  const router = useRouter();
  const { data: preferences } = usePreferences();

  // Extract initial budget value if available
  const initialBudgetRange = preferences?.budget?.amount || 50;

  const handleComplete = (preferences: PreferencesType, budgetRange: number) => {
    router.push({
      pathname: '/onboarding/completion',
      params: {
        preferences: JSON.stringify(preferences),
        budgetRange: budgetRange.toString(),
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <OnboardingScreen
        onComplete={handleComplete}
        initialPreferences={preferences}
        initialBudgetRange={initialBudgetRange}
      />
    </View>
  );
}
