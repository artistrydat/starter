import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import PackingRecommendation from './PackingRecommendation';

import { AppText } from '@/src/components/ui';
import { PackingItem, TripTip, TripWarning } from '@/src/types/destinations';

export const WarningsInfo = ({
  warnings,
  packingItems,
  generalTips,
}: {
  warnings: TripWarning[];
  packingItems: PackingItem[];
  generalTips: TripTip[];
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-400';
      case 'medium':
        return 'bg-yellow-100 border-yellow-400';
      case 'low':
        return 'bg-blue-100 border-blue-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <View className="flex-1">
      <View className="mb-4 rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="xl" weight="bold" color="primary" className="mb-4">
          Things to Be Aware Of
        </AppText>

        {warnings.map((warning) => (
          <View
            key={warning.id}
            className={`mb-4 rounded-xl border p-4 ${getSeverityColor(warning.severity)}`}>
            <View className="mb-2 flex-row items-center">
              <MaterialCommunityIcons name={warning.icon} size={24} color="#5BBFB5" />
              <AppText size="lg" weight="bold" color="primary" className="ml-2">
                {warning.title}
              </AppText>
            </View>
            <AppText size="sm" color="text">
              {warning.description}
            </AppText>
          </View>
        ))}

        {/* Packing recommendation */}
        <PackingRecommendation packingItems={packingItems} />
      </View>

      <View className="rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="base" weight="bold" color="primary" className="mb-2">
          General Tips
        </AppText>
        {generalTips.map((tip) => (
          <View key={tip.id} className="mb-2 flex-row items-center">
            <MaterialCommunityIcons name={tip.icon} size={18} color="#78B0A8" />
            <View className="ml-2 flex-1">
              <AppText size="sm" weight="medium" color="text">
                {tip.title}
              </AppText>
              <AppText size="xs" color="text">
                {tip.description}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WarningsInfo;
