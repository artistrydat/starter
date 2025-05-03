import { create } from 'zustand';

import { useItineraryStore } from './itineraryStore';

import { PermissionType, SharedUser } from '@/src/types/destinations';
import { mockItinerary } from '@/src/utils/mockItinerary';

interface ShareState {
  isLoading: boolean;
  error: string | null;

  fetchSharedUsers: (itineraryId: string) => Promise<void>;
  shareItinerary: (itineraryId: string, email: string, permission: PermissionType) => Promise<void>;
  removeSharedUser: (sharedId: string) => Promise<void>;
}

export const useShareStore = create<ShareState>((set) => ({
  isLoading: false,
  error: null,

  fetchSharedUsers: async (itineraryId) => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data instead of Supabase
      const sharedUsers = mockItinerary.shared_users || [];

      useItineraryStore.getState().setCurrentItinerary({
        ...useItineraryStore.getState().currentItinerary!,
        shared_users: sharedUsers,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch shared users' });
    } finally {
      set({ isLoading: false });
    }
  },

  shareItinerary: async (itineraryId, email, permission) => {
    try {
      set({ isLoading: true, error: null });

      // Create a mock shared user
      const newSharedUser: SharedUser = {
        id: `shared-${Math.random().toString(36).substring(2, 9)}`,
        user_id: `user-${Math.random().toString(36).substring(2, 9)}`,
        itinerary_id: itineraryId,
        user_email: email,
        permission,
        created_at: new Date().toISOString(),
        user_name: 'Mock User',
      };

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      const updatedSharedUsers = [...(currentItinerary.shared_users || []), newSharedUser];

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        shared_users: updatedSharedUsers,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to share itinerary' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeSharedUser: async (sharedId) => {
    try {
      set({ isLoading: true, error: null });

      const currentItinerary = useItineraryStore.getState().currentItinerary;
      if (!currentItinerary) throw new Error('No itinerary loaded');

      const updatedSharedUsers =
        currentItinerary.shared_users?.filter((user) => user.id !== sharedId) || [];

      useItineraryStore.getState().setCurrentItinerary({
        ...currentItinerary,
        shared_users: updatedSharedUsers,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove shared user' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
