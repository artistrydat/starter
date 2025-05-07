import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { CompletionContent } from '@/src/components/onboarding';
import { useOnboardingCompletion } from '@/src/hooks/useOnboardingCompletion';

export default function CompletionScreen() {
  const params = useLocalSearchParams();
  const preferences = params.preferences ? JSON.parse(params.preferences as string) : {};
  const budgetRange = params.budgetRange ? Number(params.budgetRange) : 50;

  // Use our new custom hook for handling the onboarding completion
  const onboardingMutation = useOnboardingCompletion();

  const handleComplete = () => {
    onboardingMutation.mutate({ preferences, budgetRange });
  };

  return (
    <CompletionContent
      preferences={preferences}
      budgetRange={budgetRange}
      isLoading={onboardingMutation.isPending}
      onComplete={handleComplete}
    />
  );
}
