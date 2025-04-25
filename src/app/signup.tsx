import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Alert } from 'react-native';

import { SignupForm } from '@/src/components/auth';
import { Button } from '@/src/components/ui';
import { supabase } from '@/src/utils/supabaseClient';

const SignupScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up user with email:', email);

      // Simple signup with Supabase - the database trigger will handle profile creation
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error.message);
        throw new Error(`Authentication error: ${error.message}`);
      }

      console.log('User created successfully');

      // Check if email confirmation is required
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        // Email confirmation is required
        Alert.alert(
          'Registration Successful',
          'Please check your email for verification link before logging in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        // No email confirmation required, proceed to onboarding
        router.replace('/(protected)/onboarding');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <SignupForm onSubmit={handleSignup} loading={loading} />
      <View className="mt-4">
        <Button
          color="tertiary"
          size="lg"
          title="Already have an account? Login"
          onPress={() => router.replace('/login')}
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default SignupScreen;
