import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Pressable,
} from 'react-native';

import { AppText, Container } from '@/src/components/ui';
import { sections } from '@/src/types/preferences';
import { ProfileUser } from '@/src/types/profiles';
import { AuthContext } from '@/src/utils/authContext';
import { mockItineraries } from '@/src/utils/mockItinerary';
import { useTravelPreferencesStore } from '@/store/store';

// Default image to use when itinerary image is missing
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=3387&auto=format&fit=crop';

// Enhanced mock profile data to match ProfileUser type
const PROFILE_DATA: ProfileUser = {
  id: 'user-123',
  username: 'moaalmusfer',
  fullName: 'Mosa Alexander',
  bio: 'Travel enthusiast | Adventure seeker ✈️',
  avatarUrl: 'https://source.unsplash.com/random/200x200?portrait',
  stats: {
    itineraryCount: 23,
    followersCount: 486,
    followingCount: 263,
    issubscribed: true,
    isfollowing: false,
    isblocked: false,
    isfollower: true,
    credit: 750,
    ispremium: true,
  },
  preferences: ['nature', 'culture', 'photography'],
  travelStyle: 'Adventure seeker',
};

const ProfileStats = ({ label, value }: { label: string; value: number | string }) => (
  <View className="items-center">
    <AppText weight="bold" size="lg">
      {value}
    </AppText>
    <AppText size="sm" color="text">
      {label}
    </AppText>
  </View>
);

const ProfileGridItem = ({
  imageUrl,
  title,
  onPress,
}: {
  imageUrl: string;
  title: string;
  onPress?: () => void;
}) => (
  <Pressable className="m-0.5 aspect-square flex-1" onPress={onPress}>
    <ImageBackground source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover">
      <View className="absolute left-0 right-0 top-0 bg-black/50 p-1">
        <AppText size="xs" color="white" numberOfLines={1}>
          {title}
        </AppText>
      </View>
    </ImageBackground>
  </Pressable>
);

export default function FourthScreen() {
  const router = useRouter();
  const authState = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('grid');

  // Use PROFILE_DATA as the userProfile
  const userProfile = PROFILE_DATA;

  const {
    preferences,
    isLoading: preferencesLoading,
    fetchPreferences,
  } = useTravelPreferencesStore();

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Get user travel style from preferences
  const getUserTravelStyle = () => {
    const travelVibes = preferences.travel_vibe || [];
    if (travelVibes.length === 0) return 'Not set';

    // Map preference IDs to readable labels
    return travelVibes
      .map((vibe) => {
        const option = sections.travel_vibe.options.find((opt) => opt.id === vibe);
        return option ? `${option.emoji} ${option.label}` : vibe;
      })
      .join(', ');
  };

  // Get user travel destinations from preferences
  const getUserTravelDestinations = () => {
    const travelPurposes = preferences.travel_purpose || [];
    if (travelPurposes.length === 0) return 'Not set';

    // Map preference IDs to readable labels
    return travelPurposes
      .map((purpose) => {
        const option = sections.travel_purpose.options.find((opt) => opt.id === purpose);
        return option ? `${option.emoji} ${option.label}` : purpose;
      })
      .join(', ');
  };

  // Navigate to itinerary details
  const handleItineraryPress = (id: string) => {
    router.push(`/second/itinerary/${id}`);
  };

  // Filter itineraries to display only private itineraries
  const privateItineraries = mockItineraries.filter(
    (itinerary) => itinerary.is_private && itinerary.user_id === userProfile.id
  );

  // Get bookmarked itineraries
  const bookmarkedItineraries = mockItineraries.filter((itinerary) => itinerary.is_bookmarked);

  // Get favorite itineraries
  const favoriteItineraries = mockItineraries.filter((itinerary) => itinerary.is_favorite);

  return (
    <Container>
      <ScrollView className="flex-1 bg-quinary" showsVerticalScrollIndicator={false}>
        {/* Profile Header with Status Icons */}
        <View className="flex-row items-center justify-between px-4 py-2">
          <View className="flex-row items-center">
            <AppText size="xl" weight="bold">
              {userProfile.username}
            </AppText>

            {/* Subscription Status */}
            <View className="ml-2 flex-row items-center">
              {userProfile.stats.issubscribed && (
                <View className="mr-1">
                  <Ionicons name="checkmark-circle" size={16} color="#5BBFB5" />
                </View>
              )}

              {/* Premium Status */}
              {userProfile.stats.ispremium && (
                <View className="mr-1">
                  <Ionicons name="star" size={16} color="#FFD700" />
                </View>
              )}

              {/* Follower Status */}
              {userProfile.stats.isfollower && (
                <View className="mr-1">
                  <Ionicons name="people" size={16} color="#FF9D76" />
                </View>
              )}
            </View>
          </View>

          {/* Credits Badge */}
          <View className="flex-row items-center">
            <View className="mr-3 flex-row items-center rounded-full bg-tertiary px-2 py-0.5">
              <Ionicons name="wallet-outline" size={14} color="#3A464F" />
              <AppText size="xs" weight="medium" className="ml-1">
                {userProfile.stats.credit} credits
              </AppText>
            </View>

            {/* Logout & Menu */}
            <TouchableOpacity onPress={authState.logOut} className="mr-2">
              <Ionicons name="log-out-outline" size={22} color="#3A464F" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="menu-outline" size={24} color="#3A464F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Section */}
        <View className="flex-row px-4 py-2">
          {/* Profile Image */}
          <View className="mr-6 items-center justify-center">
            <View className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary bg-gray-200">
              <Image source={{ uri: userProfile.avatarUrl }} className="h-full w-full" />
            </View>
          </View>

          {/* Stats */}
          <View className="flex-1 flex-row items-center justify-around">
            <ProfileStats label="Itineraries" value={userProfile.stats.itineraryCount} />
            <ProfileStats label="Followers" value={userProfile.stats.followersCount} />
            <ProfileStats label="Following" value={userProfile.stats.followingCount} />
          </View>
        </View>

        {/* Bio */}
        <View className="px-4 py-1">
          <AppText weight="semibold">{userProfile.fullName}</AppText>
          <AppText size="sm">{userProfile.bio}</AppText>
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-4 py-2">
          <TouchableOpacity
            className="mr-1 flex-1 rounded-md bg-tertiary py-1"
            onPress={() => router.push('/profile/ProfileEdit')}>
            <AppText size="sm" align="center" weight="medium">
              Edit Profile
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            className="ml-1 flex-1 rounded-md bg-tertiary py-1"
            onPress={() => router.push('/profile/ProfileShare')}>
            <AppText size="sm" align="center" weight="medium">
              Share Profile
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Travel Preferences Section */}
        <View className="mt-4 bg-tertiary px-4 py-2">
          <AppText weight="semibold" size="lg">
            Travel Preferences
          </AppText>

          {preferencesLoading ? (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : (
            <View className="py-2">
              <AppText size="sm">Your travel style: {getUserTravelStyle()}</AppText>
              <AppText size="sm">Favorite destinations: {getUserTravelDestinations()}</AppText>
              <TouchableOpacity
                className="mt-2 self-start rounded-md bg-primary px-3 py-1"
                onPress={() => router.push('/onboarding/preferences')}>
                <AppText size="sm" color="white" weight="medium">
                  Edit Preferences
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View className="mt-4 flex-row border-t border-gray-200">
          <TouchableOpacity
            className={`flex-1 items-center py-2 ${activeTab === 'grid' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('grid')}>
            <Ionicons
              name="grid-outline"
              size={24}
              color={activeTab === 'grid' ? '#5BBFB5' : '#3A464F'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 ${activeTab === 'bookmarked' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('bookmarked')}>
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={activeTab === 'bookmarked' ? '#5BBFB5' : '#3A464F'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center py-2 ${activeTab === 'favorite' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('favorite')}>
            <Ionicons
              name="heart-outline"
              size={24}
              color={activeTab === 'favorite' ? '#5BBFB5' : '#3A464F'}
            />
          </TouchableOpacity>
        </View>

        {/* Photo Grid - Using mockItineraries based on active tab */}
        <View className="flex-row flex-wrap">
          {activeTab === 'grid' && privateItineraries.length > 0 ? (
            privateItineraries.map((itinerary) => (
              <ProfileGridItem
                key={itinerary.id}
                imageUrl={itinerary.image_url || DEFAULT_IMAGE}
                title={itinerary.title}
                onPress={() => handleItineraryPress(itinerary.id)}
              />
            ))
          ) : activeTab === 'grid' ? (
            <View className="w-full items-center py-8">
              <AppText color="tertiary">No private itineraries yet</AppText>
            </View>
          ) : activeTab === 'bookmarked' && bookmarkedItineraries.length > 0 ? (
            // Bookmarked tab content with consistent styling
            bookmarkedItineraries.map((itinerary) => (
              <ProfileGridItem
                key={itinerary.id}
                imageUrl={itinerary.image_url || DEFAULT_IMAGE}
                title={itinerary.title}
                onPress={() => handleItineraryPress(itinerary.id)}
              />
            ))
          ) : activeTab === 'bookmarked' ? (
            <View className="w-full items-center py-8">
              <AppText color="tertiary">No bookmarked itineraries</AppText>
            </View>
          ) : activeTab === 'favorite' && favoriteItineraries.length > 0 ? (
            // Favorite tab content with consistent styling
            favoriteItineraries.map((itinerary) => (
              <ProfileGridItem
                key={itinerary.id}
                imageUrl={itinerary.image_url || DEFAULT_IMAGE}
                title={itinerary.title}
                onPress={() => handleItineraryPress(itinerary.id)}
              />
            ))
          ) : (
            <View className="w-full items-center py-8">
              <AppText color="tertiary">No favorite itineraries</AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}
