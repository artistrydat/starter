import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Image, Alert, Pressable } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripActivity } from '@/src/types/destinations';
import { useActivityStore } from '@/store/itinerary';

type ActivityItemProps = {
  activity: TripActivity;
  dayId: string;
  editable?: boolean;
  useMockInteractions?: boolean;
};

export const ActivityItem = ({
  activity,
  dayId,
  editable = true,
  useMockInteractions = true,
}: ActivityItemProps) => {
  const { deleteActivity } = useActivityStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Local state for mock interactions
  const [mockUpvotes, setMockUpvotes] = useState(0);
  const [mockDownvotes, setMockDownvotes] = useState(0);
  const [mockUserVote, setMockUserVote] = useState<'upvote' | 'downvote' | null>(null);

  // Calculate vote counts
  const upvotes = useMockInteractions
    ? mockUpvotes
    : activity.votes?.filter((v) => v.vote_type === 'upvote').length || 0;
  const downvotes = useMockInteractions
    ? mockDownvotes
    : activity.votes?.filter((v) => v.vote_type === 'downvote').length || 0;

  // Check if current user has voted
  const hasUserVoted = (voteType: 'upvote' | 'downvote'): boolean => {
    if (useMockInteractions) {
      return mockUserVote === voteType;
    }

    // In a real app, you'd check against the current user ID
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
            if (useMockInteractions) {
              Alert.alert('Mock Delete', 'In a real app, this activity would be deleted.');
              return;
            }

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

    if (useMockInteractions) {
      // Handle mock voting
      if (mockUserVote === voteType) {
        // Remove vote
        setMockUserVote(null);
        if (voteType === 'upvote') {
          setMockUpvotes((prev) => Math.max(0, prev - 1));
        } else {
          setMockDownvotes((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Add/change vote
        if (mockUserVote === 'upvote' && voteType === 'downvote') {
          setMockUpvotes((prev) => Math.max(0, prev - 1));
          setMockDownvotes((prev) => prev + 1);
        } else if (mockUserVote === 'downvote' && voteType === 'upvote') {
          setMockDownvotes((prev) => Math.max(0, prev - 1));
          setMockUpvotes((prev) => prev + 1);
        } else if (voteType === 'upvote') {
          setMockUpvotes((prev) => prev + 1);
        } else {
          setMockDownvotes((prev) => prev + 1);
        }
        setMockUserVote(voteType);
      }
      return;
    }

    setIsVoting(true);
    try {
      // In a real app, you would call an API to vote on the activity
      // const success = await voteActivity(activity.id, voteType);
      const success = false;

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
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActivityItem;
