import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Alert } from 'react-native';

import { Button } from '@/src/components/Button';
import { SignupForm } from '@/src/components/SignupForm';
import { supabase } from '@/src/utils/supabaseClient';

const SignupScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);

      // Validate email format
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Sign up with Supabase
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            onboarding_completed: false,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('unique constraint')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        }
        throw signUpError;
      }

      if (!user) throw new Error('No user data returned');

      // Create profile in profiles table
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        if (profileError.message.includes('unique constraint')) {
          throw new Error('A profile with this email already exists');
        }
        throw profileError;
      }

      // Check if email confirmation is required
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An error occurred'
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
          theme="tertiary"
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
