import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { OnboardingScreen } from '@/src/components/onboarding';

export default function PreferencesScreen() {
  const router = useRouter();

  const handleComplete = (preferences: any, budgetRange: number) => {
    router.push({
      pathname: '/onboarding/completion',
      params: {
        preferences: JSON.stringify(preferences),
        budgetRange: budgetRange.toString(),
      },
    });
  };

  return (
    <View className="bg-background flex-1">
      <OnboardingScreen onComplete={handleComplete} />
    </View>
  );
}
