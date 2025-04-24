import { Text } from 'react-native';

import { cn } from '../utils/cn';

type AppTextProps = {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'display';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'error';
  align?: 'left' | 'center' | 'right';
  className?: string;
  numberOfLines?: number;
};

export function AppText({
  children,
  size = 'base',
  weight = 'normal',
  color = 'primary',
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

        // Enhanced color system with semantic meanings
        color === 'primary' && 'text-quaternary dark:text-primary',
        color === 'secondary' && 'text-tertiary/90 dark:text-secondary/90',
        color === 'tertiary' && 'text-quaternary/70 dark:text-primary/70',
        color === 'accent' && 'text-secondary dark:text-secondary',
        color === 'success' && 'text-green-600 dark:text-green-400',
        color === 'error' && 'text-red-600 dark:text-red-400',

        // Alignment with improved spacing
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',

        // Enhanced base styles
        'font-sans tracking-wide antialiased',
        'selection:bg-primary/20',
        className
      )}
      {...props}>
      {children}
    </Text>
  );
}
