import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Image, Alert, Pressable } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripActivity } from '@/src/types/destinations';

/**
 * ActivityItem component - Pure UI component for displaying travel activity information
 * No data fetching or source-specific logic included
 */
export type ActivityItemProps = {
  activity: TripActivity;
  dayId: string;
  editable?: boolean;
  upvotes?: number;
  downvotes?: number;
  userVote?: 'upvote' | 'downvote' | null;
  onDelete?: (dayId: string, activityId: string) => void;
  onVote?: (activityId: string, voteType: 'upvote' | 'downvote') => void;
  onComment?: (activityId: string) => void;
};

export const ActivityItem = ({
  activity,
  dayId,
  editable = true,
  upvotes = 0,
  downvotes = 0,
  userVote = null,
  onDelete,
  onVote,
  onComment,
}: ActivityItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Calculate vote counts - use props if provided, otherwise calculate from activity
  const activityUpvotes =
    upvotes !== undefined
      ? upvotes
      : activity.votes?.filter((v) => v.vote_type === 'upvote').length || 0;

  const activityDownvotes =
    downvotes !== undefined
      ? downvotes
      : activity.votes?.filter((v) => v.vote_type === 'downvote').length || 0;

  // Check if current user has voted
  const hasUserVoted = (voteType: 'upvote' | 'downvote'): boolean => {
    return userVote === voteType;
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
              if (onDelete) {
                onDelete(dayId, activity.id);
              } else {
                // If no handler is provided, just show a mock alert
                Alert.alert('Action', 'This would delete the activity in a real app');
              }
            } catch (error) {
              console.error('Error handling delete:', error);
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
      if (onVote) {
        onVote(activity.id, voteType);
      } else {
        // If no handler is provided, just show a mock alert
        Alert.alert('Action', `This would ${voteType} the activity in a real app`);
      }
    } catch (error) {
      console.error('Error handling vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(activity.id);
    } else {
      // If no handler is provided, just show a mock alert
      Alert.alert('Action', 'This would open comments in a real app');
    }
  };

  // Get comments count - check for ActivityComment instead of comments
  const commentsCount = activity.ActivityComment?.length || 0;

  return (
    <View className="mb-4 overflow-hidden rounded-xl bg-tertiary shadow-sm">
      {activity.image_url && (
        <Image source={{ uri: activity.image_url }} className="h-40 w-full" resizeMode="cover" />
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
          {activity.description || 'No description available'}
        </AppText>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="map-marker" size={18} color="#78B0A8" />
            <AppText size="xs" color="text" className="ml-1">
              {activity.location || 'Location not specified'}
            </AppText>
          </View>

          <View className="rounded-full bg-secondary px-3 py-1">
            <AppText size="xs" weight="bold" color="text">
              {activity.cost === 0 ? 'Free' : `${activity.cost} ${activity.currency}`}
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
              {activityUpvotes > 0 && (
                <AppText size="xs" color="text" className="ml-1">
                  {activityUpvotes}
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
              {activityDownvotes > 0 && (
                <AppText size="xs" color="text" className="ml-1">
                  {activityDownvotes}
                </AppText>
              )}
            </Pressable>

            {/* Comment button */}
            <Pressable onPress={handleComment} className="flex-row items-center" hitSlop={10}>
              <MaterialCommunityIcons name="comment-outline" size={18} color="#78B0A8" />
              {commentsCount > 0 && (
                <AppText size="xs" color="text" className="ml-1">
                  {commentsCount}
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
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActivityItem;
