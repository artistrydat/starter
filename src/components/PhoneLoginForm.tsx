import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import OTPVerification from './OTPVerification';
import { supabase } from '../utils/supabaseClient';

type PhoneLoginFormProps = {
  onSubmit: (phoneNumber: string) => void;
};

export function PhoneLoginForm({ onSubmit }: PhoneLoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) throw error;
      setShowOTPScreen(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    try {
      router.replace('/');
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An error occurred during login'
      );
    }
  };

  if (showOTPScreen) {
    return (
      <OTPVerification
        phoneNumber={phoneNumber}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={() => setShowOTPScreen(false)}
      />
    );
  }

  return (
    <View className="w-full space-y-6 p-6">
      <AppText size="3xl" weight="bold" color="primary" align="center" className="mb-2">
        📱 Phone Login
      </AppText>
      <AppText size="lg" color="secondary" align="center" className="mb-6">
        Enter your phone number to continue
      </AppText>

      <BlurView
        intensity={20}
        tint="dark"
        className="flex-row items-center overflow-hidden rounded-2xl border border-white/10">
        <View className="border-r border-white/10 px-4 py-4">
          <MaterialCommunityIcons name="phone" size={24} color="rgba(255, 255, 255, 0.5)" />
        </View>
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          className="flex-1 px-4 py-4 text-lg text-white"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
      </BlurView>

      <Button
        title={loading ? 'Sending...' : 'Continue'}
        onPress={handleSendOTP}
        theme="primary"
        size="lg"
        disabled={!phoneNumber || loading}
      />
    </View>
  );
}

export default PhoneLoginForm;
