// components/destination/screen/LoadingState.tsx
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/src/components/ui';

/**
 * LoadingState component - Pure UI component for displaying loading states
 * No data fetching or source-specific logic included
 */
export interface LoadingStateProps {
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

export default LoadingState;
