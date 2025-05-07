import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, TouchableOpacity, Share, Image, ScrollView, StyleSheet } from 'react-native';

import { AppText, Button, Container } from '@/src/components/ui';

export default function ProfileShare() {
  const router = useRouter();
  const [username] = useState('@moaalmusfer'); // Hardcoded for demonstration

  const handleBack = () => {
    router.back();
  };

  const handleDownload = () => {
    // This would save the QR code to the device in a real implementation
    console.log('Downloading QR code...');
  };

  const handleCopyLink = () => {
    // This would copy the profile link to clipboard in a real implementation
    console.log('Copying profile link...');
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my travel profile: ${username}`,
        url: 'https://yourapp.com/profile/moaalmusfer',
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  return (
    <Container>
      <ScrollView className="flex-1 bg-quinary" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <TouchableOpacity onPress={handleBack} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#3A464F" />
          </TouchableOpacity>
          <AppText size="lg" weight="semibold" color="text">
            PROFILE QR
          </AppText>
          <View style={{ width: 24 }}>{/* Empty view for centering - Now properly closed */}</View>
        </View>

        {/* QR Code Container */}
        <View className="my-4 items-center">
          <View className="rounded-3xl bg-white p-12 shadow-sm">
            {/* QR Code Image */}
            <Image
              source={require('../../../../assets/icons/mock-qr.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />

            {/* Username display below QR */}
            <View className="mt-4 items-center">
              <AppText size="xl" weight="bold" color="text">
                {username}
              </AppText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-6 my-4 flex-row justify-around">
          <ActionButton icon="share-variant" label="Share profile" onPress={handleShareProfile} />

          <ActionButton icon="link" label="Copy link" onPress={handleCopyLink} />

          <ActionButton icon="download" label="Download" onPress={handleDownload} />
        </View>

        {/* Usage Instructions */}
        <View className="m-6 rounded-lg bg-tertiary p-4">
          <AppText size="base" weight="semibold" color="text" className="mb-2">
            How to use
          </AppText>
          <AppText size="sm" color="text">
            Share your profile QR code with friends, or scan someone else's code to connect. This
            makes it easy to find and follow each other on our travel platform.
          </AppText>
        </View>

        {/* Retake Button */}
        <View className="m-6">
          <Button
            title="Generate New QR"
            color="primary"
            size="base"
            onPress={() => console.log('Generating new QR code...')}
          />
        </View>
      </ScrollView>
    </Container>
  );
}

// Helper component for action buttons
function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center px-4 py-2">
      <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-tertiary">
        <MaterialCommunityIcons name={icon as any} size={24} color="#5BBFB5" />
      </View>
      <AppText size="xs" color="text">
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  qrImage: {
    width: 200,
    height: 200,
  },
});
