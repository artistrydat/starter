import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Image, Alert, Pressable, Modal, TextInput } from 'react-native';

import { AppText, Button } from '@/src/components/ui';
import { useAddActivityComment, useDeleteActivityComment } from '@/src/hooks/destinationQueries';
import { ActivityComment, TripActivity } from '@/src/types/destinations';

/**
 * ActivityItem component - Pure UI component for displaying travel activity information
 * No data fetching or source-specific logic included
 */
export type ActivityItemProps = {
  activity: TripActivity;
  dayId: string;
  itineraryId?: string;
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
  itineraryId,
  editable = true,
  upvotes = 0,
  downvotes = 0,
  userVote = null,
  onDelete,
  onVote,
  onComment,
}: ActivityItemProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Hook for adding a comment
  const addCommentMutation = useAddActivityComment();
  // Hook for deleting a comment
  const deleteCommentMutation = useDeleteActivityComment();

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
      // Open the comment modal if no specific handler is provided
      setCommentModalVisible(true);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        activityId: activity.id,
        comment: newComment.trim(),
        dayId,
      });
      setNewComment('');
      setCommentModalVisible(false);
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCommentMutation.mutateAsync({
              activityId: activity.id,
              commentId,
              dayId,
            });
            Alert.alert('Success', 'Comment deleted successfully');
          } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert('Error', 'Failed to delete comment');
          }
        },
      },
    ]);
  };

  // Navigate to activity detail page
  const navigateToActivityDetail = () => {
    // Using the existing /second/itinerary/[id] path with activity info as params
    router.push({
      pathname: '/second/itinerary/activity/[id]',
      params: {
        id: activity.id,
        dayId,
        itineraryId,
      },
    });
  };

  // Get comments count - check for ActivityComment instead of comments
  const commentsCount = activity.ActivityComment?.length || 0;

  return (
    <View>
      <Pressable onPress={navigateToActivityDetail}>
        <View className="mb-4 overflow-hidden rounded-xl bg-tertiary shadow-sm">
          {activity.image_url && (
            <Image
              source={{ uri: activity.image_url }}
              className="h-40 w-full"
              resizeMode="cover"
            />
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
                  onPress={(e) => {
                    e.stopPropagation();
                    handleVote('upvote');
                  }}
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
                  onPress={(e) => {
                    e.stopPropagation();
                    handleVote('downvote');
                  }}
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
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowComments(!showComments);
                  }}
                  className="flex-row items-center"
                  hitSlop={10}>
                  <MaterialCommunityIcons
                    name={showComments ? 'comment' : 'comment-outline'}
                    size={18}
                    color="#78B0A8"
                  />
                  {commentsCount > 0 && (
                    <AppText size="xs" color="text" className="ml-1">
                      {commentsCount}
                    </AppText>
                  )}
                </Pressable>
              </View>

              {/* Action buttons */}
              <View className="flex-row">
                {/* Add comment button */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleComment();
                  }}
                  className="mr-4"
                  hitSlop={10}>
                  <MaterialCommunityIcons name="comment-plus-outline" size={18} color="#78B0A8" />
                </Pressable>

                {editable && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteActivity();
                    }}
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
      </Pressable>

      {/* Comments section (collapsible) */}
      {showComments && activity.ActivityComment && activity.ActivityComment.length > 0 && (
        <View className="-mt-2 mb-6 rounded-b-xl bg-gray-50 p-4">
          <AppText size="sm" weight="semibold" color="primary" className="mb-2">
            Comments
          </AppText>
          {activity.ActivityComment.map((comment: ActivityComment) => (
            <View key={comment.id} className="mb-3 border-b border-gray-100 pb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="account-circle" size={18} color="#78B0A8" />
                  <AppText size="xs" weight="semibold" color="text" className="ml-1">
                    {comment.user_name || 'User'}
                  </AppText>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteComment(comment.id);
                  }}
                  hitSlop={10}>
                  <MaterialCommunityIcons name="close" size={16} color="#999" />
                </Pressable>
              </View>
              <AppText size="sm" color="text" className="mt-1">
                {comment.text}
              </AppText>
              <AppText size="xs" color="text" className="mt-1 opacity-60">
                {new Date(comment.created_at || Date.now()).toLocaleString()}
              </AppText>
            </View>
          ))}
        </View>
      )}

      {/* Add Comment Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={commentModalVisible}
        onRequestClose={() => {
          setCommentModalVisible(false);
        }}>
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="rounded-t-xl bg-white p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <AppText size="lg" weight="bold" color="primary">
                Add Comment
              </AppText>
              <Pressable onPress={() => setCommentModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <TextInput
              className="mb-4 rounded-lg border border-gray-300 p-2"
              placeholder="Write your comment here..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={3}
            />

            <Button
              title={addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
              color="primary"
              size="base"
              onPress={handleAddComment}
              disabled={addCommentMutation.isPending || !newComment.trim()}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ActivityItem;
