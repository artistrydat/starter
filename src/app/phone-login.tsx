import { useRouter } from 'expo-router';
import { useState, useContext } from 'react';
import { View, Alert } from 'react-native';

import { PhoneLoginForm } from '@/src/components/auth';
import { AppText, Button } from '@/src/components/ui';
import { AuthContext } from '@/src/utils/authContext';
import { supabase } from '@/src/utils/supabaseClient';

const PhoneLoginScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { logIn } = useContext(AuthContext);

  const handlePhoneLogin = async (phoneNumber: string) => {
    try {
      setLoading(true);

      // Validate phone number format
      if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Please enter a valid phone number with country code (e.g., +1234567890)');
      }

      // Send OTP using Supabase phone auth
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (otpError) throw otpError;

      // Navigate to OTP verification screen
      router.push({
        pathname: '/phone-verify',
        params: {
          phoneNumber,
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
        Phone Login
      </AppText>
      <PhoneLoginForm onSubmit={handlePhoneLogin} />
      <View className="mt-4">
        <Button
          color="secondary"
          size="lg"
          title="Don't have an account? Sign up"
          onPress={() => router.replace('/phone-signup')}
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default PhoneLoginScreen;
