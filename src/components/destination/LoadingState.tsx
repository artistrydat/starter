// components/destination/screen/LoadingState.tsx
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/src/components/ui';

interface LoadingStateProps {
  message?: string;
  color?: string;
}

export const LoadingState = ({
  message = 'Loading itinerary...',
  color = '#5BBFB5',
}: LoadingStateProps) => (
  <View className="flex-1 items-center justify-center">
    <ActivityIndicator size="large" color={color} />
    <AppText size="sm" color="text" className="mt-2">
      {message}
    </AppText>
  </View>
);
