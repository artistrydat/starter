import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';

import { AppText, Button, Container } from '@/src/components/ui';

export default function ProfileEdit() {
  const [profile, setProfile] = useState({
    fullName: 'Moa Almusfer',
    username: 'moaalmusfer',
    pronouns: '',
    bio: '',
    gender: '',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  });

  // Handle text input changes
  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Placeholder function for updating profile
  const handleSaveProfile = () => {
    console.log('Profile updated:', profile);
    router.back();
  };

  // Placeholder function for image upload
  const handleImageUpload = () => {
    console.log('Image upload pressed');
    // Would typically show image picker here and then update the profile state
    setProfile((prev) => ({
      ...prev,
      avatarUrl: 'https://randomuser.me/api/portraits/men/33.jpg', // Example of changing avatar
    }));
  };

  return (
    <Container>
      <ScrollView className="flex-1">
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
              Edit picture or avatar
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

          {/* Pronouns Field */}
          <View>
            <AppText weight="medium" className="mb-2">
              Pronouns
            </AppText>
            <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <TextInput
                value={profile.pronouns}
                onChangeText={(text) => handleChange('pronouns', text)}
                className="flex-1 text-base"
                placeholder="Add pronouns"
              />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Bio Field */}
          <View>
            <AppText weight="medium" className="mb-2">
              Bio
            </AppText>
            <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <TextInput
                value={profile.bio}
                onChangeText={(text) => handleChange('bio', text)}
                className="flex-1 text-base"
                placeholder="Add bio"
                multiline
              />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Links Section */}
          <View>
            <AppText weight="medium" className="mb-2">
              Links
            </AppText>
            <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <AppText className="text-gray-500">Add links</AppText>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Banners Section */}
          <View>
            <AppText weight="medium" className="mb-2">
              Banners
            </AppText>
            <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <AppText className="text-gray-500">Add banners</AppText>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Music Section */}
          <View>
            <AppText weight="medium" className="mb-2">
              Music
            </AppText>
            <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <AppText className="text-gray-500">Add music to your profile</AppText>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Gender Section */}
          <View>
            <AppText weight="medium" className="mb-2">
              Gender
            </AppText>
            <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <AppText className="text-gray-500">Gender</AppText>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Additional Options */}
          <View className="space-y-4 pt-4">
            <TouchableOpacity>
              <AppText color="primary" className="py-2">
                Switch to professional account
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity>
              <AppText color="primary" className="py-2">
                Personal information settings
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity>
              <AppText color="primary" className="py-2">
                Show your profile is verified
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <View className="py-8">
            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              color="primary"
              className="w-full"
            />
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
