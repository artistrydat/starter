import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Alert } from 'react-native';

import { PhoneSignupForm } from '@/src/components/auth';
import { AppText, Button } from '@/src/components/ui';
import { supabase } from '@/src/utils/supabaseClient';

const PhoneSignupScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (phoneNumber: string, fullName: string) => {
    try {
      setLoading(true);

      // Validate phone number format (basic check)
      if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +1234567890)');
      }

      // Send OTP using Supabase phone auth
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (otpError) throw otpError;

      // Store signup details temporarily (you might want to use a proper state management solution)
      // The actual profile creation will happen after OTP verification in the OTPVerification component
      router.push({
        pathname: '/phone-verify',
        params: {
          phoneNumber,
          fullName,
        }
      });

    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <AppText size="display" weight="bold" color="primary" align="center">
        Create Account
      </AppText>
      <PhoneSignupForm onSubmit={handleSignup} />
      <View className="mt-4">
        <Button
          color="secondary"
          size="lg"
          title="Already have an account? Login"
          onPress={() => router.replace('/phone-login')}
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default PhoneSignupScreen;
