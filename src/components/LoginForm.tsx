import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword: () => void;
};

export function LoginForm({ onSubmit, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full space-y-6 p-6">
      <AppText size="3xl" weight="bold" color="primary" align="center" className="mb-2">
        👋 Welcome Back
      </AppText>
      <AppText size="lg" color="secondary" align="center" className="mb-6">
        Sign in to continue your journey
      </AppText>

      <BlurView
        intensity={20}
        tint="dark"
        className="overflow-hidden rounded-2xl border border-white/10">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="px-6 py-4 text-lg text-white"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
      </BlurView>

      <BlurView
        intensity={20}
        tint="dark"
        className="flex-row items-center overflow-hidden rounded-2xl border border-white/10">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          className="flex-1 px-6 py-4 text-lg text-white"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-4">
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="rgba(255, 255, 255, 0.5)"
          />
        </TouchableOpacity>
      </BlurView>

      <Button
        title="Sign In"
        onPress={() => onSubmit(email, password)}
        theme="primary"
        size="lg"
        disabled={!email || !password}
      />

      <TouchableOpacity onPress={onForgotPassword} className="items-center py-2">
        <AppText size="sm" color="primary" weight="medium">
          Forgot your password?
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
