import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

import { cn } from '../../utils/cn';

type ButtonProps = {
  title: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'error' | 'white';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'display';
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, color = 'primary', size = 'base', ...touchableProps }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        className={cn(
          'items-center rounded-[28px] shadow-md',
          // Size variants with appropriate padding
          size === 'xs' && 'p-2',
          size === 'sm' && 'p-3',
          size === 'base' && 'p-4',
          size === 'lg' && 'p-5',
          size === 'xl' && 'p-6',
          size === '2xl' && 'p-7',
          size === '3xl' && 'p-8',
          size === '4xl' && 'p-9',
          size === 'display' && 'p-10',
          // Updated color variants for the light theme
          color === 'primary' && 'bg-primary',
          color === 'secondary' && 'bg-secondary',
          color === 'tertiary' && 'bg-tertiary',
          color === 'accent' && 'bg-accent',
          color === 'success' && 'bg-green-500',
          color === 'error' && 'bg-red-500',
          color === 'white' && 'bg-quinary',
          touchableProps.className
        )}>
        <Text
          className={cn(
            'text-center font-semibold',
            // Set default text color based on button color
            color === 'tertiary' || color === 'white' || color === 'secondary'
              ? 'text-text'
              : 'text-white',
            // Text size variants matching AppText
            size === 'xs' && 'text-xs leading-4',
            size === 'sm' && 'text-sm leading-5',
            size === 'base' && 'text-base leading-6',
            size === 'lg' && 'text-lg leading-7',
            size === 'xl' && 'text-xl leading-8',
            size === '2xl' && 'text-2xl leading-9 tracking-tight',
            size === '3xl' && 'text-3xl leading-10 tracking-tight',
            size === '4xl' && 'leading-11 text-4xl tracking-tighter',
            size === 'display' && 'text-5xl leading-tight tracking-tighter'
          )}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);
