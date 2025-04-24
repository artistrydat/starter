import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { AuthContext } from '@/src/utils/authContext';
import { supabase } from '@/src/utils/supabaseClient';

export default function CompletionScreen() {
  const router = useRouter();
  const { logIn } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const preferences = params.preferences ? JSON.parse(params.preferences as string) : {};

  const completeOnboarding = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('No user session found');
      }

      // Ensure all required preference fields exist
      const completePreferences = {
        travel_vibe: preferences.travel_vibe || [],
        travel_companion: preferences.travel_companion || [],
        travel_purpose: preferences.travel_purpose || [],
        budget_style: [],
        food_preferences: [],
        tech_preferences: [],
      };

      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          last_onboarding_date: new Date().toISOString(),
          onboarding_version: '1.0',
          travel_preferences: completePreferences,
        },
      });

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: session.user.id,
          email: session.user.email,
          onboarding_completed_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: true,
          travel_preferences: completePreferences,
        },
        { onConflict: 'id' }
      );

      if (profileError) throw profileError;

      if (session.user.email) {
        await logIn(session.user.email, '');
      }

      router.replace('/(protected)/(tabs)/(home)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const sections = {
    travel_vibe: 'Your Travel Vibe',
    travel_companion: 'Travel Companions',
    travel_purpose: 'Travel Goals',
  };

  return (
    <View className="bg-quinary flex-1 p-6">
      <View className="flex-1 items-center">
        <View className="mb-8">
          <View className="h-64 w-64 items-center justify-center">
            <AppText size="4xl">🎉</AppText>
          </View>
        </View>

        <View className="bg-secondary/5 rounded-3xl p-8">
          <View className="items-center space-y-4">
            <AppText size="3xl" weight="bold" color="primary" align="center">
              Your travel vibe is locked in ✨
            </AppText>

            <AppText
              size="lg"
              color="secondary"
              align="center"
              className="max-w-[280px] opacity-80">
              We're building trips just for you. Let's explore!
            </AppText>

            <View className="mt-6 w-full">
              {Object.entries(preferences).map(
                ([key, values]) =>
                  (values as string[]).length > 0 && (
                    <View key={key} className="mb-4">
                      <AppText size="sm" color="primary" className="mb-2">
                        {sections[key as keyof typeof sections]}
                      </AppText>
                      <View className="flex-row flex-wrap">
                        {(values as string[]).map((value) => (
                          <View
                            key={value}
                            className="bg-primary/10 mb-2 mr-2 rounded-full px-4 py-2">
                            <AppText size="sm" color="primary" weight="medium">
                              {value}
                            </AppText>
                          </View>
                        ))}
                      </View>
                    </View>
                  )
              )}
            </View>
          </View>
        </View>
      </View>

      <View>
        <Button
          title="Show Me Trips ✈️"
          onPress={completeOnboarding}
          className="bg-primary rounded-full px-8 py-4"
        />
      </View>
    </View>
  );
}
