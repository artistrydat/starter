import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function OnboardingLayout() {
  return (
    <View className="flex-1 bg-[#1a1b1e]">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen
          name="index"
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="preferences"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="completion"
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack>
    </View>
  );
}
