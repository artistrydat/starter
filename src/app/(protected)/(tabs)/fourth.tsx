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
import { useDestinations, tripKeys } from '@/src/hooks/destinationQueries';
import { useUserProfile, usePreferences } from '@/src/hooks/profileQueries';
import { sections } from '@/src/types/preferences';
import { AuthContext } from '@/src/utils/authContext';
import { queryClient } from '@/src/utils/queryClient';
import { useTripStore } from '@/store/tripStore';

// Default image to use when itinerary image is missing
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=3387&auto=format&fit=crop';

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

  // Fetch user profile using our consolidated hook
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  // Fetch user preferences using our consolidated hook
  const { data: preferences, isLoading: preferencesLoading } = usePreferences();

  // Fetch destinations (trips) using React Query hook
  const { isLoading: destinationsLoading } = useDestinations();

  // Get trip store for itineraries
  const { fetchUserItineraries, userItineraries } = useTripStore();

  useEffect(() => {
    // Fetch user itineraries when component mounts
    fetchUserItineraries();

    // Prefetch other data that might be needed
    queryClient.prefetchQuery({
      queryKey: tripKeys.favorites(),
    });
  }, [fetchUserItineraries]);

  // Loading state
  const isLoading = profileLoading || preferencesLoading || destinationsLoading;

  // Get user travel style from preferences
  const getUserTravelStyle = () => {
    if (!preferences || !preferences.travel_vibe || preferences.travel_vibe.length === 0) {
      return 'Not set';
    }

    // Map preference IDs to readable labels
    return preferences.travel_vibe
      .map((vibe) => {
        const option = sections.travel_vibe.options.find((opt) => opt.id === vibe);
        return option ? `${option.emoji} ${option.label}` : vibe;
      })
      .join(', ');
  };

  // Get user travel destinations/purposes from preferences
  const getUserTravelDestinations = () => {
    if (!preferences || !preferences.travel_purpose || preferences.travel_purpose.length === 0) {
      return 'Not set';
    }

    // Map preference IDs to readable labels
    return preferences.travel_purpose
      .map((purpose) => {
        const option = sections.travel_purpose.options.find((opt) => opt.id === purpose);
        return option ? `${option.emoji} ${option.label}` : purpose;
      })
      .join(', ');
  };

  // Get user budget preferences
  const getUserBudgetPreference = () => {
    if (!preferences || !preferences.budget) {
      return 'Not set';
    }

    const { style, amount } = preferences.budget;

    let styleText = '';
    if (style && style.length > 0) {
      styleText = style
        .map((s) => {
          const option = sections.budget.options.find((opt) => opt.id === s);
          return option ? `${option.emoji} ${option.label}` : s;
        })
        .join(', ');
    } else {
      // If no explicit style but we have amount, calculate from amount
      if (amount < 33) {
        styleText = '🪙 Budget';
      } else if (amount < 66) {
        styleText = '💵 Mid-Range';
      } else {
        styleText = '💎 Luxury';
      }
    }

    return styleText;
  };

  // Get travel companions preference
  const getTravelCompanions = () => {
    if (
      !preferences ||
      !preferences.travel_companion ||
      preferences.travel_companion.length === 0
    ) {
      return 'Not set';
    }

    return preferences.travel_companion
      .map((companion) => {
        const option = sections.travel_companion.options.find((opt) => opt.id === companion);
        return option ? `${option.emoji} ${option.label}` : companion;
      })
      .join(', ');
  };

  // Navigate to itinerary details
  const handleItineraryPress = (id: string) => {
    router.push(`/second/itinerary/${id}`);
  };

  // Navigate to preferences edit screen
  const handleEditPreferences = () => {
    router.push('/onboarding/preferences');
  };

  // Filter itineraries to display based on active tab
  const getFilteredItineraries = () => {
    if (!userItineraries) return [];

    if (activeTab === 'grid') {
      return userItineraries.filter((itinerary) => itinerary.is_private);
    } else if (activeTab === 'bookmarked') {
      return userItineraries.filter((itinerary) => itinerary.is_bookmarked);
    } else if (activeTab === 'favorite') {
      return userItineraries.filter((itinerary) => itinerary.is_favorite);
    }
    return [];
  };

  const filteredItineraries = getFilteredItineraries();

  if (isLoading || !userProfile) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5BBFB5" />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView className="flex-1 bg-quinary" showsVerticalScrollIndicator={false}>
        {/* Profile Header with Status Icons */}
        <View className="flex-row items-center justify-between px-4 py-2">
          <View className="flex-row items-center">
            <AppText size="xl" weight="bold">
              {userProfile.username || 'User'}
            </AppText>

            {/* Subscription Status */}
            <View className="ml-2 flex-row items-center">
              {userProfile.issubscribed && (
                <View className="mr-1">
                  <Ionicons name="checkmark-circle" size={16} color="#5BBFB5" />
                </View>
              )}

              {/* Premium Status */}
              {userProfile.ispremium && (
                <View className="mr-1">
                  <Ionicons name="star" size={16} color="#FFD700" />
                </View>
              )}

              {/* Follower Status */}
              {userProfile.isfollower && (
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
                {userProfile.credit} credits
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
              <Image
                source={{ uri: userProfile.avatar_url || 'https://i.pravatar.cc/300' }}
                className="h-full w-full"
              />
            </View>
          </View>

          {/* Stats */}
          <View className="flex-1 flex-row items-center justify-around">
            <ProfileStats label="Itineraries" value={userProfile.itineraryCount || 0} />
            <ProfileStats label="Followers" value={userProfile.followersCount || 0} />
            <ProfileStats label="Following" value={userProfile.followingCount || 0} />
          </View>
        </View>

        {/* Bio */}
        <View className="px-4 py-1">
          <AppText weight="semibold">{userProfile.full_name}</AppText>
          <AppText size="sm">{userProfile.bio || 'No bio yet'}</AppText>
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
              <AppText size="sm">
                <AppText weight="medium">Travel style:</AppText> {getUserTravelStyle()}
              </AppText>
              <AppText size="sm">
                <AppText weight="medium">Destinations:</AppText> {getUserTravelDestinations()}
              </AppText>
              <AppText size="sm">
                <AppText weight="medium">Budget:</AppText> {getUserBudgetPreference()}
              </AppText>
              <AppText size="sm">
                <AppText weight="medium">Travel with:</AppText> {getTravelCompanions()}
              </AppText>
              <TouchableOpacity
                className="mt-2 self-start rounded-md bg-primary px-3 py-1"
                onPress={handleEditPreferences}>
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

        {/* Photo Grid - Using real data based on active tab */}
        <View className="flex-row flex-wrap">
          {filteredItineraries.length > 0 ? (
            filteredItineraries.map((itinerary) => (
              <ProfileGridItem
                key={itinerary.id}
                imageUrl={itinerary.image_url || DEFAULT_IMAGE}
                title={itinerary.title}
                onPress={() => handleItineraryPress(itinerary.id)}
              />
            ))
          ) : (
            <View className="w-full items-center py-8">
              <AppText color="tertiary">
                {activeTab === 'grid'
                  ? 'No private itineraries yet'
                  : activeTab === 'bookmarked'
                    ? 'No bookmarked itineraries'
                    : 'No favorite itineraries'}
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}
