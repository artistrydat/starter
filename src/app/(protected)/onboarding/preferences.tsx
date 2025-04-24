import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import OnboardingScreen from '@/src/components/OnboardingScreen';

export default function PreferencesScreen() {
  const router = useRouter();

  const handleComplete = (preferences: any, budgetRange: number) => {
    router.push({
      pathname: '/onboarding/completion',
      params: { 
        preferences: JSON.stringify(preferences),
        budgetRange: budgetRange.toString()
      },
    });
  };

  return (
    <View className="flex-1">
      <OnboardingScreen onComplete={handleComplete} />
    </View>
  );
}
