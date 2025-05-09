import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Share,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { AppText, Button, Container } from '@/src/components/ui';
import { useUserProfile } from '@/src/hooks/profileQueries';
import { supabase } from '@/src/utils/supabaseClient';

export default function ProfileShare() {
  const router = useRouter();
  const { data: userProfile, isLoading } = useUserProfile();
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  // Set username when profile data is loaded
  useEffect(() => {
    const fetchUserData = async () => {
      if (userProfile) {
        setUsername(userProfile.username ? `@${userProfile.username}` : '@user');

        // Generate a profile URL - in real app this might be a deep link
        setProfileUrl(`https://yourapp.com/profile/${userProfile.id}`);
      } else {
        // Get current user if userProfile query hasn't completed yet
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setProfileUrl(`https://yourapp.com/profile/${data.session.user.id}`);
        }
      }
    };

    fetchUserData();
  }, [userProfile]);

  const handleBack = () => {
    router.back();
  };

  const handleDownload = () => {
    // This would save the QR code to the device in a real implementation
    Alert.alert('QR Code', 'QR code would be saved to your device.');
  };

  const handleCopyLink = async () => {
    // Copy the profile link to clipboard
    await Clipboard.setStringAsync(profileUrl);
    Alert.alert('Success', 'Profile link copied to clipboard!');
  };

  const handleShareProfile = async () => {
    try {
      const result = await Share.share({
        message: `Check out my travel profile: ${username}`,
        url: profileUrl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log(`Shared via ${result.activityType}`);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Could not share profile. Please try again.');
    }
  };

  const handleGenerateNewQR = () => {
    // This would generate a new QR code in a real implementation
    Alert.alert('Generate QR', 'A new QR code would be generated in a real implementation.');
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5BBFB5" />
          <AppText className="mt-4">Loading profile data...</AppText>
        </View>
      </Container>
    );
  }

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
          <View style={{ width: 24 }}>{/* Empty view for centering */}</View>
        </View>

        {/* User Info */}
        {userProfile && (
          <View className="mb-4 items-center">
            <Image
              source={{
                uri: userProfile.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg',
              }}
              className="h-16 w-16 rounded-full"
            />
            <AppText size="lg" weight="bold" className="mt-2">
              {userProfile.full_name || 'User'}
            </AppText>
            <AppText size="sm" color="quaternary">
              {username}
            </AppText>

            {/* Status indicators */}
            <View className="mt-2 flex-row space-x-2">
              {userProfile.ispremium && (
                <View className="flex-row items-center rounded-full bg-yellow-100 px-2 py-1">
                  <MaterialCommunityIcons name="crown" size={14} color="#FFD700" />
                  <AppText size="xs" className="ml-1">
                    Premium
                  </AppText>
                </View>
              )}

              {userProfile.issubscribed && (
                <View className="flex-row items-center rounded-full bg-green-100 px-2 py-1">
                  <MaterialCommunityIcons name="check-circle" size={14} color="#5BBFB5" />
                  <AppText size="xs" className="ml-1">
                    Subscribed
                  </AppText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* QR Code Container */}
        <View className="my-4 items-center">
          <View className="rounded-3xl bg-white p-8 shadow-sm">
            {/* QR Code Image */}
            <Image
              source={require('../../../../assets/icons/mock-qr.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />

            {/* QR Description */}
            <View className="mt-4 items-center">
              <AppText size="sm" color="quaternary" align="center">
                Scan this code to view my profile
              </AppText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-6 my-4 flex-row justify-around">
          <ActionButton icon="share-variant" label="Share" onPress={handleShareProfile} />
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

        {/* Statistics */}
        {userProfile && (
          <View className="mx-6 mb-4 flex-row justify-around rounded-lg bg-white p-4 shadow-sm">
            <StatItem label="Itineraries" value={userProfile.itineraryCount || 0} />
            <StatItem label="Followers" value={userProfile.followersCount || 0} />
            <StatItem label="Following" value={userProfile.followingCount || 0} />
          </View>
        )}

        {/* Generate New QR Button */}
        <View className="m-6">
          <Button
            title="Generate New QR"
            color="primary"
            size="base"
            onPress={handleGenerateNewQR}
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

// Helper component for statistics
function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <AppText size="xl" weight="bold" color="primary">
        {value}
      </AppText>
      <AppText size="xs" color="quaternary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  qrImage: {
    width: 200,
    height: 200,
  },
});
