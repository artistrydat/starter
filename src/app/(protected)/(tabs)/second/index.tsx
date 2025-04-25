import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button } from '@/src/components/ui';

export default function SecondScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center space-y-4 p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Second Screen
      </AppText>
      <Link href="/second/nested" push asChild>
        <Button title="Push to /second/nested" color="primary" size="lg" />
      </Link>
      <Button title="Back" color="secondary" size="lg" onPress={() => router.back()} />
    </View>
  );
}

/**
 * /index
 * /second (stack)
 *   /second/index
 *   /second/nested
 *   /second/also-nested
 * /third
 * /fourth
 */
