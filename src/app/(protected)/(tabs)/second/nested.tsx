import { Link } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button } from '@/src/components/ui';

export default function SecondNestedScreen() {
  return (
    <View className="flex-1 justify-center space-y-4 bg-pink-200 p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Second Nested Screen
      </AppText>
      <Link href="/second/also-nested" push asChild>
        <Button title="Push to /second/also-nested" color="primary" size="lg" />
      </Link>
    </View>
  );
}
