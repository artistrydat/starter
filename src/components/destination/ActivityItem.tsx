import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Image, Alert, Pressable } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripActivity } from '@/src/types/destinations';
import { useItineraryStore } from '@/store/itineraryStore';

type ActivityItemProps = {
  activity: TripActivity;
  dayId: string;
  editable?: boolean;
};

export const ActivityItem = ({ activity, dayId, editable = true }: ActivityItemProps) => {
  const { deleteActivity, voteActivity, removeVote, addComment } = useItineraryStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Calculate vote counts
  const upvotes = activity.votes?.filter((v) => v.vote_type === 'upvote').length || 0;
  const downvotes = activity.votes?.filter((v) => v.vote_type === 'downvote').length || 0;
  const score = upvotes - downvotes;

  // Check if current user has voted
  const hasUserVoted = (voteType: 'upvote' | 'downvote'): boolean => {
    // In a real app, you'd check against the current user ID
    // Since we don't have that available, we'll just return false for now
    return false;
  };

  const handleDeleteActivity = async () => {
    if (isDeleting) return;

    Alert.alert(
      'Delete Activity',
      `Are you sure you want to remove ${activity.name} from your itinerary?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const success = await deleteActivity(dayId, activity.id);
              if (success) {
                // Activity deleted
              } else {
                Alert.alert('Error', 'Failed to delete the activity. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      const userHasVoted = hasUserVoted(voteType);
      let success;

      if (userHasVoted) {
        success = await removeVote(activity.id);
      } else {
        success = await voteActivity(activity.id, voteType);
      }

      if (!success) {
        Alert.alert('Error', 'Failed to register your vote. Please try again.');
      }
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = () => {
    // In a real app, this would open a comment modal or navigate to a comments screen
    Alert.alert(
      'Add Comment',
      'This would navigate to the activity details screen with comments in a real app.'
    );
  };

  const handleShareActivity = () => {
    Alert.alert(
      'Invite Users',
      'This would open a modal to invite users to collaborate on this itinerary.'
    );
  };

  return (
    <View className="mb-4 overflow-hidden rounded-xl bg-tertiary shadow-sm">
      {activity.imageUrl && (
        <Image source={{ uri: activity.imageUrl }} className="h-40 w-full" resizeMode="cover" />
      )}
      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <AppText size="xl" weight="bold" color="primary">
            {activity.name}
          </AppText>
          <AppText size="sm" color="text" className="opacity-70">
            {activity.time}
          </AppText>
        </View>

        <AppText size="sm" color="text" className="mb-2">
          {activity.description}
        </AppText>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="map-marker" size={18} color="#78B0A8" />
            <AppText size="xs" color="text" className="ml-1">
              {activity.location}
            </AppText>
          </View>

          <View className="rounded-full bg-secondary px-3 py-1">
            <AppText size="xs" weight="bold" color="text">
              {activity.cost === 0 ? 'Free' : `${activity.cost} ${activity.currency || 'JPY'}`}
            </AppText>
          </View>
        </View>

        {/* Action buttons row */}
        <View className="mt-3 flex-row justify-between border-t border-gray-200 pt-3">
          {/* Vote buttons */}
          <View className="flex-row items-center">
            <Pressable
              onPress={() => handleVote('upvote')}
              className="mr-2 flex-row items-center"
              hitSlop={10}>
              <MaterialCommunityIcons
                name={hasUserVoted('upvote') ? 'thumb-up' : 'thumb-up-outline'}
                size={18}
                color={hasUserVoted('upvote') ? '#5BBFB5' : '#78B0A8'}
              />
              {upvotes > 0 && (
                <AppText size="xs" color="text" className="ml-1">
                  {upvotes}
                </AppText>
              )}
            </Pressable>

            <Pressable
              onPress={() => handleVote('downvote')}
              className="mr-4 flex-row items-center"
              hitSlop={10}>
              <MaterialCommunityIcons
                name={hasUserVoted('downvote') ? 'thumb-down' : 'thumb-down-outline'}
                size={18}
                color={hasUserVoted('downvote') ? '#FF6B6B' : '#78B0A8'}
              />
              {downvotes > 0 && (
                <AppText size="xs" color="text" className="ml-1">
                  {downvotes}
                </AppText>
              )}
            </Pressable>

            {/* Comment button */}
            <Pressable onPress={handleComment} className="flex-row items-center" hitSlop={10}>
              <MaterialCommunityIcons name="comment-outline" size={18} color="#78B0A8" />
              {(activity.comments?.length || 0) > 0 && (
                <AppText size="xs" color="text" className="ml-1">
                  {activity.comments?.length}
                </AppText>
              )}
            </Pressable>
          </View>

          {/* Action buttons */}
          <View className="flex-row">
            {editable && (
              <Pressable
                onPress={handleDeleteActivity}
                className="mr-4"
                hitSlop={10}
                disabled={isDeleting}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF6B6B" />
              </Pressable>
            )}

            <Pressable onPress={handleShareActivity} hitSlop={10}>
              <MaterialCommunityIcons name="share-variant-outline" size={18} color="#78B0A8" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActivityItem;
