import { create } from 'zustand';

import {
  ActivityComment,
  ActivityVote,
  SharedUser,
  TripActivity,
  TripItinerary,
  TripDay,
  TripWeather,
  TripHighlight,
  TripTip,
  PackingItem,
  TripWarning,
} from '@/src/types/destinations';
import { supabase } from '@/src/utils/supabaseClient';

interface ItineraryState {
  // Current loaded itinerary
  currentItinerary: TripItinerary | null;
  isLoading: boolean;
  error: string | null;

  // Itineraries list
  userItineraries: TripItinerary[];
  sharedItineraries: TripItinerary[];

  // Actions
  fetchItinerary: (itineraryId: string) => Promise<TripItinerary | null>;
  fetchUserItineraries: () => Promise<void>;
  fetchSharedItineraries: () => Promise<void>;

  // CRUD operations
  createItinerary: (itinerary: Omit<TripItinerary, 'id'>) => Promise<TripItinerary | null>;
  updateItinerary: (itinerary: TripItinerary) => Promise<TripItinerary | null>;
  deleteItinerary: (itineraryId: string) => Promise<boolean>;

  // Activity operations
  addActivity: (dayId: string, activity: Omit<TripActivity, 'id'>) => Promise<boolean>;
  updateActivity: (dayId: string, activity: TripActivity) => Promise<boolean>;
  deleteActivity: (dayId: string, activityId: string) => Promise<boolean>;

  // Sharing
  shareItinerary: (
    itineraryId: string,
    userEmail: string,
    permission: 'view' | 'edit'
  ) => Promise<SharedUser | null>;
  removeSharedUser: (itineraryId: string, userId: string) => Promise<boolean>;

  // Activity interactions
  voteActivity: (activityId: string, voteType: 'upvote' | 'downvote') => Promise<boolean>;
  removeVote: (activityId: string) => Promise<boolean>;
  addComment: (activityId: string, comment: string) => Promise<ActivityComment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  currentItinerary: null,
  isLoading: false,
  error: null,
  userItineraries: [],
  sharedItineraries: [],

  fetchItinerary: async (itineraryId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Get the basic itinerary data
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('trip_itineraries')
        .select('*')
        .eq('id', itineraryId)
        .single();

      if (itineraryError) throw itineraryError;

      // Get days and activities
      const { data: daysData, error: daysError } = await supabase
        .from('trip_days')
        .select('*, trip_activities(*)')
        .eq('itinerary_id', itineraryId)
        .order('day_number', { ascending: true });

      if (daysError) throw daysError;

      // Get weather data
      const { data: weatherData, error: weatherError } = await supabase
        .from('trip_weather')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .order('day_number', { ascending: true });

      if (weatherError) throw weatherError;

      // Get weather overview
      const { data: weatherOverviewData, error: weatherOverviewError } = await supabase
        .from('trip_weather_overview')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .single();

      // Get trip highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('trip_highlights')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (highlightsError) throw highlightsError;

      // Get trip tips
      const { data: tipsData, error: tipsError } = await supabase
        .from('trip_tips')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (tipsError) throw tipsError;

      // Get packing items
      const { data: packingData, error: packingError } = await supabase
        .from('packing_items')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (packingError) throw packingError;

      // Get warnings
      const { data: warningsData, error: warningsError } = await supabase
        .from('trip_warnings')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (warningsError) throw warningsError;

      // Get shared users
      const { data: sharedUsersData, error: sharedUsersError } = await supabase
        .from('shared_itineraries')
        .select('*')
        .eq('itinerary_id', itineraryId);

      if (sharedUsersError) throw sharedUsersError;

      // For each activity, get votes and comments
      const days: TripDay[] = await Promise.all(
        daysData.map(async (day) => {
          const activities = await Promise.all(
            day.trip_activities.map(async (activity: any) => {
              // Get votes for activity
              const { data: votesData, error: votesError } = await supabase
                .from('activity_votes')
                .select('*')
                .eq('activity_id', activity.id);

              if (votesError) throw votesError;

              // Get comments for activity
              const { data: commentsData, error: commentsError } = await supabase
                .from('activity_comments')
                .select('*, profiles:user_id(display_name)')
                .eq('activity_id', activity.id);

              if (commentsError) throw commentsError;

              // Process comments to include user names
              const processedComments = commentsData.map((comment: any) => ({
                id: comment.id,
                user_id: comment.user_id,
                activity_id: comment.activity_id,
                comment: comment.comment,
                created_at: comment.created_at,
                user_name: comment.profiles?.display_name || 'Anonymous User',
              }));

              return {
                id: activity.id,
                name: activity.name,
                time: activity.time,
                description: activity.description,
                location: activity.location,
                imageUrl: activity.image_url,
                cost: activity.cost,
                currency: activity.currency,
                category: activity.category,
                icon: activity.icon,
                votes: votesData,
                comments: processedComments,
              } as TripActivity;
            })
          );

          return {
            id: day.id,
            day: day.day_number,
            date: day.date,
            activities,
          } as TripDay;
        })
      );

      // Format weather data
      const weather: TripWeather[] = weatherData.map((w) => ({
        day: w.day_number,
        date: w.date,
        condition: w.condition,
        highTemp: w.high_temp,
        lowTemp: w.low_temp,
        icon: w.icon,
      }));

      // Build the complete itinerary
      const completeItinerary: TripItinerary = {
        id: itineraryData.id,
        title: itineraryData.title,
        destination: itineraryData.destination,
        description: itineraryData.description,
        imageUrl: itineraryData.image_url,
        totalCost: itineraryData.total_cost,
        currency: itineraryData.currency,
        user_id: itineraryData.user_id,
        days,
        weather,
        weather_overview: weatherOverviewData
          ? {
              description: weatherOverviewData.description,
              recommendations: weatherOverviewData.recommendations,
            }
          : { description: '', recommendations: [] },
        trip_highlights: highlightsData,
        general_tips: tipsData,
        packing_recommendation: packingData,
        warnings: warningsData,
        shared_users: sharedUsersData,
      };

      set({ currentItinerary: completeItinerary });
      return completeItinerary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch itinerary';
      set({ error: errorMessage });
      console.error('Itinerary fetch error:', errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserItineraries: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching itineraries for user ID:', session.user.id);

      const { data, error } = await supabase
        .from('trip_itineraries')
        .select('*') // Remove join with global_destination
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      // Transform the data to match the expected format in the app
      const formattedData = data.map((itinerary) => ({
        ...itinerary,
        id: itinerary.id,
        title: itinerary.title,
        destination: itinerary.destination,
        description: itinerary.description,
        imageUrl: itinerary.image_url,
        totalCost: itinerary.total_cost,
        currency: itinerary.currency,
        user_id: itinerary.user_id,
        destination_name: itinerary.destination, // For display in the TravelCard
        start_date: itinerary.start_date,
        end_date: itinerary.end_date,
        tags: itinerary.tags || [],
      }));

      console.log('Fetched itineraries count:', formattedData.length);
      set({ userItineraries: formattedData });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch itineraries for user';
      set({ error: errorMessage });
      console.error('Itinerary fetch error:', errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSharedItineraries: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shared_itineraries')
        .select('itinerary_id, trip_itineraries(*)')
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Extract the itineraries from the joined data
      const sharedItineraries = data.map((item) => item.trip_itineraries) as TripItinerary[];
      set({ sharedItineraries });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch shared itineraries';
      set({ error: errorMessage });
      console.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  createItinerary: async (itinerary) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Create the base itinerary record
      const itineraryData = {
        title: itinerary.title,
        destination: itinerary.destination,
        description: itinerary.description,
        image_url: itinerary.imageUrl,
        total_cost: itinerary.totalCost,
        currency: itinerary.currency,
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('trip_itineraries')
        .insert(itineraryData)
        .select()
        .single();

      if (error) throw error;

      const newItineraryId = data.id;

      // Create days if included
      if (itinerary.days && itinerary.days.length > 0) {
        const daysData = itinerary.days.map((day, index) => ({
          itinerary_id: newItineraryId,
          day_number: day.day,
          date: day.date,
        }));

        const { data: daysResult, error: daysError } = await supabase
          .from('trip_days')
          .insert(daysData)
          .select();

        if (daysError) throw daysError;

        // Create activities for each day
        for (let i = 0; i < daysResult.length; i++) {
          const dayId = daysResult[i].id;
          const dayActivities = itinerary.days[i].activities;

          if (dayActivities && dayActivities.length > 0) {
            const activitiesData = dayActivities.map((activity) => ({
              day_id: dayId,
              name: activity.name,
              time: activity.time,
              description: activity.description,
              location: activity.location,
              image_url: activity.imageUrl,
              cost: activity.cost,
              currency: activity.currency || 'USD',
              category: activity.category,
              icon: activity.icon,
            }));

            const { error: activitiesError } = await supabase
              .from('trip_activities')
              .insert(activitiesData);

            if (activitiesError) throw activitiesError;
          }
        }
      }

      // Handle other related data (weather, tips, etc.) in similar fashion

      // Format the returned itinerary to match our app's structure
      const createdItinerary: TripItinerary = {
        ...itinerary,
        id: newItineraryId,
        user_id: session.user.id,
      };

      // Update local state
      set((state) => ({
        userItineraries: [createdItinerary, ...state.userItineraries],
      }));

      return createdItinerary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create itinerary';
      set({ error: errorMessage });
      console.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateItinerary: async (itinerary) => {
    try {
      set({ isLoading: true, error: null });

      const itineraryData = {
        title: itinerary.title,
        destination: itinerary.destination,
        description: itinerary.description,
        image_url: itinerary.imageUrl,
        total_cost: itinerary.totalCost,
        currency: itinerary.currency,
      };

      const { data, error } = await supabase
        .from('trip_itineraries')
        .update(itineraryData)
        .eq('id', itinerary.id)
        .select()
        .single();

      if (error) throw error;

      // Update the state
      set((state) => {
        const updatedItineraries = state.userItineraries.map((item) =>
          item.id === itinerary.id ? { ...item, ...itineraryData } : item
        );

        return {
          userItineraries: updatedItineraries,
          currentItinerary:
            state.currentItinerary?.id === itinerary.id
              ? { ...state.currentItinerary, ...itineraryData }
              : state.currentItinerary,
        };
      });

      return itinerary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update itinerary';
      set({ error: errorMessage });
      console.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteItinerary: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.from('trip_itineraries').delete().eq('id', itineraryId);

      if (error) throw error;

      // Update the state
      set((state) => ({
        userItineraries: state.userItineraries.filter((item) => item.id !== itineraryId),
        currentItinerary:
          state.currentItinerary?.id === itineraryId ? null : state.currentItinerary,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete itinerary';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  addActivity: async (dayId, activity) => {
    try {
      set({ isLoading: true, error: null });
      const currentItinerary = get().currentItinerary;

      if (!currentItinerary) {
        throw new Error('No itinerary loaded');
      }

      const activityData = {
        day_id: dayId,
        name: activity.name,
        time: activity.time,
        description: activity.description,
        location: activity.location,
        image_url: activity.imageUrl,
        cost: activity.cost,
        currency: activity.currency || 'USD',
        category: activity.category,
        icon: activity.icon,
      };

      const { data, error } = await supabase
        .from('trip_activities')
        .insert(activityData)
        .select()
        .single();

      if (error) throw error;

      // Update the state
      const newActivity = {
        id: data.id,
        name: data.name,
        time: data.time,
        description: data.description,
        location: data.location,
        imageUrl: data.image_url,
        cost: data.cost,
        currency: data.currency,
        category: data.category,
        icon: data.icon,
        votes: [],
        comments: [],
      } as TripActivity;

      const updatedDays = currentItinerary.days.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            activities: [...day.activities, newActivity],
          };
        }
        return day;
      });

      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
        // Recalculate total cost
        totalCost: updatedDays.reduce(
          (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.cost, 0),
          0
        ),
      };

      // Also update the total cost in the database
      await supabase
        .from('trip_itineraries')
        .update({ total_cost: updatedItinerary.totalCost })
        .eq('id', currentItinerary.id);

      set({ currentItinerary: updatedItinerary });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add activity';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateActivity: async (dayId, activity) => {
    try {
      set({ isLoading: true, error: null });
      const currentItinerary = get().currentItinerary;

      if (!currentItinerary) {
        throw new Error('No itinerary loaded');
      }

      const activityData = {
        name: activity.name,
        time: activity.time,
        description: activity.description,
        location: activity.location,
        image_url: activity.imageUrl,
        cost: activity.cost,
        currency: activity.currency,
        category: activity.category,
        icon: activity.icon,
      };

      const { error } = await supabase
        .from('trip_activities')
        .update(activityData)
        .eq('id', activity.id)
        .eq('day_id', dayId);

      if (error) throw error;

      // Update the state
      const updatedDays = currentItinerary.days.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            activities: day.activities.map((act) =>
              act.id === activity.id ? { ...act, ...activityData } : act
            ),
          };
        }
        return day;
      });

      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
        // Recalculate total cost
        totalCost: updatedDays.reduce(
          (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.cost, 0),
          0
        ),
      };

      // Also update the total cost in the database
      await supabase
        .from('trip_itineraries')
        .update({ total_cost: updatedItinerary.totalCost })
        .eq('id', currentItinerary.id);

      set({ currentItinerary: updatedItinerary });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update activity';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteActivity: async (dayId, activityId) => {
    try {
      set({ isLoading: true, error: null });
      const currentItinerary = get().currentItinerary;

      if (!currentItinerary) {
        throw new Error('No itinerary loaded');
      }

      const { error } = await supabase
        .from('trip_activities')
        .delete()
        .eq('id', activityId)
        .eq('day_id', dayId);

      if (error) throw error;

      // Update the state
      const updatedDays = currentItinerary.days.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            activities: day.activities.filter((act) => act.id !== activityId),
          };
        }
        return day;
      });

      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
        // Recalculate total cost
        totalCost: updatedDays.reduce(
          (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + act.cost, 0),
          0
        ),
      };

      // Also update the total cost in the database
      await supabase
        .from('trip_itineraries')
        .update({ total_cost: updatedItinerary.totalCost })
        .eq('id', currentItinerary.id);

      set({ currentItinerary: updatedItinerary });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete activity';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  shareItinerary: async (itineraryId, userEmail, permission) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // First check if the user exists (using a lookup to auth.users is typically not allowed,
      // so in a real implementation you'd have a profiles table to check)
      const { data: userData, error: userError } = await supabase
        .from('profiles') // Assuming you have a profiles table
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) throw new Error('User not found');

      const sharedUserData = {
        user_id: userData.id,
        itinerary_id: itineraryId,
        user_email: userEmail,
        permission,
        created_by: session.user.id,
      };

      const { data, error } = await supabase
        .from('shared_itineraries')
        .insert(sharedUserData)
        .select()
        .single();

      if (error) throw error;

      const sharedUser = data as SharedUser;

      // Update state if this is for the current itinerary
      const currentItinerary = get().currentItinerary;
      if (currentItinerary && currentItinerary.id === itineraryId) {
        const updatedSharedUsers = currentItinerary.shared_users
          ? [...currentItinerary.shared_users, sharedUser]
          : [sharedUser];

        set({
          currentItinerary: {
            ...currentItinerary,
            shared_users: updatedSharedUsers,
          },
        });
      }

      return sharedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share itinerary';
      set({ error: errorMessage });
      console.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  removeSharedUser: async (itineraryId, userId) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('shared_itineraries')
        .delete()
        .eq('itinerary_id', itineraryId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update state if this is for the current itinerary
      const currentItinerary = get().currentItinerary;
      if (
        currentItinerary &&
        currentItinerary.id === itineraryId &&
        currentItinerary.shared_users
      ) {
        const updatedSharedUsers = currentItinerary.shared_users.filter(
          (user) => user.user_id !== userId
        );

        set({
          currentItinerary: {
            ...currentItinerary,
            shared_users: updatedSharedUsers,
          },
        });
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove shared user';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  voteActivity: async (activityId, voteType) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // First remove any existing vote by this user
      await supabase
        .from('activity_votes')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', session.user.id);

      // Then insert the new vote
      const { data, error } = await supabase
        .from('activity_votes')
        .insert({
          activity_id: activityId,
          user_id: session.user.id,
          vote_type: voteType,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the state
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) return false;

      const newVote: ActivityVote = {
        id: data.id,
        user_id: session.user.id,
        activity_id: activityId,
        vote_type: voteType,
        created_at: data.created_at,
      };

      let activityFound = false;

      const updatedDays = currentItinerary.days.map((day) => {
        return {
          ...day,
          activities: day.activities.map((activity) => {
            if (activity.id === activityId) {
              activityFound = true;
              // Remove existing vote from this user if it exists
              const filteredVotes =
                activity.votes?.filter((v) => v.user_id !== session.user.id) || [];

              return {
                ...activity,
                votes: [...filteredVotes, newVote],
              };
            }
            return activity;
          }),
        };
      });

      if (activityFound) {
        set({
          currentItinerary: {
            ...currentItinerary,
            days: updatedDays,
          },
        });
      }

      return activityFound;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote on activity';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  removeVote: async (activityId) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('activity_votes')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update the state
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) return false;

      let activityFound = false;

      const updatedDays = currentItinerary.days.map((day) => {
        return {
          ...day,
          activities: day.activities.map((activity) => {
            if (activity.id === activityId && activity.votes) {
              activityFound = true;
              return {
                ...activity,
                votes: activity.votes.filter((v) => v.user_id !== session.user.id),
              };
            }
            return activity;
          }),
        };
      });

      if (activityFound) {
        set({
          currentItinerary: {
            ...currentItinerary,
            days: updatedDays,
          },
        });
      }

      return activityFound;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove vote';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (activityId, comment) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          user_id: session.user.id,
          comment,
        })
        .select('*, profiles:user_id(display_name)')
        .single();

      if (error) throw error;

      // Format the comment with user info
      const newComment: ActivityComment = {
        id: data.id,
        user_id: session.user.id,
        activity_id: activityId,
        comment,
        created_at: data.created_at,
        user_name: data.profiles?.display_name || 'Anonymous User',
      };

      // Update the state
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) return null;

      let activityFound = false;

      const updatedDays = currentItinerary.days.map((day) => {
        return {
          ...day,
          activities: day.activities.map((activity) => {
            if (activity.id === activityId) {
              activityFound = true;
              return {
                ...activity,
                comments: [...(activity.comments || []), newComment],
              };
            }
            return activity;
          }),
        };
      });

      if (activityFound) {
        set({
          currentItinerary: {
            ...currentItinerary,
            days: updatedDays,
          },
        });
        return newComment;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      set({ error: errorMessage });
      console.error(errorMessage);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteComment: async (commentId) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.from('activity_comments').delete().eq('id', commentId);

      if (error) throw error;

      // Update the state
      const currentItinerary = get().currentItinerary;
      if (!currentItinerary) return false;

      let commentFound = false;

      const updatedDays = currentItinerary.days.map((day) => {
        return {
          ...day,
          activities: day.activities.map((activity) => {
            if (activity.comments?.some((c) => c.id === commentId)) {
              commentFound = true;
              return {
                ...activity,
                comments: activity.comments.filter((c) => c.id !== commentId),
              };
            }
            return activity;
          }),
        };
      });

      if (commentFound) {
        set({
          currentItinerary: {
            ...currentItinerary,
            days: updatedDays,
          },
        });
      }

      return commentFound;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      set({ error: errorMessage });
      console.error(errorMessage);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
