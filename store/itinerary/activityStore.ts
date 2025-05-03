import { create } from 'zustand';

import { useItineraryStore } from './itineraryStore';

import { ActivityComment, ActivityVote, TripActivity, VoteType } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

interface ActivityState {
  isLoading: boolean;
  error: string | null;

  fetchActivities: (dayId: string) => Promise<TripActivity[]>;
  createActivity: (activity: Omit<TripActivity, 'id'>) => Promise<TripActivity>;
  updateActivity: (activity: TripActivity) => Promise<TripActivity>;
  deleteActivity: (activityId: string, dayId: string) => Promise<boolean>;
  addActivityComment: (activityId: string, comment: string) => Promise<ActivityComment>;
  addActivityVote: (activityId: string, voteType: VoteType) => Promise<ActivityVote>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  isLoading: false,
  error: null,

  fetchActivities: async (dayId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data - find the day in the mock itinerary and get its activities
      const day = mockItinerary.days.find((d) => d.id === dayId);
      const activities = day?.activities || [];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 700));

      return activities;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch activities' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  createActivity: async (activity) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new activity with mock ID
      const newActivity: TripActivity = {
        ...activity,
        id: `activity-${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        votes: [],
        comments: [],
      };

      // Find the day and add the activity to it
      const days = currentItinerary.days?.map((d) => {
        if (d.id === activity.day_id) {
          return {
            ...d,
            activities: [...(d.activities || []), newActivity],
          };
        }
        return d;
      });

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: days || [],
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return newActivity;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create activity' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateActivity: async (activity) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Find the day and update the activity in it
      const days = currentItinerary.days?.map((d) => {
        if (d.id === activity.day_id) {
          return {
            ...d,
            activities: d.activities?.map((a) => (a.id === activity.id ? activity : a)) || [],
          };
        }
        return d;
      });

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: days || [],
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return activity;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update activity' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteActivity: async (activityId, dayId) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Find the day and remove the activity from it
      const days = currentItinerary.days?.map((d) => {
        if (d.id === dayId) {
          return {
            ...d,
            activities: d.activities?.filter((a) => a.id !== activityId) || [],
          };
        }
        return d;
      });

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: days || [],
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete activity' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  addActivityComment: async (activityId, comment) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new comment with mock data
      const newComment: ActivityComment = {
        id: `comment-${Math.random().toString(36).substring(2, 9)}`,
        activity_id: activityId,
        user_id: 'current-user',
        comment, // Fixed from 'content' to 'comment' to match the interface
        created_at: new Date().toISOString(),
        user_name: 'Current User',
      };

      // Find the activity and add the comment to it
      let activityFound = false;
      const days = currentItinerary.days?.map((d) => {
        const activities = d.activities?.map((a) => {
          if (a.id === activityId) {
            activityFound = true;
            return {
              ...a,
              comments: [...(a.comments || []), newComment],
            };
          }
          return a;
        });

        return {
          ...d,
          activities: activities || [],
        };
      });

      if (!activityFound) throw new Error('Activity not found');

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: days || [],
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      return newComment;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add comment' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addActivityVote: async (activityId, voteType) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      // Create new vote with mock data
      const newVote: ActivityVote = {
        id: `vote-${Math.random().toString(36).substring(2, 9)}`,
        activity_id: activityId,
        user_id: 'current-user',
        vote_type: voteType, // Fixed property name from 'vote' to 'vote_type'
        created_at: new Date().toISOString(),
      };

      // Find the activity and add the vote to it
      let activityFound = false;
      const days = currentItinerary.days?.map((d) => {
        const activities = d.activities?.map((a) => {
          if (a.id === activityId) {
            activityFound = true;

            // Check if user already voted and replace if so
            const existingVoteIndex = a.votes?.findIndex((v) => v.user_id === 'current-user');
            const updatedVotes = [...(a.votes || [])];

            if (existingVoteIndex !== undefined && existingVoteIndex >= 0) {
              updatedVotes[existingVoteIndex] = newVote;
            } else {
              updatedVotes.push(newVote);
            }

            return {
              ...a,
              votes: updatedVotes,
            };
          }
          return a;
        });

        return {
          ...d,
          activities: activities || [],
        };
      });

      if (!activityFound) throw new Error('Activity not found');

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        days: days || [],
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return newVote;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add vote' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
