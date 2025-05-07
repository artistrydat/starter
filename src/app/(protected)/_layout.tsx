import { Redirect, Stack, usePathname } from 'expo-router';
import { useContext } from 'react';

import { AuthContext } from '@/src/utils/authContext';
import { ReactQueryProvider } from '@/src/utils/queryClient';

export const unstable_settings = {
  initialRouteName: '(tabs)', // anchor
};

export default function ProtectedLayout() {
  const authState = useContext(AuthContext);
  const pathname = usePathname();

  if (!authState.isReady) {
    return null;
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // Redirect new users to onboarding flow
  // Only redirect if not already on the onboarding route
  if (
    authState.isLoggedIn &&
    !authState.hasCompletedOnboarding &&
    !pathname.includes('/onboarding')
  ) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <ReactQueryProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </ReactQueryProvider>
  );
}
