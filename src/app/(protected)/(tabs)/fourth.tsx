import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';

import { PreferenceTabs } from '@/src/components/onboarding';
import { AppText, Button, Container } from '@/src/components/ui';
import { sections } from '@/src/types/preferences';
import { AuthContext } from '@/src/utils/authContext';
import { useTravelPreferencesStore } from '@/store/store';

export default function FourthScreen() {
  const router = useRouter();
  const authState = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<keyof typeof sections>('travel_vibe');

  // Get preferences data
  const { isLoading: preferencesLoading } = useTravelPreferencesStore();

  return (
    <Container>
      <ScrollView className="flex-1 bg-quinary" showsVerticalScrollIndicator={false}>
        <View className="pb-2">
          <AppText size="3xl" weight="bold" color="primary" align="center">
            Your Travel Profile ✈️
          </AppText>
          <AppText size="lg" color="primary" className="mt-2 text-center opacity-80">
            Here's how you like to travel
          </AppText>
        </View>

        {/* Preferences section */}
        <View className="mb-6">
          <PreferenceTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {preferencesLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : (
            <View className="py-2">
              {/* Show edit preferences button for quick access */}
              <View className="my-2 items-center">
                <Button
                  title="Edit Preferences"
                  color="secondary"
                  size="sm"
                  onPress={() => router.push('/onboarding/preferences')}
                />
              </View>
            </View>
          )}
        </View>

        <View className="space-y-4 p-6">
          <Button title="Back" color="secondary" size="sm" onPress={() => router.back()} />
          <Button title="Log out!" onPress={authState.logOut} color="primary" size="sm" />
        </View>
      </ScrollView>
    </Container>
  );
}
