import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';

export default function ThirdScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center space-y-4 p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Third Screen
      </AppText>
      <Button title="Back" theme="secondary" size="lg" onPress={() => router.back()} />
    </View>
  );
}
