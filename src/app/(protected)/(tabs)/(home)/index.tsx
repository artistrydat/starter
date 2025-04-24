import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View, Modal } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';

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
      
      <Link href="/home-nested" push asChild>
        <Button title="Push to /home-nested" theme="primary" size="lg" />
      </Link>
      
      {canGoBack ? (
        <Button
          title="Back"
          theme="secondary"
          size="lg"
          onPress={() => router.back()}
        />
      ) : null}
      
      <Button 
        title="Open Alert" 
        theme="secondary" 
        size="lg"
        onPress={handleOpenAlert} 
      />
      
      <Button 
        title="Open RN Modal" 
        theme="secondary" 
        size="lg"
        onPress={() => setModalVisible(true)} 
      />
      
      <Link href="/modal" push asChild>
        <Button title="Open Router Modal" theme="secondary" size="lg" />
      </Link>
      
      <Link href="/modal-with-stack" push asChild>
        <Button title="Open Router Modal (Stack)" theme="secondary" size="lg" />
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
              theme="secondary"
              size="lg"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
