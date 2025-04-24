import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useContext } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OTPVerification from '@/src/components/OTPVerification';
import { AuthContext } from '@/src/utils/authContext';
import { supabase } from '@/src/utils/supabaseClient';

export default function PhoneVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { logIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const phoneNumber = params.phoneNumber as string;
  const fullName = params.fullName as string;
  const isSignup = params.isSignup === 'true';

  const handleVerificationSuccess = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session?.user) {
        throw new Error('No user session found');
      }

      if (isSignup) {
        // Update user metadata for signup
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            name: fullName,
            onboarding_completed: false,
          },
        });

        if (updateError) throw updateError;

        // Create profile in profiles table
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: session.user.id,
            phone: phoneNumber,
            name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (profileError) throw profileError;

        // Redirect to onboarding after signup
        router.replace('/onboarding');
      } else {
        // For login, just redirect to home
        router.replace('/(protected)/(tabs)/(home)');
      }
    } catch (error) {
      Alert.alert(
        isSignup ? 'Registration Failed' : 'Login Failed',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <OTPVerification
        phoneNumber={phoneNumber}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={() => router.back()}
      />
    </SafeAreaView>
  );
}
