import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

type SignupFormProps = {
  onSubmit: (email: string, password: string, name: string) => void;
  loading?: boolean;
};

export function SignupForm({ onSubmit, loading = false }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const validateForm = () => {
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(email, password, name);
    }
  };

  return (
    <View className="w-full space-y-6 p-6">
      <AppText size="3xl" weight="bold" color="primary" align="center" className="mb-2">
        ✨ Create Account
      </AppText>
      <AppText size="lg" color="secondary" align="center" className="mb-6">
        Join us on this amazing journey
      </AppText>

      <View className="space-y-4">
        <View>
          <BlurView
            intensity={20}
            tint="dark"
            className={`overflow-hidden rounded-2xl border ${
              nameError ? 'border-red-500' : 'border-white/10'
            }`}>
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError('');
              }}
              autoCapitalize="words"
              className="px-6 py-4 text-lg text-white"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              editable={!loading}
            />
          </BlurView>
          {nameError ? (
            <AppText size="sm" color="error" className="ml-2 mt-1">
              {nameError}
            </AppText>
          ) : null}
        </View>

        <View>
          <BlurView
            intensity={20}
            tint="dark"
            className={`overflow-hidden rounded-2xl border ${
              emailError ? 'border-red-500' : 'border-white/10'
            }`}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              className="px-6 py-4 text-lg text-white"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              editable={!loading}
            />
          </BlurView>
          {emailError ? (
            <AppText size="sm" color="error" className="ml-2 mt-1">
              {emailError}
            </AppText>
          ) : null}
        </View>

        <View>
          <BlurView
            intensity={20}
            tint="dark"
            className={`flex-row items-center overflow-hidden rounded-2xl border ${
              passwordError ? 'border-red-500' : 'border-white/10'
            }`}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry={!showPassword}
              className="flex-1 px-6 py-4 text-lg text-white"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="px-4"
              disabled={loading}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="rgba(255, 255, 255, 0.5)"
              />
            </TouchableOpacity>
          </BlurView>
          {passwordError ? (
            <AppText size="sm" color="error" className="ml-2 mt-1">
              {passwordError}
            </AppText>
          ) : null}
        </View>
      </View>

      <Button
        title={loading ? 'Creating Account...' : 'Create Account'}
        onPress={handleSubmit}
        theme="primary"
        size="lg"
        disabled={loading || !email || !password || !name}
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="#C5E7E3" />
        </View>
      )}

      <AppText size="sm" color="tertiary" align="center">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </AppText>
    </View>
  );
}
