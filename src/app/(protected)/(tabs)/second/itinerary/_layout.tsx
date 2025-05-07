import { Stack, usePathname } from 'expo-router';

export default function ActivityLayout() {
  const pathname = usePathname();

  return (
    <Stack
      screenOptions={{
        animation: pathname.startsWith('/second/itinerary/activity/') ? 'default' : 'none',
      }}>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: 'Itinerary',
        }}
      />
      <Stack.Screen
        name="activity/[id]"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Activity Details',
        }}
      />
    </Stack>
  );
}
