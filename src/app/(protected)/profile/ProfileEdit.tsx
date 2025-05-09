import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { AppText, Button, Container } from '@/src/components/ui';
import { useUpdateProfile, useUserProfile } from '@/src/hooks/profileQueries';
import { ProfileFormData } from '@/src/types/profiles';

export default function ProfileEdit() {
  // Fetch profile data using the useUserProfile hook
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Form state for editing
  const [profile, setProfile] = useState<ProfileFormData>({
    username: '',
    fullName: '',
    bio: '',
    avatarUrl: '',
  });

  // Update local state when profile data is loaded
  useEffect(() => {
    if (userProfile) {
      setProfile({
        username: userProfile.username || '',
        fullName: userProfile.full_name || '',
        bio: userProfile.bio || '',
        avatarUrl: userProfile.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg',
        travelStyle: userProfile.travel_style || '',
      });
    }
  }, [userProfile]);

  // Handle text input changes
  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Function for updating profile with real data
  const handleSaveProfile = () => {
    // Basic validation
    if (!profile.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    // Convert client-side form data to match database schema
    updateProfile(
      {
        username: profile.username,
        full_name: profile.fullName,
        bio: profile.bio,
        avatar_url: profile.avatarUrl,
        travel_style: profile.travelStyle,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated successfully!');
          router.back();
        },
        onError: (error) => {
          Alert.alert('Error', `Failed to update profile: ${error}`);
        },
      }
    );
  };

  // Function for image upload
  const handleImageUpload = () => {
    Alert.alert('Image Upload', 'This would open an image picker in a real implementation');
    // This is just a placeholder for actual image upload functionality
    setProfile((prev) => ({
      ...prev,
      avatarUrl:
        prev.avatarUrl === 'https://randomuser.me/api/portraits/men/32.jpg'
          ? 'https://randomuser.me/api/portraits/men/33.jpg'
          : 'https://randomuser.me/api/portraits/men/32.jpg',
    }));
  };

  // Display loading state while fetching profile
  if (isProfileLoading) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5BBFB5" />
          <AppText className="mt-4">Loading profile...</AppText>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <AppText size="xl" weight="bold" className="mr-8 flex-1 text-center">
            Edit profile
          </AppText>
        </View>

        {/* Profile Photo */}
        <View className="mb-6 items-center">
          <View className="relative">
            <Image source={{ uri: profile.avatarUrl }} className="h-24 w-24 rounded-full" />
            <TouchableOpacity
              onPress={handleImageUpload}
              className="absolute bottom-0 right-0 rounded-full border border-gray-200 bg-quinary p-2">
              <MaterialCommunityIcons name="pencil" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleImageUpload} className="mt-2">
            <AppText color="primary" size="sm" weight="medium">
              Change profile picture
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-6 px-4">
          {/* Name Field */}
          <View>
            <AppText weight="medium" className="mb-2">
              Name
            </AppText>
            <TextInput
              value={profile.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              className="border-b border-gray-300 py-2 text-base"
              placeholder="Your full name"
            />
          </View>

          {/* Username Field */}
          <View>
            <AppText weight="medium" className="mb-2">
              Username
            </AppText>
            <TextInput
              value={profile.username}
              onChangeText={(text) => handleChange('username', text)}
              className="border-b border-gray-300 py-2 text-base"
              placeholder="Username"
            />
          </View>

          {/* Bio Field */}
          <View>
            <AppText weight="medium" className="mb-2">
              Bio
            </AppText>
            <TextInput
              value={profile.bio}
              onChangeText={(text) => handleChange('bio', text)}
              className="border-b border-gray-300 py-2 text-base"
              placeholder="Tell the world about yourself"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Travel Style Field */}
          <View>
            <AppText weight="medium" className="mb-2">
              Travel Style
            </AppText>
            <TextInput
              value={profile.travelStyle}
              onChangeText={(text) => handleChange('travelStyle', text)}
              className="border-b border-gray-300 py-2 text-base"
              placeholder="Describe your travel style"
            />
          </View>

          {/* Account Status Section */}
          {userProfile?.ispremium && (
            <View className="mt-4 rounded-lg bg-blue-50 p-4">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
                <AppText weight="semibold" className="ml-2">
                  Premium Account
                </AppText>
              </View>
              <AppText size="sm" className="mt-1 text-gray-600">
                You have access to all premium features
              </AppText>
            </View>
          )}

          {userProfile?.issubscribed && (
            <View className="mt-2 rounded-lg bg-green-50 p-4">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="check-circle" size={24} color="#5BBFB5" />
                <AppText weight="semibold" className="ml-2">
                  Subscribed
                </AppText>
              </View>
              <AppText size="sm" className="mt-1 text-gray-600">
                You're subscribed to our newsletter
              </AppText>
            </View>
          )}

          {/* Save Button */}
          <View className="py-8">
            <Button
              title={isUpdating ? 'Saving...' : 'Save Changes'}
              onPress={handleSaveProfile}
              color="primary"
              className="w-full"
              disabled={isUpdating}
            />
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
