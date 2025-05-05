import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { PackingItem } from '@/src/types/destinations';

/**
 * PackingRecommendation component - Pure UI component for displaying packing recommendations
 * No data fetching or source-specific logic included
 */

// Define allowed icon names type - this matches what MaterialCommunityIcons expects
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type PackingRecommendationProps = {
  packingItems: PackingItem[];
};

export const PackingRecommendation = ({ packingItems }: PackingRecommendationProps) => {
  // Add safety check for empty or undefined packing items
  if (!packingItems || packingItems.length === 0) {
    return (
      <View className="mt-4 rounded-lg bg-primary/10 p-4">
        <View className="mb-2 flex-row items-center">
          <MaterialCommunityIcons name="bag-checked" size={20} color="#5BBFB5" />
          <AppText size="base" weight="medium" color="primary" className="ml-2">
            Packing Recommendation
          </AppText>
        </View>
        <AppText size="sm" color="text" className="mt-2">
          No packing recommendations available.
        </AppText>
      </View>
    );
  }

  return (
    <View className="mt-4 rounded-lg bg-primary/10 p-4">
      <View className="mb-2 flex-row items-center">
        <MaterialCommunityIcons name="bag-checked" size={20} color="#5BBFB5" />
        <AppText size="base" weight="medium" color="primary" className="ml-2">
          Packing Recommendation
        </AppText>
      </View>

      <View className="flex-row flex-wrap">
        {packingItems.map((item) => (
          <View key={item.id} className="mt-2 w-1/2 flex-row items-center">
            <MaterialCommunityIcons
              name={(item.icon as MaterialCommunityIconName) || 'bag-personal'}
              size={16}
              color={item.essential ? '#5BBFB5' : '#78B0A8'}
            />
            <AppText size="xs" color="text" weight="normal" className="ml-2">
              {item.name} {item.essential && '★'}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PackingRecommendation;
