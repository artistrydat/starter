import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="home-nested" options={{ title: 'Home Nested' }} />
      <Stack.Screen name="destination-details" options={{ title: 'Trip Details' }} />
    </Stack>
  );
}
