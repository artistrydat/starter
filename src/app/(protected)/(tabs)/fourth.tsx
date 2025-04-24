import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { PreferenceTabs, sections } from '@/src/components/PreferenceTabs';
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
        <AppText size="lg" color="secondary" className="mt-2 text-center opacity-80">
          Here's how you like to travel
        </AppText>
      </View>

      <PreferenceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <View className="space-y-4 p-6">
        <Button title="Back" theme="secondary" size="sm" onPress={() => router.back()} />
        <Button title="Log out!" onPress={authState.logOut} theme="primary" size="sm" />
      </View>
    </View>
  );
}
