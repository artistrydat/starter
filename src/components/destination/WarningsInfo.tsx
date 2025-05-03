import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { PackingItem, TripTip, TripWarning } from '@/src/types/destinations';

// Define a type for valid MaterialCommunityIcons names
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Helper function to ensure icon names are valid
const getValidIconName = (iconName?: string): IconName => {
  // Provide fallback icons based on your app's design
  const fallbackIcon: IconName = 'information-outline';

  if (!iconName) return fallbackIcon;

  // Return the icon name as a valid IconName type
  return iconName as IconName;
};

export const WarningsInfo = ({
  warnings,
  packingItems,
  generalTips,
}: {
  warnings: TripWarning[];
  packingItems: PackingItem[];
  generalTips: TripTip[];
}) => {
  // Add safety check for undefined data
  if (
    (!warnings || warnings.length === 0) &&
    (!packingItems || packingItems.length === 0) &&
    (!generalTips || generalTips.length === 0)
  ) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText size="lg" color="text" align="center">
          No travel advisories or packing information available.
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Travel Warnings Section */}
      {warnings && warnings.length > 0 && (
        <View className="mb-6 rounded-xl bg-quinary p-4 shadow-sm">
          <AppText size="xl" weight="bold" color="primary" className="mb-4">
            Travel Advisories
          </AppText>
          {warnings.map((warning) => (
            <View key={warning.id} className="mb-2 flex-row items-start">
              <MaterialCommunityIcons
                name={getValidIconName(warning.icon) || 'alert-circle'}
                size={18}
                color={
                  warning.severity === 'high'
                    ? '#FF6B6B'
                    : warning.severity === 'medium'
                      ? '#FFD166'
                      : '#78B0A8'
                }
              />
              <View className="ml-2 flex-1">
                <AppText size="sm" weight="medium" color="text">
                  {warning.title}
                </AppText>
                <AppText size="xs" color="text">
                  {warning.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Packing List Section */}
      {packingItems && packingItems.length > 0 && (
        <View className="mb-6 rounded-xl bg-quinary p-4 shadow-sm">
          <AppText size="xl" weight="bold" color="primary" className="mb-4">
            Packing List
          </AppText>
          <View className="flex-row flex-wrap">
            {packingItems.map((item) => (
              <View
                key={item.id}
                className="mb-3 mr-3 flex-row items-center rounded-full bg-tertiary px-4 py-2">
                <MaterialCommunityIcons
                  name={getValidIconName(item.icon) || 'bag-personal'}
                  size={16}
                  color="#78B0A8"
                />
                <AppText size="sm" color="text" className="ml-1">
                  {item.name}
                </AppText>
                {item.essential && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={14}
                    color="#78B0A8"
                    className="ml-1"
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* General Tips Section */}
      {generalTips && generalTips.length > 0 && (
        <View className="rounded-xl bg-quinary p-4 shadow-sm">
          <AppText size="xl" weight="bold" color="primary" className="mb-4">
            General Tips
          </AppText>
          {generalTips.map((tip) => (
            <View key={tip.id} className="mb-2 flex-row items-center">
              <MaterialCommunityIcons
                name={getValidIconName(tip.icon || 'information')}
                size={18}
                color="#78B0A8"
              />
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
      )}
    </View>
  );
};

export default WarningsInfo;
