import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { PreferenceTabs, PreferencesType, sections } from '@/src/components/PreferenceTabs';
import { AuthContext } from '@/src/utils/authContext';
import { supabase } from '@/src/utils/supabaseClient';

export default function FourthScreen() {
  const router = useRouter();
  const authState = useContext(AuthContext);
  const [preferences, setPreferences] = useState<PreferencesType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<keyof typeof sections>('travel_vibe');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('travel_preferences')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      const preferences = data.travel_preferences as PreferencesType;
      setPreferences(preferences);

      // Set initial active tab to first non-empty section
      const firstNonEmptySection = Object.entries(preferences).find(
        ([_, values]) => Array.isArray(values) && values.length > 0
      );
      if (firstNonEmptySection) {
        setActiveTab(firstNonEmptySection[0] as keyof typeof sections);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

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
      {loading ? (
        <AppText size="lg" color="secondary" align="center">
          Loading your preferences...
        </AppText>
      ) : preferences ? (
        <PreferenceTabs
          preferences={preferences}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      ) : (
        <AppText size="lg" color="secondary" align="center">
          No preferences found. Complete the onboarding to set them up!
        </AppText>
      )}

      <View className="space-y-4 p-6">
        <Button title="Back" theme="secondary" size="sm" onPress={() => router.back()} />
        <Button title="Log out!" onPress={authState.logOut} theme="primary" size="sm" />
      </View>
    </View>
  );
}
