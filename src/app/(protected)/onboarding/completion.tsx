import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { View, Alert } from 'react-native';

import { AppText, Button } from '@/src/components/ui';
import { sections } from '@/src/types/preferences';
import { AuthContext } from '@/src/utils/authContext';
import { supabase, getSessionWithRetry } from '@/src/utils/supabaseClient';

export default function CompletionScreen() {
  const router = useRouter();
  const { logIn } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const preferences = params.preferences ? JSON.parse(params.preferences as string) : {};
  const budgetRange = params.budgetRange ? Number(params.budgetRange) : 50;
  const [isLoading, setIsLoading] = useState(false);

  // Convert budget range to a category
  const getBudgetCategory = (range: number) => {
    if (range < 33) return 'budget';
    if (range < 66) return 'mid_range';
    return 'luxury';
  };

  const getBudgetRangeText = (range: number) => {
    if (range < 33) {
      return 'Budget ($30-100/day)';
    } else if (range < 66) {
      return 'Mid-Range ($100-300/day)';
    } else {
      return 'Luxury ($300+/day)';
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      console.log('Starting onboarding completion process...');

      // Using our improved session getter with retries
      const { session, error: sessionError } = await getSessionWithRetry();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      // Still no session after retry attempts
      if (!session?.user) {
        console.error('No valid session after retry attempts');
        Alert.alert(
          'Session Error',
          'Your session has expired or is invalid. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
        return;
      }

      console.log('Valid session found, continuing with onboarding completion');

      // Ensure all required preference fields exist and include new budget structure
      const completePreferences = {
        travel_vibe: preferences.travel_vibe || [],
        travel_companion: preferences.travel_companion || [],
        travel_purpose: preferences.travel_purpose || [],
        budget: {
          amount: budgetRange,
          style: [getBudgetCategory(budgetRange)],
        },
        food_preferences: preferences.food_preferences || [],
        tech_preferences: preferences.tech_preferences || [],
      };

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          last_onboarding_date: new Date().toISOString(),
          travel_preferences: completePreferences,
        },
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        throw updateError;
      }

      // Update profile in database
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: session.user.id,
          email: session.user.email,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_completed: true,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          travel_preferences: completePreferences,
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      console.log('Onboarding data saved successfully, logging in with refreshed session');

      // Use the session user email to log in again
      if (session.user.email) {
        await logIn(session.user.email, '');
      } else {
        throw new Error('User email not found in session');
      }

      router.replace('/(protected)/(tabs)/(home)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Onboarding Error',
        'There was an error completing your onboarding. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="bg-background flex-1 p-6">
      <View className="flex-1 items-center">
        <View className="mb-8">
          <View className="h-64 w-64 items-center justify-center">
            <AppText size="4xl">🎉</AppText>
          </View>
        </View>

        <View className="rounded-3xl bg-tertiary p-8 shadow-sm">
          <View className="items-center space-y-4">
            <AppText size="3xl" weight="bold" color="text" align="center">
              Your travel profile is set! ✨
            </AppText>

            <AppText size="lg" color="text" align="center" className="max-w-[280px] opacity-80">
              We've got everything we need to make your trips amazing
            </AppText>

            <View className="mt-6 w-full">
              {Object.entries(preferences).map(([key, values]) => {
                const sectionKey = key as keyof typeof sections;
                if (!sections[sectionKey] || (values as string[]).length === 0) return null;

                return (
                  <View key={key} className="mb-4">
                    <View className="flex-row items-center">
                      <AppText size="lg" className="mr-2">
                        {sections[sectionKey].emoji}
                      </AppText>
                      <AppText size="sm" color="text" className="mb-2 font-medium">
                        {sections[sectionKey].title}
                      </AppText>
                    </View>
                    <View className="flex-row flex-wrap">
                      {(values as string[]).map((value) => (
                        <View
                          key={value}
                          className="mb-2 mr-2 rounded-full bg-quaternary/20 px-4 py-2">
                          <AppText size="sm" color="text" weight="medium">
                            {value}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}

              {/* Display Budget Range and Style */}
              <View className="mb-4">
                <View className="flex-row items-center">
                  <AppText size="lg" className="mr-2">
                    💰
                  </AppText>
                  <AppText size="sm" color="text" className="mb-2 font-medium">
                    Budget Style
                  </AppText>
                </View>
                <View className="flex-row flex-wrap">
                  <View className="mb-2 mr-2 rounded-full bg-quaternary/20 px-4 py-2">
                    <AppText size="sm" color="text" weight="medium">
                      {getBudgetRangeText(budgetRange)}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View>
        <Button
          title={isLoading ? 'Finishing Up...' : 'Show Me Trips ✈️'}
          onPress={completeOnboarding}
          className="rounded-full bg-primary px-8 py-4"
          color="white"
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
