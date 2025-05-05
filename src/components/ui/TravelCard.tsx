import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View, TouchableOpacity, ImageBackground } from 'react-native';

import { AppText } from './AppText';

import { TripItinerary } from '@/src/types/destinations';
import { cn } from '@/src/utils/cn';

/**
 * TravelCard component - Pure UI component for displaying destination information
 * No data fetching or source-specific logic included
 */
export type TravelCardProps = {
  destination: TripItinerary;
  isFavorite: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  className?: string;
};

export const TravelCard: React.FC<TravelCardProps> = ({
  destination,
  isFavorite,
  onPress,
  onFavoritePress,
  className,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn('mb-4 overflow-hidden rounded-xl shadow-md', className)}>
      <View className="relative">
        <ImageBackground
          source={{ uri: destination.image_url }}
          className="h-56 w-full"
          imageStyle={{ borderRadius: 12 }}>
          <View style={{ flex: 1 }}>
            {/* Favorite Button */}
            <TouchableOpacity
              onPress={onFavoritePress}
              className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm">
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#FF6B6B' : '#666'}
              />
            </TouchableOpacity>

            {/* Rating Badge */}
            {destination.rating && (
              <View className="absolute right-3 top-16 flex-row items-center rounded-full bg-white/80 px-2 py-1">
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <AppText size="xs" weight="bold" color="text" className="ml-1">
                  {destination.rating.toFixed(1)}
                </AppText>
              </View>
            )}

            {/* Tags Container */}
            <View className="absolute left-3 top-3 flex-row flex-wrap gap-2">
              {destination.tags &&
                destination.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur-sm">
                    <AppText size="xs" weight="medium" color="text">
                      {tag}
                    </AppText>
                  </View>
                ))}
            </View>

            {/* Title and Location Container */}
            <View className="absolute bottom-0 left-0 right-0 p-4 shadow-sm">
              <View className="overflow-hidden rounded-xl bg-white/80 p-2 backdrop-blur-sm">
                <AppText size="sm" color="text">
                  {destination.city || ''} {destination.location ? `· ${destination.location}` : ''}
                </AppText>
                {destination.price_level && (
                  <AppText size="xs" color="text" className="mt-1">
                    {typeof destination.price_level === 'string'
                      ? destination.price_level.charAt(0).toUpperCase() +
                        destination.price_level.slice(1)
                      : destination.price_level}
                  </AppText>
                )}
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};
