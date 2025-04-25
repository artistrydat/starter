import { Text } from 'react-native';

import { cn } from '../../utils/cn';

type AppTextProps = {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'display';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'text'
    | 'accent'
    | 'success'
    | 'error'
    | 'white';
  align?: 'left' | 'center' | 'right';
  className?: string;
  numberOfLines?: number;
};

export function AppText({
  children,
  size = 'base',
  weight = 'normal',
  color = 'text',
  align = 'left',
  className,
  numberOfLines,
  ...props
}: AppTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      className={cn(
        // Enhanced size variants with modern type scale
        size === 'xs' && 'text-xs leading-4',
        size === 'sm' && 'text-sm leading-5',
        size === 'base' && 'text-base leading-6',
        size === 'lg' && 'text-lg leading-7',
        size === 'xl' && 'text-xl leading-8',
        size === '2xl' && 'text-2xl leading-9 tracking-tight',
        size === '3xl' && 'text-3xl leading-10 tracking-tight',
        size === '4xl' && 'leading-11 text-4xl tracking-tighter',
        size === 'display' && 'text-5xl leading-tight tracking-tighter',

        // Weight variants with improved hierarchy
        weight === 'normal' && 'font-normal',
        weight === 'medium' && 'font-medium',
        weight === 'semibold' && 'font-semibold',
        weight === 'bold' && 'font-bold',

        // Updated color system for light theme
        color === 'primary' && 'text-primary',
        color === 'secondary' && 'text-secondary',
        color === 'tertiary' && 'text-tertiary',
        color === 'quaternary' && 'text-quaternary',
        color === 'text' && 'text-text',
        color === 'accent' && 'text-accent',
        color === 'success' && 'text-green-600',
        color === 'error' && 'text-red-600',
        color === 'white' && 'text-white',

        // Alignment with improved spacing
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',

        // Enhanced base styles
        'font-sans tracking-wide antialiased',
        className
      )}
      {...props}>
      {children}
    </Text>
  );
}
