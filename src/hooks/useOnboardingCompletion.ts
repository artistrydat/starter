import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Alert } from 'react-native';

import { PreferencesType } from '@/src/types/preferences';
import { AuthContext } from '@/src/utils/authContext';
import { supabase, getSessionWithRetry } from '@/src/utils/supabaseClient';

/**
 * Custom hook for saving user preferences during onboarding completion
 */
export function useOnboardingCompletion() {
  const router = useRouter();
  const { logIn } = useContext(AuthContext);

  // Convert budget range to a category
  const getBudgetCategory = (range: number) => {
    if (range < 33) return 'budget';
    if (range < 66) return 'mid_range';
    return 'luxury';
  };

  return useMutation({
    mutationFn: async ({
      preferences,
      budgetRange,
    }: {
      preferences: PreferencesType;
      budgetRange: number;
    }) => {
      // Using our improved session getter with retries
      const { session, error: sessionError } = await getSessionWithRetry();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      // Still no session after retry attempts
      if (!session?.user) {
        console.error('No valid session after retry attempts');
        throw new Error('Session not found');
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

      console.log('Onboarding data saved successfully');

      return { user: session.user, preferences: completePreferences };
    },
    onSuccess: async (data) => {
      console.log('Onboarding completed successfully, refreshing session');

      // Use the session user email to log in again
      if (data.user.email) {
        try {
          await logIn(data.user.email, '');
          router.replace('/(protected)/(tabs)/(home)');
        } catch (error) {
          console.error('Error logging in after onboarding:', error);
          Alert.alert(
            'Login Error',
            'Your preferences were saved but there was an error logging you in. Please try logging in again.'
          );
          router.replace('/login');
        }
      } else {
        throw new Error('User email not found in session');
      }
    },
    onError: (error) => {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Onboarding Error',
        'There was an error completing your onboarding. Please try again.'
      );
    },
  });
}
