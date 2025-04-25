import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';

import { TabsProps } from '@/src/types/tabs';
import { cn } from '@/src/utils/cn';

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
}) => {
  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-1 px-2';
      case 'lg':
        return 'py-3 px-6';
      case 'md':
      default:
        return 'py-2 px-4';
    }
  };

  // Tab item styles based on variant
  const getTabItemStyles = (isActive: boolean) => {
    const baseStyles = cn('flex-row items-center justify-center', getSizeStyles());

    switch (variant) {
      case 'pills':
        return cn(
          baseStyles,
          'rounded-full mx-1',
          isActive ? 'bg-primary text-quinary' : 'bg-tertiary text-text'
        );
      case 'underline':
        return cn(
          baseStyles,
          'border-b-2 mx-1',
          isActive ? 'border-primary text-primary' : 'border-transparent text-text'
        );
      case 'default':
      default:
        return cn(
          baseStyles,
          'rounded-md mx-1',
          isActive ? 'bg-primary text-quinary' : 'bg-transparent text-text'
        );
    }
  };

  // Text styles based on active state and size
  const getTextStyles = (isActive: boolean) => {
    const baseStyles = 'font-sans';

    // Text size based on tab size
    const sizeStyles = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-base';

    // Text color based on active state and variant
    const colorStyles =
      variant === 'underline'
        ? isActive
          ? 'text-primary'
          : 'text-text'
        : isActive
          ? 'text-quinary'
          : 'text-text';

    return cn(baseStyles, sizeStyles, colorStyles);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className={cn('py-2', className)}>
      <View className={cn('flex-row', fullWidth ? 'w-full justify-between' : 'justify-start')}>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              className={getTabItemStyles(isActive)}
              style={fullWidth ? { flex: 1 } : {}}>
              {item.icon && <Text className="mr-1">{item.icon}</Text>}
              <Text className={getTextStyles(isActive)}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};
