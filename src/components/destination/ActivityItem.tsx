import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Image } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripActivity } from '@/src/types/destinations';

export const ActivityItem = ({ activity }: { activity: TripActivity }) => {
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
      </View>
    </View>
  );
};

export default ActivityItem;
