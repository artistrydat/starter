import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { PreferencesType, BudgetPreference } from '@/src/types/preferences';
import { ProfileUser } from '@/src/types/profiles';
import { supabase } from '@/src/utils/supabaseClient';
import { useTravelPreferencesStore } from '@/store/store';

// Query keys for profile-related queries
export const profileKeys = {
  all: ['profiles'] as const,
  user: () => [...profileKeys.all, 'user'] as const,
  detail: (userId: string) => [...profileKeys.user(), userId] as const,
  stats: (userId: string) => [...profileKeys.detail(userId), 'stats'] as const,
  lists: () => [...profileKeys.all, 'lists'] as const,
  followers: (userId: string) => [...profileKeys.lists(), 'followers', userId] as const,
  following: (userId: string) => [...profileKeys.lists(), 'following', userId] as const,
  itineraries: (userId: string) => [...profileKeys.lists(), 'itineraries', userId] as const,
  preferences: () => [...profileKeys.all, 'preferences'] as const,
  preferenceSection: (section: keyof PreferencesType) =>
    [...profileKeys.preferences(), section] as const,
};

// Hook for fetching user profile (with embedded preferences)
export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: profileKeys.detail(userId || 'current'),
    queryFn: async () => {
      try {
        // If no userId is provided, fetch the current user's profile
        if (!userId) {
          const { data: authData } = await supabase.auth.getSession();
          if (!authData.session?.user) {
            throw new Error('Not authenticated');
          }

          userId = authData.session.user.id;
        }

        // Fetch profile data from profiles table
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Error fetching profile:', userError.message);
          throw new Error(userError.message);
        }

        console.log('Profile data from Supabase:', userData);

        // Transform to match ProfileUser type - using the column names from DB
        const profileUser: ProfileUser = {
          id: userData.id,
          username: userData.username || '',
          full_name: userData.full_name || '',
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || '',
          travel_style: userData.travel_style || '',
          email: userData.email,
          phone: userData.phone,

          // Stats
          itineraryCount: userData.itineraryCount || 0,
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0,

          // Status flags
          issubscribed: userData.issubscribed || false,
          isfollowing: userData.isfollowing || false,
          isblocked: userData.isblocked || false,
          isfollower: userData.isfollower || false,
          credit: userData.credit || 0,
          ispremium: userData.ispremium || false,

          // Extract preferences for display
          preferences: userData.travel_preferences
            ? Object.values(userData.travel_preferences)
                .flat()
                .filter((item): item is string => typeof item === 'string')
            : [],

          // Timestamps
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          last_seen_at: userData.last_seen_at,
          onboarding_completed: userData.onboarding_completed || false,
          onboarding_completed_at: userData.onboarding_completed_at,
        };

        // Update the preferences store with the profile's travel preferences
        if (userData.travel_preferences) {
          useTravelPreferencesStore.setState({
            preferences: userData.travel_preferences as PreferencesType,
          });
        }

        return profileUser;
      } catch (error) {
        console.error('Profile fetch error:', error);
        // Return a default profile rather than throwing to avoid breaking the UI
        return {
          id: userId || 'unknown',
          username: 'User',
          full_name: '',
          bio: '',
          avatar_url: 'https://i.pravatar.cc/300',
          travel_style: '',
          itineraryCount: 0,
          followersCount: 0,
          followingCount: 0,
          issubscribed: false,
          isfollowing: false,
          isblocked: false,
          isfollower: false,
          credit: 0,
          ispremium: false,
          preferences: [],
        };
      }
    },
    enabled: true,
    // Set a retry policy that's more forgiving
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Hook for updating user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<ProfileUser>) => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) {
        throw new Error('Not authenticated');
      }

      const userId = authData.session.user.id;

      // Prepare data for update in the profiles table
      const profileUpdate: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      // Only include fields that exist in our database schema
      if (profileData.username !== undefined) profileUpdate.username = profileData.username;
      if (profileData.full_name !== undefined) profileUpdate.full_name = profileData.full_name;
      if (profileData.bio !== undefined) profileUpdate.bio = profileData.bio;
      if (profileData.avatar_url !== undefined) profileUpdate.avatar_url = profileData.avatar_url;
      if (profileData.travel_style !== undefined)
        profileUpdate.travel_style = profileData.travel_style;
      if (profileData.email !== undefined) profileUpdate.email = profileData.email;
      if (profileData.phone !== undefined) profileUpdate.phone = profileData.phone;

      const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return profileData;
    },
    onSuccess: async (data) => {
      // Get the current user's ID from the session
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData.session?.user?.id || 'current';

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(userId),
      });

      // Optimistic update
      queryClient.setQueryData(profileKeys.detail(userId), (oldData: ProfileUser | undefined) => {
        if (!oldData) return undefined;

        return {
          ...oldData,
          ...data,
        };
      });
    },
  });
}

// CONSOLIDATED PREFERENCES HOOKS

// Hook for fetching user preferences
export function usePreferences() {
  return useQuery({
    queryKey: profileKeys.preferences(),
    queryFn: async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        if (!authData.session?.user) {
          throw new Error('Not authenticated');
        }

        // Try to get preferences from the profile first
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('travel_preferences')
          .eq('id', authData.session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching preferences from profile:', userError.message);
          throw userError;
        }

        // If travel preferences exist in the profile, use them
        if (userData?.travel_preferences) {
          const preferences = userData.travel_preferences as PreferencesType;

          // Update the preferences store
          useTravelPreferencesStore.setState({ preferences });

          return preferences;
        }

        // Fallback to default preferences if none found
        return {
          travel_vibe: [],
          travel_companion: [],
          travel_purpose: [],
          budget: { amount: 50, style: [] },
          food_preferences: [],
          tech_preferences: [],
        } as PreferencesType;
      } catch (error) {
        console.error('Error fetching preferences:', error);

        // Return default preferences
        return {
          travel_vibe: [],
          travel_companion: [],
          travel_purpose: [],
          budget: { amount: 50, style: [] },
          food_preferences: [],
          tech_preferences: [],
        } as PreferencesType;
      }
    },
  });
}

// Hook for fetching a specific preference section
export function usePreferenceSection(section: keyof PreferencesType) {
  const { data: preferences } = usePreferences();

  return useQuery({
    queryKey: profileKeys.preferenceSection(section),
    queryFn: () => preferences?.[section],
    enabled: !!preferences,
    initialData: () => {
      const storePreferences = useTravelPreferencesStore.getState().preferences;
      return storePreferences[section];
    },
  });
}

// Hook for updating preferences
export function useUpdatePreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: keyof PreferencesType;
      values: string[] | BudgetPreference;
    }) => {
      const { type, values } = data;
      const { data: authData } = await supabase.auth.getSession();

      if (!authData.session?.user) {
        throw new Error('Not authenticated');
      }

      // Get current preferences from the store
      const currentPreferences = useTravelPreferencesStore.getState().preferences;

      // Create updated preferences object
      const updatedPreferences = {
        ...currentPreferences,
        [type]: values,
      };

      // Update in Zustand store first (optimistic)
      useTravelPreferencesStore.setState({
        preferences: updatedPreferences,
      });

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          travel_preferences: updatedPreferences,
        },
      });

      if (authError) {
        console.error('Error updating user metadata:', authError);
      }

      // Update in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          travel_preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.session.user.id);

      if (profileError) {
        console.error('Error updating profile preferences:', profileError);
        throw profileError;
      }

      return updatedPreferences;
    },
    onSuccess: (updatedPreferences, variables) => {
      // Update the preferences cache
      queryClient.setQueryData(profileKeys.preferences(), updatedPreferences);

      // Update the specific section
      queryClient.setQueryData(
        profileKeys.preferenceSection(variables.type),
        updatedPreferences[variables.type]
      );

      // Invalidate user profile to show updated preferences
      queryClient.invalidateQueries({
        queryKey: profileKeys.user(),
      });
    },
  });
}

// Hook for following/unfollowing a user
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      isFollowing,
    }: {
      targetUserId: string;
      isFollowing: boolean;
    }) => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) {
        throw new Error('Not authenticated');
      }

      const sourceUserId = authData.session.user.id;

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', sourceUserId)
          .eq('following_id', targetUserId);

        if (error) throw new Error(error.message);
      } else {
        // Follow
        const { error } = await supabase.from('user_follows').insert({
          follower_id: sourceUserId,
          following_id: targetUserId,
          created_at: new Date().toISOString(),
        });

        if (error) throw new Error(error.message);
      }

      return { targetUserId, isNowFollowing: !isFollowing };
    },
    onSuccess: async (data) => {
      // Invalidate the target user's profile
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(data.targetUserId),
      });

      // Invalidate followers/following lists
      const { data: authData } = await supabase.auth.getSession();
      const sourceUserId = authData.session?.user?.id || 'current';

      queryClient.invalidateQueries({
        queryKey: profileKeys.followers(data.targetUserId),
      });

      queryClient.invalidateQueries({
        queryKey: profileKeys.following(sourceUserId),
      });
    },
  });
}

// Hook for fetching user followers
export function useUserFollowers(userId: string) {
  return useQuery({
    queryKey: profileKeys.followers(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select('follower:follower_id(id, username, avatar_url)')
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return data.map((item) => item.follower);
    },
    enabled: !!userId,
  });
}

// Hook for fetching users the current user is following
export function useUserFollowing(userId: string) {
  return useQuery({
    queryKey: profileKeys.following(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following:following_id(id, username, avatar_url)')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return data.map((item) => item.following);
    },
    enabled: !!userId,
  });
}
