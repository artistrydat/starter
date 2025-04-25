import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { View } from 'react-native';

import { PreferenceTabs } from '@/src/components/onboarding';
import { AppText, Button } from '@/src/components/ui';
import { sections } from '@/src/types/preferences';
import { AuthContext } from '@/src/utils/authContext';

export default function FourthScreen() {
  const router = useRouter();
  const authState = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<keyof typeof sections>('travel_vibe');

  return (
    <View className="bg-quinary flex-1">
      <View className="pb-2">
        <AppText size="3xl" weight="bold" color="primary" align="center">
          Your Travel Profile ✈️
        </AppText>
        <AppText size="lg" color="primary" className="mt-2 text-center opacity-80">
          Here's how you like to travel
        </AppText>
      </View>

      <PreferenceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <View className="space-y-4 p-6">
        <Button title="Back" color="secondary" size="sm" onPress={() => router.back()} />
        <Button title="Log out!" onPress={authState.logOut} color="primary" size="sm" />
      </View>
    </View>
  );
}
