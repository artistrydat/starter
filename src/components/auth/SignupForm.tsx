import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

import { AppText, Button } from '@/src/components/ui';

type SignupFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  onGoogleSignUp?: () => void;
};

export function SignupForm({ onSubmit, loading = false, onGoogleSignUp }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      return false;
    }

    if (password !== confirmPassword) {
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(email, password);
    }
  };

  return (
    <View className="w-full space-y-4">
      {/* Signup Illustration */}
      <View className="mb-3 items-center">
        <Image
          source={{ uri: 'https://img.icons8.com/color/344/mobile-payment.png' }}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
      </View>

      <View className="mb-6 items-center">
        <AppText size="xl" weight="bold" className="mb-2">
          Let's Get Started
        </AppText>
        <AppText size="sm" color="quaternary">
          create an account to get all features
        </AppText>
      </View>

      <View className="mb-2 flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-4">
        <MaterialCommunityIcons name="email-outline" size={20} color="gray" className="mr-2" />
        <TextInput
          placeholder="enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="flex-1 pl-2 text-base text-gray-800"
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          editable={!loading}
        />
      </View>

      <View className="mb-2 flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-4">
        <MaterialCommunityIcons name="lock-outline" size={20} color="gray" className="mr-2" />
        <TextInput
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          className="flex-1 pl-2 text-base text-gray-800"
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          editable={!loading}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
          <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <View className="mb-2 flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-4">
        <MaterialCommunityIcons name="lock-outline" size={20} color="gray" className="mr-2" />
        <TextInput
          placeholder="confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          className="flex-1 pl-2 text-base text-gray-800"
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          editable={!loading}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={loading}>
          <MaterialCommunityIcons
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <Button
        title="Sign Up"
        onPress={handleSubmit}
        color="primary"
        size="lg"
        className="mt-4 rounded-lg py-4"
        disabled={loading}
      />

      {loading && <ActivityIndicator size="small" color="#000" className="my-2" />}

      <View className="mb-4 mt-4 items-center">
        <AppText size="sm" color="quaternary">
          You can Connect with
        </AppText>
      </View>

      <TouchableOpacity
        onPress={onGoogleSignUp}
        className="flex-row items-center justify-center rounded-lg border border-gray-300 px-4 py-3"
        disabled={loading}>
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
