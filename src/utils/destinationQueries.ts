import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  TripItinerary,
  TripDay,
  TripActivity,
  VoteType,
  TripWeather,
  WeatherOverview,
  TripWarning,
  TripTip,
  TripHighlight,
  PermissionType,
  ActivityComment,
  ActivityVote,
} from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';
import { useTripStore } from '@/store/tripStore';

// Central toggle for mock data - set to true to use mock data, false for real data
export const USE_MOCK_DATA = true;

// Query keys for better cache management
export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (filters: { category?: string }) => [...tripKeys.lists(), filters] as const,
  favorites: () => [...tripKeys.all, 'favorites'] as const,
  details: (id: string) => [...tripKeys.all, 'detail', id] as const,
  userItineraries: () => [...tripKeys.all, 'user-itineraries'] as const,
  sharedItineraries: () => [...tripKeys.all, 'shared-itineraries'] as const,
  itineraryComponents: {
    days: (itineraryId: string) => [...tripKeys.details(itineraryId), 'days'] as const,
    activities: (dayId: string) => ['activities', dayId] as const,
    activityComments: (activityId: string) => ['activity-comments', activityId] as const,
    activityVotes: (activityId: string) => ['activity-votes', activityId] as const,
    weather: (itineraryId: string) => [...tripKeys.details(itineraryId), 'weather'] as const,
    weatherOverview: (itineraryId: string) =>
      [...tripKeys.details(itineraryId), 'weather-overview'] as const,
    warnings: (itineraryId: string) => [...tripKeys.details(itineraryId), 'warnings'] as const,
    tips: (itineraryId: string) => [...tripKeys.details(itineraryId), 'tips'] as const,
    highlights: (itineraryId: string) => [...tripKeys.details(itineraryId), 'highlights'] as const,
    sharedUsers: (itineraryId: string) =>
      [...tripKeys.details(itineraryId), 'shared-users'] as const,
  },
};

// Create variation of mock data to simulate different destinations
const createMockDestinations = (): TripItinerary[] => {
  const cities = [
    { city: 'Paris', country: 'France', tags: ['romantic', 'historic', 'culinary'] },
    { city: 'Rome', country: 'Italy', tags: ['historic', 'culinary', 'ancient'] },
    { city: 'Barcelona', country: 'Spain', tags: ['beach', 'architecture', 'nightlife'] },
    { city: 'Tokyo', country: 'Japan', tags: ['modern', 'cultural', 'shopping'] },
    { city: 'New York', country: 'USA', tags: ['urban', 'multicultural', 'entertainment'] },
    { city: 'London', country: 'UK', tags: ['historic', 'multicultural', 'museums'] },
    { city: 'Sydney', country: 'Australia', tags: ['beach', 'outdoor', 'relaxing'] },
    { city: 'Dubai', country: 'UAE', tags: ['luxury', 'shopping', 'modern'] },
    { city: 'Amsterdam', country: 'Netherlands', tags: ['canal', 'cycling', 'museums'] },
    { city: 'Singapore', country: 'Singapore', tags: ['modern', 'food', 'clean'] },
  ];

  return cities.map((cityInfo, index) => ({
    ...mockItinerary,
    id: `mock-${index}`,
    title: `Exploring ${cityInfo.city}`,
    description: `A week-long adventure through ${cityInfo.city}`,
    city: cityInfo.city,
    location: cityInfo.country,
    tags: cityInfo.tags,
    // Add some variety to the images
    image_url: `https://source.unsplash.com/featured/?${cityInfo.city.toLowerCase()},travel`,
    // Randomize some attributes
    rating: 3.5 + Math.random() * 1.5, // Rating between 3.5 and 5.0
    total_cost: 800 + Math.floor(Math.random() * 1500), // Cost between 800 and 2300
    is_featured: index < 3, // First 3 are featured
  }));
};

// Cache mock destinations to avoid recreating them on every query
let cachedMockDestinations: TripItinerary[] | null = null;

// Hook for fetching destinations with toggle between mock and Zustand
export function useDestinations(useMockData: boolean = USE_MOCK_DATA, category: string = 'all') {
  const { fetchDestinations, destinations } = useTripStore();

  return useQuery({
    queryKey: tripKeys.list({ category }),
    queryFn: async () => {
      if (useMockData) {
        // Generate or use cached mock data
        if (!cachedMockDestinations) {
          cachedMockDestinations = createMockDestinations();
        }

        // Filter by category if needed
        if (category !== 'all') {
          return cachedMockDestinations.filter(
            (item) =>
              item.tags.some((tag) => tag.toLowerCase() === category.toLowerCase()) ||
              item.category?.toLowerCase() === category.toLowerCase()
          );
        }

        return cachedMockDestinations;
      }

      // Use the Zustand store's fetch function
      await fetchDestinations(category);
      return destinations;
    },
    enabled: !useMockData || category !== 'all', // Only refetch from API when category changes or when not using mock data
  });
}

// Hook for fetching a single itinerary by ID
export function useItinerary(id: string, useMockData: boolean = USE_MOCK_DATA) {
  const { fetchItinerary } = useTripStore();

  return useQuery({
    queryKey: tripKeys.details(id),
    queryFn: async () => {
      if (useMockData) {
        // Get or generate mock destinations
        if (!cachedMockDestinations) {
          cachedMockDestinations = createMockDestinations();
        }

        // Find the requested mock destination by ID
        const mockDestination = cachedMockDestinations.find((item) => item.id === id);
        return mockDestination || null;
      }

      // Use the Zustand store's fetch function
      const result = await fetchItinerary(id);
      return result;
    },
    enabled: id !== '',
  });
}

// Hook for fetching user itineraries
export function useUserItineraries(useMockData: boolean = USE_MOCK_DATA) {
  const { fetchUserItineraries, userItineraries } = useTripStore();

  return useQuery({
    queryKey: tripKeys.userItineraries(),
    queryFn: async () => {
      if (useMockData) {
        // For user itineraries, return a subset of destinations as "created by user"
        if (!cachedMockDestinations) {
          cachedMockDestinations = createMockDestinations();
        }

        // Return first 3 as user itineraries
        return cachedMockDestinations.slice(0, 3);
      }

      // Use the Zustand store's fetch function
      await fetchUserItineraries();
      return userItineraries;
    },
  });
}

// Hook for fetching shared itineraries
export function useSharedItineraries(useMockData: boolean = USE_MOCK_DATA) {
  const { fetchSharedItineraries, sharedItineraries } = useTripStore();

  return useQuery({
    queryKey: tripKeys.sharedItineraries(),
    queryFn: async () => {
      if (useMockData) {
        // For shared itineraries, return different subset
        if (!cachedMockDestinations) {
          cachedMockDestinations = createMockDestinations();
        }

        // Return itineraries 4-5 as shared with user
        return cachedMockDestinations.slice(3, 5);
      }

      // Use the Zustand store's fetch function
      await fetchSharedItineraries();
      return sharedItineraries;
    },
  });
}

// Hook for fetching user favorites
export function useFavorites(useMockData: boolean = USE_MOCK_DATA) {
  const { fetchFavorites, favorites } = useTripStore();

  return useQuery({
    queryKey: tripKeys.favorites(),
    queryFn: async () => {
      if (useMockData) {
        // Return mock favorites - IDs of every third mock destination
        return ['mock-1', 'mock-3', 'mock-5', 'mock-8'];
      }

      // Use the Zustand store's fetch function
      await fetchFavorites();
      return favorites;
    },
    enabled: !useMockData,
  });
}

// Hook for toggling favorites
export function useToggleFavorite(useMockData: boolean = USE_MOCK_DATA) {
  const queryClient = useQueryClient();
  const { toggleFavorite } = useTripStore();

  return useMutation({
    mutationFn: async (destinationId: string) => {
      if (useMockData) {
        // Simulate toggle with mock data
        const favorites = queryClient.getQueryData<string[]>(tripKeys.favorites()) || [];
        const isFavorited = favorites.includes(destinationId);

        // Return the updated favorites list
        return isFavorited
          ? favorites.filter((id) => id !== destinationId)
          : [...favorites, destinationId];
      }

      // Use the Zustand store's toggle function
      await toggleFavorite(destinationId);

      // Get updated favorites from the store
      return queryClient.getQueryData<string[]>(tripKeys.favorites()) || [];
    },
    onSuccess: (newFavorites) => {
      // Update the favorites query data
      queryClient.setQueryData(tripKeys.favorites(), newFavorites);
    },
  });
}

// Hook for searching destinations
export function useSearchDestinations(useMockData: boolean = USE_MOCK_DATA) {
  const { searchDestinations, searchResults } = useTripStore();

  const search = async (query: string): Promise<TripItinerary[]> => {
    if (!query.trim()) return [];

    if (useMockData) {
      // Search in cached mock data
      if (!cachedMockDestinations) {
        cachedMockDestinations = createMockDestinations();
      }

      const lowerQuery = query.toLowerCase();
      return cachedMockDestinations.filter(
        (dest) =>
          dest.title.toLowerCase().includes(lowerQuery) ||
          dest.location.toLowerCase().includes(lowerQuery) ||
          dest.city.toLowerCase().includes(lowerQuery) ||
          dest.description?.toLowerCase().includes(lowerQuery) ||
          dest.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Use the Zustand store's search function
    await searchDestinations(query);
    return searchResults;
  };

  return { search };
}

// Hook for creating a new itinerary
export function useCreateItinerary() {
  const queryClient = useQueryClient();
  const { createItinerary } = useTripStore();

  return useMutation({
    mutationFn: async (newItinerary: Omit<TripItinerary, 'id'>) => {
      return await createItinerary(newItinerary);
    },
    onSuccess: () => {
      // Invalidate user itineraries query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: tripKeys.userItineraries() });
    },
  });
}

// Hook for updating an existing itinerary
export function useUpdateItinerary() {
  const queryClient = useQueryClient();
  const { updateItinerary } = useTripStore();

  return useMutation({
    mutationFn: async (itinerary: TripItinerary) => {
      return await updateItinerary(itinerary);
    },
    onSuccess: (updatedItinerary) => {
      if (updatedItinerary) {
        // Update the itinerary in the cache
        queryClient.setQueryData(tripKeys.details(updatedItinerary.id), updatedItinerary);

        // Invalidate user itineraries list to reflect the changes
        queryClient.invalidateQueries({ queryKey: tripKeys.userItineraries() });
      }
    },
  });
}

// Hook for deleting an itinerary
export function useDeleteItinerary() {
  const queryClient = useQueryClient();
  const { deleteItinerary } = useTripStore();

  return useMutation({
    mutationFn: async (itineraryId: string) => {
      return await deleteItinerary(itineraryId);
    },
    onSuccess: (_, itineraryId) => {
      // Remove the itinerary from the cache
      queryClient.removeQueries({ queryKey: tripKeys.details(itineraryId) });

      // Invalidate user itineraries list to reflect the deletion
      queryClient.invalidateQueries({ queryKey: tripKeys.userItineraries() });
    },
  });
}

// --- New hooks for the consolidated itinerary components ---

// Hook for fetching trip days
export function useTripDays(itineraryId: string) {
  const { fetchDays } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.days(itineraryId),
    queryFn: async () => {
      return await fetchDays(itineraryId);
    },
    enabled: !!itineraryId,
  });
}

// Hook for fetching activities for a day
export function useDayActivities(dayId: string) {
  const { fetchActivities } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.activities(dayId),
    queryFn: async () => {
      return await fetchActivities(dayId);
    },
    enabled: !!dayId,
  });
}

// Hook for creating a new day
export function useCreateDay() {
  const queryClient = useQueryClient();
  const { createDay } = useTripStore();

  return useMutation({
    mutationFn: async (day: Omit<TripDay, 'id'>) => {
      return await createDay(day);
    },
    onSuccess: (newDay, variables) => {
      // Invalidate the days query for this itinerary
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.days(variables.itinerary_id),
      });
    },
  });
}

// Hook for updating a day
export function useUpdateDay() {
  const queryClient = useQueryClient();
  const { updateDay } = useTripStore();

  return useMutation({
    mutationFn: async (day: TripDay) => {
      return await updateDay(day);
    },
    onSuccess: (updatedDay) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.days(updatedDay.itinerary_id),
      });
    },
  });
}

// Hook for deleting a day
export function useDeleteDay() {
  const queryClient = useQueryClient();
  const { deleteDay } = useTripStore();

  return useMutation({
    mutationFn: async ({ dayId, itineraryId }: { dayId: string; itineraryId: string }) => {
      return await deleteDay(dayId);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.days(variables.itineraryId),
      });
    },
  });
}

// Hook for creating a new activity
export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { createActivity } = useTripStore();

  return useMutation({
    mutationFn: async (activity: Omit<TripActivity, 'id'>) => {
      return await createActivity(activity);
    },
    onSuccess: (newActivity) => {
      // Invalidate the activities query for this day
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activities(newActivity.day_id),
      });
    },
  });
}

// Hook for updating an activity
export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const { updateActivity } = useTripStore();

  return useMutation({
    mutationFn: async (activity: TripActivity) => {
      return await updateActivity(activity);
    },
    onSuccess: (updatedActivity) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activities(updatedActivity.day_id),
      });
    },
  });
}

// Hook for deleting an activity
export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { deleteActivity } = useTripStore();

  return useMutation({
    mutationFn: async ({ dayId, activityId }: { dayId: string; activityId: string }) => {
      return await deleteActivity(dayId, activityId);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activities(variables.dayId),
      });
    },
  });
}

// Hook for adding a comment to an activity
export function useAddActivityComment() {
  const queryClient = useQueryClient();
  const { addActivityComment } = useTripStore();

  return useMutation({
    mutationFn: async ({
      activityId,
      comment,
      dayId,
    }: {
      activityId: string;
      comment: string;
      dayId: string;
    }) => {
      return await addActivityComment(activityId, comment);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activities(variables.dayId),
      });
    },
  });
}

// Hook for adding a vote to an activity
export function useAddActivityVote() {
  const queryClient = useQueryClient();
  const { addActivityVote } = useTripStore();

  return useMutation({
    mutationFn: async ({
      activityId,
      voteType,
      dayId,
    }: {
      activityId: string;
      voteType: VoteType;
      dayId: string;
    }) => {
      return await addActivityVote(activityId, voteType);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activities(variables.dayId),
      });
    },
  });
}

// Hook for fetching weather data
export function useWeatherData(itineraryId: string) {
  const { fetchWeather } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.weather(itineraryId),
    queryFn: async () => {
      await fetchWeather(itineraryId);
      return useTripStore.getState().currentItinerary?.weather || [];
    },
    enabled: !!itineraryId,
  });
}

// Hook for fetching weather overview
export function useWeatherOverview(itineraryId: string) {
  const { fetchWeatherOverview } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.weatherOverview(itineraryId),
    queryFn: async () => {
      await fetchWeatherOverview(itineraryId);
      return useTripStore.getState().currentItinerary?.weather_overview || null;
    },
    enabled: !!itineraryId,
  });
}

// Hook for updating weather data
export function useUpdateWeather() {
  const queryClient = useQueryClient();
  const { updateWeather } = useTripStore();

  return useMutation({
    mutationFn: async ({
      dailyWeather,
      itineraryId,
    }: {
      dailyWeather: TripWeather[];
      itineraryId: string;
    }) => {
      await updateWeather(dailyWeather);
      return dailyWeather;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.weather(variables.itineraryId),
      });
    },
  });
}

// Hook for updating weather overview
export function useUpdateWeatherOverview() {
  const queryClient = useQueryClient();
  const { updateWeatherOverview } = useTripStore();

  return useMutation({
    mutationFn: async ({
      overview,
      itineraryId,
    }: {
      overview: WeatherOverview;
      itineraryId: string;
    }) => {
      await updateWeatherOverview(overview);
      return overview;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.weatherOverview(variables.itineraryId),
      });
    },
  });
}

// Hook for fetching trip warnings
export function useTripWarnings(itineraryId: string) {
  const { fetchWarnings } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.warnings(itineraryId),
    queryFn: async () => {
      await fetchWarnings(itineraryId);
      return useTripStore.getState().currentItinerary?.warnings || [];
    },
    enabled: !!itineraryId,
  });
}

// Hook for updating warnings
export function useUpdateWarnings() {
  const queryClient = useQueryClient();
  const { updateWarnings } = useTripStore();

  return useMutation({
    mutationFn: async ({
      warnings,
      itineraryId,
    }: {
      warnings: TripWarning[];
      itineraryId: string;
    }) => {
      await updateWarnings(warnings);
      return warnings;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.warnings(variables.itineraryId),
      });
    },
  });
}

// Hook for fetching trip tips
export function useTripTips(itineraryId: string) {
  const { fetchTips } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.tips(itineraryId),
    queryFn: async () => {
      await fetchTips(itineraryId);
      return useTripStore.getState().currentItinerary?.general_tips || [];
    },
    enabled: !!itineraryId,
  });
}

// Hook for updating tips
export function useUpdateTips() {
  const queryClient = useQueryClient();
  const { updateTips } = useTripStore();

  return useMutation({
    mutationFn: async ({ tips, itineraryId }: { tips: TripTip[]; itineraryId: string }) => {
      await updateTips(tips);
      return tips;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.tips(variables.itineraryId),
      });
    },
  });
}

// Hook for fetching trip highlights
export function useTripHighlights(itineraryId: string) {
  const { fetchHighlights } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.highlights(itineraryId),
    queryFn: async () => {
      await fetchHighlights(itineraryId);
      return useTripStore.getState().currentItinerary?.trip_highlights || [];
    },
    enabled: !!itineraryId,
  });
}

// Hook for updating highlights
export function useUpdateHighlights() {
  const queryClient = useQueryClient();
  const { updateHighlights } = useTripStore();

  return useMutation({
    mutationFn: async ({
      highlights,
      itineraryId,
    }: {
      highlights: TripHighlight[];
      itineraryId: string;
    }) => {
      await updateHighlights(highlights);
      return highlights;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.highlights(variables.itineraryId),
      });
    },
  });
}

// Hook for fetching shared users
export function useSharedUsers(itineraryId: string) {
  const { fetchSharedUsers } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.sharedUsers(itineraryId),
    queryFn: async () => {
      await fetchSharedUsers(itineraryId);
      return useTripStore.getState().currentItinerary?.shared_users || [];
    },
    enabled: !!itineraryId,
  });
}

// Hook for sharing an itinerary
export function useShareItinerary() {
  const queryClient = useQueryClient();
  const { shareItinerary } = useTripStore();

  return useMutation({
    mutationFn: async ({
      itineraryId,
      email,
      permission,
    }: {
      itineraryId: string;
      email: string;
      permission: PermissionType;
    }) => {
      await shareItinerary(itineraryId, email, permission);
      return useTripStore.getState().currentItinerary?.shared_users || [];
    },
    onSuccess: (_, variables) => {
      // Invalidate shared users query
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.sharedUsers(variables.itineraryId),
      });
    },
  });
}

// Hook for removing a shared user
export function useRemoveSharedUser() {
  const queryClient = useQueryClient();
  const { removeSharedUser } = useTripStore();

  return useMutation({
    mutationFn: async ({ sharedId, itineraryId }: { sharedId: string; itineraryId: string }) => {
      await removeSharedUser(sharedId);
      return useTripStore.getState().currentItinerary?.shared_users || [];
    },
    onSuccess: (_, variables) => {
      // Invalidate shared users query
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.sharedUsers(variables.itineraryId),
      });
    },
  });
}

// Hook for fetching comments for an activity
export function useActivityComments(activityId: string) {
  const { currentItinerary } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.activityComments(activityId),
    queryFn: async () => {
      // Find the activity in the current itinerary
      let comments: ActivityComment[] = [];
      if (currentItinerary) {
        for (const day of currentItinerary.days || []) {
          const activity = day.activities.find((a) => a.id === activityId);
          if (activity) {
            comments = activity.ActivityComment || [];
            break;
          }
        }
      }
      return comments;
    },
    enabled: !!activityId && !!currentItinerary,
  });
}

// Hook for deleting a comment from an activity
export function useDeleteActivityComment() {
  const queryClient = useQueryClient();
  const { currentItinerary, setCurrentItinerary } = useTripStore();

  return useMutation({
    mutationFn: async ({
      activityId,
      commentId,
      dayId,
    }: {
      activityId: string;
      commentId: string;
      dayId: string;
    }) => {
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Find the day and activity, then remove the comment
      const updatedDays =
        currentItinerary.days?.map((d) => {
          if (d.id === dayId) {
            return {
              ...d,
              activities:
                d.activities?.map((a) => {
                  if (a.id === activityId) {
                    return {
                      ...a,
                      ActivityComment: (a.ActivityComment || []).filter((c) => c.id !== commentId),
                    };
                  }
                  return a;
                }) || [],
            };
          }
          return d;
        }) || [];

      // Update the itinerary
      setCurrentItinerary({
        ...currentItinerary,
        days: updatedDays,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activityComments(variables.activityId),
      });
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activities(variables.dayId),
      });
    },
  });
}

// Hook for fetching votes for an activity
export function useActivityVotes(activityId: string) {
  const { currentItinerary } = useTripStore();

  return useQuery({
    queryKey: tripKeys.itineraryComponents.activityVotes(activityId),
    queryFn: async () => {
      // Find the activity in the current itinerary
      let votes: ActivityVote[] = [];
      if (currentItinerary) {
        for (const day of currentItinerary.days || []) {
          const activity = day.activities.find((a) => a.id === activityId);
          if (activity) {
            votes = activity.votes || [];
            break;
          }
        }
      }
      return votes;
    },
    enabled: !!activityId && !!currentItinerary,
  });
}

// Hook for deleting a vote from an activity
export function useDeleteActivityVote() {
  const queryClient = useQueryClient();
  const { currentItinerary, setCurrentItinerary } = useTripStore();

  return useMutation({
    mutationFn: async ({
      activityId,
      voteId,
      dayId,
    }: {
      activityId: string;
      voteId: string;
      dayId: string;
    }) => {
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Find the day and activity, then remove the vote
      const updatedDays =
        currentItinerary.days?.map((d) => {
          if (d.id === dayId) {
            return {
              ...d,
              activities:
                d.activities?.map((a) => {
                  if (a.id === activityId) {
                    return {
                      ...a,
                      votes: (a.votes || []).filter((v) => v.id !== voteId),
                    };
                  }
                  return a;
                }) || [],
            };
          }
          return d;
        }) || [];

      // Update the itinerary
      setCurrentItinerary({
        ...currentItinerary,
        days: updatedDays,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activityVotes(variables.activityId),
      });
      queryClient.invalidateQueries({
        queryKey: tripKeys.itineraryComponents.activities(variables.dayId),
      });
    },
  });
}
