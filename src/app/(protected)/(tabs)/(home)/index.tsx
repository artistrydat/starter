import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View, Modal } from 'react-native';

import { AppText, Button } from '@/src/components/ui';

export default function IndexScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenAlert = () => {
    Alert.alert('Warning!', 'Are you sure you want to proceed?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: () => {
          console.log("Let's go!");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 justify-center p-4">
      <AppText size="2xl" weight="bold" color="primary" align="center">
        Index Screen
      </AppText>

      <Link href="/destination-details" asChild>
        <Button title="View Trip Details Demo" color="primary" size="lg" className="mb-4 mt-6" />
      </Link>

      <Link href="/home-nested" push asChild>
        <Button title="Push to /home-nested" color="primary" size="lg" />
      </Link>

      {canGoBack ? (
        <Button title="Back" color="secondary" size="lg" onPress={() => router.back()} />
      ) : null}

      <Button title="Open Alert" color="secondary" size="lg" onPress={handleOpenAlert} />

      <Button
        title="Open RN Modal"
        color="secondary"
        size="lg"
        onPress={() => setModalVisible(true)}
      />

      <Link href="/modal" push asChild>
        <Button title="Open Router Modal" color="secondary" size="lg" />
      </Link>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 items-center justify-center">
          <View className="rounded-lg bg-white p-12">
            <AppText size="2xl" weight="bold" color="primary" align="center">
              A custom styled modal!
            </AppText>
            <Button
              title="Close"
              color="secondary"
              size="lg"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
