import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Alert, Pressable } from 'react-native';

import { SignupForm } from '@/src/components/auth';
import { AppText } from '@/src/components/ui';
import { supabase } from '@/src/utils/supabaseClient';

const SignupScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up user with email:', email);

      // Simple signup with Supabase
      const { error, data } = await supabase.auth.signUp({
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

  const handleGoogleSignUp = () => {
    // TODO: Implement Google sign up
    Alert.alert('Coming Soon', 'Google sign up will be implemented soon.');
  };

  return (
    <View className="flex-1 justify-between bg-white p-5">
      <View className="flex-1 justify-center">
        <SignupForm onSubmit={handleSignup} loading={loading} onGoogleSignUp={handleGoogleSignUp} />
      </View>

      <View className="mb-5 items-center">
        <AppText size="sm">
          Already have account?{' '}
          <Pressable onPress={() => router.replace('/login')}>
            <AppText size="sm" color="primary">
              Sign in
            </AppText>
          </Pressable>
        </AppText>
      </View>
    </View>
  );
};

export default SignupScreen;
