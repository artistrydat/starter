import { Stack, usePathname } from 'expo-router';

export default function ItineraryLayout() {
  const pathname = usePathname();

  return (
    <Stack
      screenOptions={{
        animation: pathname.startsWith('/second') ? 'default' : 'none',
      }}>
      <Stack.Screen name="index" options={{ title: 'Second' }} />
      <Stack.Screen name="also-nested" options={{ title: 'Second Also Nested' }} />
    </Stack>
  );
}
