import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { AppText, Button } from '@/src/components/ui';

export default function OnboardingIndex() {
  return (
    <View className="flex-1 bg-quinary">
      <View className="flex-1 items-center justify-center p-6">
        <View className="mb-12">
          <AppText size="4xl" className="text-center">
            ✈️ 🌎
          </AppText>
        </View>

        <View className="mb-12 items-center space-y-6">
          <AppText size="3xl" weight="bold" color="primary" className="mb-4 text-center">
            Let's plan your perfect trip
          </AppText>

          <AppText size="lg" color="secondary" className="max-w-[280px] text-center opacity-80">
            We'll help you create unforgettable experiences tailored just for you
          </AppText>
        </View>
      </View>

      <View className="space-y-4 p-6">
        <Link href="./onboarding/preferences" asChild>
          <Button title="Let's Go" className="rounded-full bg-primary px-8 py-4" />
        </Link>
        <Button title="I'll do it later" className="rounded-full bg-secondary/20 px-8 py-4" />
      </View>
    </View>
  );
}
