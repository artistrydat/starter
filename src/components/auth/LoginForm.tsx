import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image } from 'react-native';

import { AppText, Button } from '@/src/components/ui';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onGoogleSignIn?: () => void;
};

export function LoginForm({ onSubmit, onForgotPassword, onGoogleSignIn }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full space-y-4">
      <View className="mb-6 items-center">
        <AppText size="xl" weight="bold" className="mb-2">
          Welcome back!
        </AppText>
        <AppText size="sm" color="quaternary">
          Let's login for explore continues
        </AppText>
      </View>

      <View className="mb-2 flex-row items-center rounded-lg border border-gray-200 bg-white px-3 py-4">
        <MaterialCommunityIcons name="email-outline" size={20} color="gray" className="mr-2" />
        <TextInput
          placeholder="enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="flex-1 pl-2 text-base text-gray-800"
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
        />
      </View>

      <View className="flex-row items-center rounded-lg border border-gray-200 bg-white px-3 py-4">
        <MaterialCommunityIcons name="lock-outline" size={20} color="gray" className="mr-2" />
        <TextInput
          placeholder="••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          className="flex-1 pl-2 text-base text-gray-800"
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-end">
        <TouchableOpacity onPress={onForgotPassword}>
          <AppText size="sm" color="primary">
            Forgot password?
          </AppText>
        </TouchableOpacity>
      </View>

      <Button
        title="Sign In"
        onPress={() => onSubmit(email, password)}
        color="primary"
        size="lg"
        className="mt-4 rounded-lg py-4"
      />

      <View className="mb-4 mt-4 items-center">
        <AppText size="sm" color="quaternary">
          You can Connect with
        </AppText>
      </View>

      <TouchableOpacity
        onPress={onGoogleSignIn}
        className="flex-row items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3">
        <Image
          source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
          style={{ width: 20, height: 20 }}
          className="mr-2"
        />
        <AppText>Sign Up with Google</AppText>
      </TouchableOpacity>
    </View>
  );
}
