import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import '../../global.css';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { AuthProvider } from '@/src/utils/authContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Aeonik: require('../../assets/fonts/Aeonik-Regular.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="(protected)"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="phone-login"
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="phone-signup"
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="phone-verify"
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
