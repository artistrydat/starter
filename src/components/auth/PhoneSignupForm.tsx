import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';

import OTPVerification from './OTPVerification';
import RegistrationSuccess from './RegistrationSuccess';
import { supabase } from '../../utils/supabaseClient';

import { AppText, Button } from '@/src/components/ui';

type PhoneSignupFormProps = {
  onSubmit: (phoneNumber: string, fullName: string) => void;
};

export function PhoneSignupForm({ onSubmit }: PhoneSignupFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!phoneNumber || !fullName || !password || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
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
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session?.user) {
        throw new Error('No user session found');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: fullName },
        email,
      });

      if (updateError) throw updateError;

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: session.user.id,
          phone: phoneNumber,
          name: fullName,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (profileError) throw profileError;
      setRegistrationComplete(true);
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An error occurred during registration'
      );
    } finally {
      setLoading(false);
    }
  };

  if (registrationComplete) {
    return <RegistrationSuccess />;
  }

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
        ✨ Join Us
      </AppText>
      <AppText size="lg" color="secondary" align="center" className="mb-6">
        Create your account with phone number
      </AppText>

      <BlurView
        intensity={20}
        tint="dark"
        className="overflow-hidden rounded-2xl border border-white/10">
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          className="px-6 py-4 text-lg text-white"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
      </BlurView>

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
        title="Create Account"
        onPress={() => onSubmit(phoneNumber, fullName)}
        color="primary"
        size="lg"
        disabled={!phoneNumber || !fullName}
      />

      <AppText size="sm" color="tertiary" align="center" weight="medium">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </AppText>
    </View>
  );
}
