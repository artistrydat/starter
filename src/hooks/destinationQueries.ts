import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTripStore } from '../../store/tripStore';

import {
  TripItinerary,
  TripActivity,
  ActivityComment,
  ActivityVote,
  TripDay,
  TripWeather,
  WeatherOverview,
  TripWarning,
  TripTip,
  TripHighlight,
  VoteType,
  PermissionType,
} from '@/src/types/destinations';

// QueryKey factory
export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (filters: any) => [...tripKeys.lists(), { filters }] as const,
  details: () => [...tripKeys.all, 'detail'] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
  favorites: () => [...tripKeys.all, 'favorites'] as const,
  userItineraries: () => [...tripKeys.all, 'user-itineraries'] as const,
  sharedItineraries: () => [...tripKeys.all, 'shared-itineraries'] as const,
  itineraryComponents: {
    days: (itineraryId: string) => [...tripKeys.detail(itineraryId), 'days'] as const,
    activities: (dayId: string) => ['activities', dayId] as const,
    activityComments: (activityId: string) => ['activity-comments', activityId] as const,
    activityVotes: (activityId: string) => ['activity-votes', activityId] as const,
    weather: (itineraryId: string) => [...tripKeys.detail(itineraryId), 'weather'] as const,
    weatherOverview: (itineraryId: string) =>
      [...tripKeys.detail(itineraryId), 'weather-overview'] as const,
    warnings: (itineraryId: string) => [...tripKeys.detail(itineraryId), 'warnings'] as const,
    tips: (itineraryId: string) => [...tripKeys.detail(itineraryId), 'tips'] as const,
    highlights: (itineraryId: string) => [...tripKeys.detail(itineraryId), 'highlights'] as const,
    sharedUsers: (itineraryId: string) =>
      [...tripKeys.detail(itineraryId), 'shared-users'] as const,
  },
};

// This utility function is now used in the code
const queryHandler = async <T>({
  mockFn,
  realFn,
  useMock,
}: {
  mockFn: () => Promise<T>;
  realFn: () => Promise<T>;
  useMock: boolean;
}): Promise<T> => {
  return useMock ? await mockFn() : await realFn();
};
// The rest of the hooks can follow the same pattern as above
// Each hook gets the useMock value from the store and delegates
// the actual data fetching to the store methods, which handle
// the mock vs. real logic internally
// Hook for fetching destinations
export function useDestinations(category: string = 'all') {
  // Get the useMock flag from the Zustand store
  const store = useTripStore();
  const { fetchDestinations, useMock } = store;

  return useQuery({
    queryKey: tripKeys.list({ category }),
    queryFn: async () => {
      // Use the queryHandler to abstract the mock/real decision
      return await queryHandler({
        mockFn: async () => {
          await fetchDestinations(category);
          return useTripStore.getState().destinations;
        },
        realFn: async () => {
          await fetchDestinations(category);
          return useTripStore.getState().destinations;
        },
        useMock,
      });
    },
    staleTime: useMock ? Infinity : 5 * 60 * 1000, // 5 minutes for real data, infinite for mock
  });
}

// Hook for fetching a single itinerary
export function useItinerary(id: string) {
  const store = useTripStore();
  const { fetchItinerary, useMock } = store;

  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: async () => {
      return await queryHandler({
        mockFn: async () => fetchItinerary(id),
        realFn: async () => fetchItinerary(id),
        useMock,
      });
    },
    enabled: !!id,
  });
}

// Hook for creating a new itinerary
export function useCreateItinerary() {
  const { createItinerary, useMock } = useTripStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newItinerary: Omit<TripItinerary, 'id'>) => {
      return queryHandler({
        mockFn: async () => createItinerary(newItinerary),
        realFn: async () => createItinerary(newItinerary),
        useMock,
      });
    },
    onSuccess: () => {
      // Invalidate all trip queries to ensure up-to-date data
      queryClient.invalidateQueries({
        queryKey: tripKeys.all,
      });
    },
  });
}

// Hook for updating an existing itinerary
export function useUpdateItinerary() {
  const { updateItinerary, useMock } = useTripStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itinerary: TripItinerary) => {
      return queryHandler({
        mockFn: async () => updateItinerary(itinerary),
        realFn: async () => updateItinerary(itinerary),
        useMock,
      });
    },
    onSuccess: (data) => {
      // Invalidate the specific itinerary
      if (data) {
        queryClient.invalidateQueries({
          queryKey: tripKeys.detail(data.id),
        });
      }
      // Also invalidate the lists as they might display this itinerary
      queryClient.invalidateQueries({
        queryKey: tripKeys.lists(),
      });
    },
  });
}

// Hook for deleting an itinerary
export function useDeleteItinerary() {
  const { deleteItinerary, useMock } = useTripStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return queryHandler({
        mockFn: async () => deleteItinerary(id),
        realFn: async () => deleteItinerary(id),
        useMock,
      });
    },
    onSuccess: () => {
      // Invalidate all trip queries after deletion
      queryClient.invalidateQueries({
        queryKey: tripKeys.all,
      });
    },
  });
}

// Hook for fetching user itineraries
export function useUserItineraries() {
  const { fetchUserItineraries, useMock } = useTripStore();

  return useQuery({
    queryKey: tripKeys.userItineraries(),
    queryFn: async () => {
      await fetchUserItineraries();
      return useTripStore.getState().userItineraries;
    },
    staleTime: useMock ? Infinity : 5 * 60 * 1000,
  });
}

// Hook for fetching shared itineraries
export function useSharedItineraries() {
  const { fetchSharedItineraries, useMock } = useTripStore();

  return useQuery({
    queryKey: tripKeys.sharedItineraries(),
    queryFn: async () => {
      await fetchSharedItineraries();
      return useTripStore.getState().sharedItineraries;
    },
    staleTime: useMock ? Infinity : 5 * 60 * 1000,
  });
}

// Hook for fetching user favorites
export function useFavorites() {
  const { fetchFavorites, useMock } = useTripStore();

  return useQuery({
    queryKey: tripKeys.favorites(),
    queryFn: async () => {
      await fetchFavorites();
      return useTripStore.getState().favorites;
    },
    staleTime: useMock ? Infinity : 5 * 60 * 1000,
  });
}

// Hook for toggling favorites
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { toggleFavorite } = useTripStore();

  return useMutation({
    mutationFn: async (destinationId: string) => {
      await toggleFavorite(destinationId);
      return useTripStore.getState().favorites;
    },
    onSuccess: (newFavorites) => {
      // Update the favorites query data
      queryClient.setQueryData(tripKeys.favorites(), newFavorites);
    },
  });
}

// Hook for searching destinations
export function useSearchDestinations() {
  const { searchDestinations } = useTripStore();

  const search = async (query: string): Promise<TripItinerary[]> => {
    searchDestinations(query);
    return useTripStore.getState().searchResults;
  };

  return { search };
}

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
