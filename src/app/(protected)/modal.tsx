import { View } from 'react-native';

import { AppText } from '@/src/components/ui';

export default function ModalScreen() {
  return (
    <View className="flex-1 justify-center p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Modal Screen
      </AppText>
    </View>
  );
}
