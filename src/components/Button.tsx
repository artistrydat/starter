import React from 'react';
import { Pressable, PressableProps, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { cn } from '../utils/cn';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  theme?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
} & PressableProps;

export const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ title, onPress, theme = 'primary', size = 'md', disabled, ...rest }, ref) => {
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <AnimatedPressable
        ref={ref}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle]}
        className={cn(
          'mb-4 flex-row items-center justify-center rounded-2xl',
          // Size variants
          size === 'sm' && 'px-4 py-2',
          size === 'md' && 'px-6 py-4',
          size === 'lg' && 'px-8 py-5',
          // Theme variants with improved visual hierarchy
          theme === 'primary' && 'bg-quaternary shadow-quaternary/30 dark:bg-primary shadow-lg',
          theme === 'secondary' && 'bg-primary shadow-primary/20 dark:bg-secondary shadow-md',
          theme === 'tertiary' && 'border-quaternary dark:border-primary border-2 bg-transparent',
          disabled && 'opacity-40 dark:opacity-30'
        )}
        disabled={disabled}
        {...rest}>
        <Text
          className={cn(
            'font-sans tracking-wider',
            // Size variants for text
            size === 'sm' && 'text-base',
            size === 'md' && 'text-lg',
            size === 'lg' && 'text-xl',
            // Theme variants for text
            theme === 'primary' && 'text-primary dark:text-quaternary font-bold',
            theme === 'secondary' && 'text-quaternary dark:text-tertiary font-semibold',
            theme === 'tertiary' && 'text-quaternary dark:text-primary'
          )}>
          {title}
        </Text>
      </AnimatedPressable>
    );
  }
);

Button.displayName = 'Button';
