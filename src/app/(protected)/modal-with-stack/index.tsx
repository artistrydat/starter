import { Link } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button } from '@/src/components/ui';

export default function ModalWithStackScreen() {
  return (
    <View className="flex-1 justify-center space-y-4 p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Modal With Stack Screen
      </AppText>
      <Link href="/modal-with-stack/nested" push asChild>
        <Button title="Push to /modal-with-stack/nested" theme="secondary" size="lg" />
      </Link>
    </View>
  );
}
