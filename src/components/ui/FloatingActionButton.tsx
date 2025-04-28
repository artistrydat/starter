import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { cn } from '@/src/utils/cn';

export type FloatingActionButtonProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
  className?: string;
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  color = '#5BBFB5', // primary color from theme
  size = 24,
  className,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.shadow}
      className={cn(
        'absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full',
        className
      )}
      activeOpacity={0.8}>
      <MaterialCommunityIcons name={icon} size={size} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: '#5BBFB5',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
});
