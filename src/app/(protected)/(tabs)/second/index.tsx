import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';

export default function SecondScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center space-y-4 p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Second Screen
      </AppText>
      <Link href="/second/nested" push asChild>
        <Button title="Push to /second/nested" theme="primary" size="lg" />
      </Link>
      <Button title="Back" theme="secondary" size="lg" onPress={() => router.back()} />
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
