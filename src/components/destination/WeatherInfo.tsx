import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripItinerary } from '@/src/types/destinations';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * WeatherInfo component - Pure UI component for displaying weather information
 * No data fetching or source-specific logic included
 */
const getValidIconName = (
  iconName: string | undefined,
  fallback: MaterialCommunityIconName
): MaterialCommunityIconName => {
  if (!iconName) return fallback;
  return iconName as MaterialCommunityIconName;
};

export const WeatherInfo = ({
  weatherData,
  weatherOverview,
}: {
  weatherData: TripItinerary['weather'];
  weatherOverview: TripItinerary['weather_overview'];
}) => {
  if (!weatherData || weatherData.length === 0 || !weatherOverview) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText size="lg" color="text" align="center">
          Weather data is not available.
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="mb-6 rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="xl" weight="bold" color="primary" className="mb-4">
          Weather Forecast
        </AppText>

        <View className="mb-6 flex-row justify-between">
          {weatherData.map((day) => (
            <View key={day.id} className="mx-1 flex-1 items-center rounded-xl bg-tertiary p-4">
              <AppText size="sm" weight="bold" color="text">
                Day {day.day || 1}
              </AppText>
              <MaterialCommunityIcons
                name={getValidIconName(day.icon, 'weather-partly-cloudy')}
                size={32}
                color="#5BBFB5"
              />
              <AppText size="lg" weight="bold" color="primary">
                {day.high_temp}°
              </AppText>
              <AppText size="xs" color="text">
                {day.low_temp}°
              </AppText>
              <AppText size="xs" color="text" className="mt-1">
                {day.date
                  ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
                  : ''}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <View className="rounded-xl bg-quinary p-4 shadow-sm">
        <AppText size="base" weight="bold" color="primary" className="mb-2">
          Trip Weather Overview
        </AppText>
        <AppText size="sm" color="text">
          {weatherOverview.description || 'No weather overview available'}
        </AppText>

        {weatherOverview.recommendations?.length > 0 && (
          <View className="mt-4">
            <AppText size="base" weight="bold" color="primary" className="mb-2">
              Recommendations
            </AppText>
            {weatherOverview.recommendations.map((recommendation) => (
              <View key={recommendation.id} className="mb-2 flex-row items-center">
                <MaterialCommunityIcons
                  name={getValidIconName(recommendation.icon, 'information-outline')}
                  size={20}
                  color="#5BBFB5"
                  className="mr-2"
                />
                <AppText size="sm" color="text">
                  {recommendation.text}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default WeatherInfo;
