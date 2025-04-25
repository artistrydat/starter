import { View } from 'react-native';

import { AppText } from '@/src/components/ui';

export default function SecondAlsoNestedScreen() {
  return (
    <View className="flex-1 justify-center bg-yellow-200 p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Second Also Nested Screen
      </AppText>
    </View>
  );
}
