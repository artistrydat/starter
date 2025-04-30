import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { TripItinerary, TripWeather } from '@/src/types/destinations';

export const WeatherInfo = ({
  weather,
  weatherOverview,
}: {
  weather: TripWeather[];
  weatherOverview: TripItinerary['weather_overview'];
}) => {
  // Add safety check for undefined weather data
  if (!weather || weather.length === 0 || !weatherOverview) {
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
          {weather.map((day) => (
            <View key={day.day} className="mx-1 flex-1 items-center rounded-xl bg-tertiary p-4">
              <AppText size="sm" weight="bold" color="text">
                Day {day.day}
              </AppText>
              <MaterialCommunityIcons
                name={day.icon || 'weather-partly-cloudy'}
                size={32}
                color="primary"
              />
              <AppText size="lg" weight="bold" color="primary">
                {day.highTemp}°
              </AppText>
              <AppText size="xs" color="text">
                {day.lowTemp}°
              </AppText>
              <AppText size="xs" color="text" className="mt-1">
                {day.date ? day.date.split(', ')[0] : ''}
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
      </View>
    </View>
  );
};

export default WeatherInfo;
