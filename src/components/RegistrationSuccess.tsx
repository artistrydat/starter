import { BlurView } from 'expo-blur';
import React from 'react';
import { View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

type RegistrationSuccessProps = {
  onContinue?: () => void;
};

export default function RegistrationSuccess({ onContinue }: RegistrationSuccessProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-8 h-64 w-64">
        <BlurView
          intensity={20}
          tint="dark"
          className="items-center space-y-4 rounded-3xl border border-white/10 p-8">
          <AppText size="3xl" weight="bold" color="primary" align="center" className="mb-2">
            🎉 Welcome Aboard!
          </AppText>
          <AppText size="lg" color="secondary" align="center" className="max-w-[280px]">
            Your account has been created successfully. Ready to start your journey?
          </AppText>
        </BlurView>

        <Button
          title="Let's Begin"
          onPress={onContinue}
          theme="primary"
          size="lg"
          className="mt-8 w-full"
        />
      </View>
    </View>
  );
}
