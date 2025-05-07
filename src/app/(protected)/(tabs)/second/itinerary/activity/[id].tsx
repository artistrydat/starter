import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Pressable,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { AppText, Button } from '@/src/components/ui';
import {
  useActivityComments,
  useAddActivityComment,
  useDeleteActivityComment,
  useAddActivityVote,
} from '@/src/hooks/destinationQueries';
import { ActivityComment, TripActivity, VoteType } from '@/src/types/destinations';
import { mockItineraries } from '@/src/utils/mockItinerary';
import { useTripStore } from '@/store/tripStore';

export default function ActivityDetailScreen() {
  const {
    id: activityId,
    dayId,
    itineraryId,
  } = useLocalSearchParams<{
    id: string;
    dayId: string;
    itineraryId: string;
  }>();

  const router = useRouter();
  const [activity, setActivity] = useState<TripActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [newComment, setNewComment] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const { currentItinerary } = useTripStore();

  // Get comments for this activity using our hook
  const { data: comments = [], isLoading: isLoadingComments } = useActivityComments(
    activityId as string
  );

  // Hooks for comment operations
  const addCommentMutation = useAddActivityComment();
  const deleteCommentMutation = useDeleteActivityComment();

  // Hook for vote operations
  const addVoteMutation = useAddActivityVote();

  // Get the activity data
  useEffect(() => {
    if (!activityId || !dayId) {
      console.error('No activity ID or day ID provided');
      return;
    }

    // Find the activity either from the store or mock data
    const findActivity = () => {
      // First try to get from current itinerary in store
      if (currentItinerary) {
        const day = currentItinerary.days.find((d) => d.id === dayId);
        if (day) {
          const foundActivity = day.activities.find((a) => a.id === activityId);
          if (foundActivity) {
            setActivity(foundActivity);
            setIsLoading(false);
            return;
          }
        }
      }

      // Fallback to mock data
      const mockItinerary = mockItineraries.find((i) => i.id === itineraryId);
      if (mockItinerary) {
        const day = mockItinerary.days.find((d) => d.id === dayId);
        if (day) {
          const foundActivity = day.activities.find((a) => a.id === activityId);
          if (foundActivity) {
            setActivity(foundActivity);
            setIsLoading(false);
            return;
          }
        }
      }

      setIsLoading(false);
    };

    findActivity();
  }, [activityId, dayId, itineraryId, currentItinerary]);

  // Calculate vote counts
  const activityUpvotes = activity?.votes?.filter((v) => v.vote_type === 'upvote').length || 0;
  const activityDownvotes = activity?.votes?.filter((v) => v.vote_type === 'downvote').length || 0;
  const commentsCount = activity?.ActivityComment?.length || 0;

  // Handle voting
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (isVoting || !activity) return;

    setIsVoting(true);
    try {
      // Use the vote mutation
      await addVoteMutation.mutateAsync({
        activityId: activity.id,
        voteType: voteType as VoteType,
        dayId: dayId as string,
      });

      // For UI feedback, update the local state
      setUserVote(userVote === voteType ? null : voteType);
    } catch (error) {
      console.error('Error handling vote:', error);
      Alert.alert('Error', 'Failed to record vote');
    } finally {
      setIsVoting(false);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !activityId || !dayId) {
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        activityId: activityId as string,
        comment: newComment.trim(),
        dayId: dayId as string,
      });
      setNewComment('');
      // Scroll to bottom after adding comment
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!activityId || !dayId) return;

    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCommentMutation.mutateAsync({
              activityId: activityId as string,
              commentId,
              dayId: dayId as string,
            });
          } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert('Error', 'Failed to delete comment');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-quinary">
        <AppText size="lg">Loading activity...</AppText>
      </View>
    );
  }

  if (!activity) {
    return (
      <View className="flex-1 items-center justify-center bg-quinary">
        <AppText size="lg">Activity not found</AppText>
        <Button
          title="Go Back"
          color="primary"
          size="base"
          className="mt-4"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <View className="flex-1 bg-quinary">
        <Stack.Screen
          options={{
            title: activity.name,
            headerBackTitle: 'Itinerary',
          }}
        />

        <ScrollView ref={scrollViewRef} className="flex-1">
          {/* Activity Image */}
          {activity.image_url ? (
            <Image
              source={{ uri: activity.image_url }}
              className="h-56 w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-40 w-full items-center justify-center bg-secondary">
              {/* Use a default icon safely */}
              <MaterialCommunityIcons name="map-marker" size={64} color="#78B0A8" />
            </View>
          )}

          {/* Activity Details */}
          <View className="p-6">
            <View className="mb-2 flex-row items-center justify-between">
              <AppText size="2xl" weight="bold" color="primary">
                {activity.name}
              </AppText>
              <View className="rounded-full bg-secondary px-4 py-2">
                <AppText size="base" weight="semibold" color="text">
                  {activity.cost === 0 ? 'Free' : `${activity.cost} ${activity.currency}`}
                </AppText>
              </View>
            </View>

            <View className="mb-4 flex-row items-center">
              <MaterialCommunityIcons name="clock-outline" size={20} color="#78B0A8" />
              <AppText size="base" color="text" className="ml-2">
                {activity.time}
              </AppText>
            </View>

            <View className="mb-6 flex-row items-center">
              <MaterialCommunityIcons name="map-marker" size={20} color="#78B0A8" />
              <AppText size="base" color="text" className="ml-2">
                {activity.location || 'Location not specified'}
              </AppText>
            </View>

            <View className="mb-6">
              <AppText size="lg" weight="semibold" color="primary" className="mb-2">
                Description
              </AppText>
              <AppText size="base" color="text">
                {activity.description || 'No description available for this activity.'}
              </AppText>
            </View>

            <View className="mb-6">
              <AppText size="lg" weight="semibold" color="primary" className="mb-2">
                Category
              </AppText>
              <View className="flex-row">
                <View className="rounded-full bg-tertiary px-4 py-2">
                  <AppText size="base" color="text">
                    {activity.category}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Actions Section */}
            <View className="mt-4 flex-row justify-between border-t border-gray-200 pt-4">
              {/* Vote buttons */}
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => handleVote('upvote')}
                  className="mr-4 flex-row items-center"
                  hitSlop={10}>
                  <MaterialCommunityIcons
                    name={userVote === 'upvote' ? 'thumb-up' : 'thumb-up-outline'}
                    size={24}
                    color={userVote === 'upvote' ? '#5BBFB5' : '#78B0A8'}
                  />
                  <AppText size="base" color="text" className="ml-2">
                    {activityUpvotes}
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => handleVote('downvote')}
                  className="mr-4 flex-row items-center"
                  hitSlop={10}>
                  <MaterialCommunityIcons
                    name={userVote === 'downvote' ? 'thumb-down' : 'thumb-down-outline'}
                    size={24}
                    color={userVote === 'downvote' ? '#FF6B6B' : '#78B0A8'}
                  />
                  <AppText size="base" color="text" className="ml-2">
                    {activityDownvotes}
                  </AppText>
                </Pressable>
              </View>

              {/* Comment count */}
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="comment-outline" size={24} color="#78B0A8" />
                <AppText size="base" color="text" className="ml-2">
                  {commentsCount} Comments
                </AppText>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View className="border-t-8 border-gray-100 px-6 py-4">
            <AppText size="xl" weight="bold" color="primary" className="mb-4">
              Comments
            </AppText>

            {isLoadingComments ? (
              <View className="py-4">
                <AppText size="base" color="text">
                  Loading comments...
                </AppText>
              </View>
            ) : comments.length === 0 ? (
              <View className="py-4">
                <AppText size="base" color="text">
                  No comments yet. Be the first to comment!
                </AppText>
              </View>
            ) : (
              comments.map((comment: ActivityComment) => (
                <View key={comment.id} className="mb-4 rounded-lg bg-white p-3 shadow-sm">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="account-circle" size={24} color="#78B0A8" />
                      <AppText size="base" weight="semibold" color="primary" className="ml-2">
                        {comment.user_name || 'User'}
                      </AppText>
                    </View>
                    <Pressable onPress={() => handleDeleteComment(comment.id)} hitSlop={10}>
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#FF6B6B" />
                    </Pressable>
                  </View>
                  <AppText size="base" color="text" className="mt-2">
                    {comment.text}
                  </AppText>
                  <AppText size="xs" color="text" className="mt-2 opacity-60">
                    {new Date(comment.created_at || Date.now()).toLocaleString()}
                  </AppText>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Comment Input Section */}
        <View className="border-t border-gray-200 bg-white p-4">
          <View className="flex-row">
            <TextInput
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <Pressable
              onPress={handleAddComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className={`ml-2 items-center justify-center rounded-full ${
                !newComment.trim() || addCommentMutation.isPending ? 'bg-gray-300' : 'bg-primary'
              } p-2`}>
              {addCommentMutation.isPending ? (
                <MaterialCommunityIcons name="loading" size={24} color="white" />
              ) : (
                <MaterialCommunityIcons name="send" size={24} color="white" />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
