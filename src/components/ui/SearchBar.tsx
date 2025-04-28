import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';

import { cn } from '@/src/utils/cn';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSearch,
  onClear,
  isSearching = false,
  className,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    onClear();
    inputRef.current?.focus();
  };

  const handleSubmitEditing = () => {
    if (value.trim()) {
      onSearch(value);
      Keyboard.dismiss();
    }
  };

  return (
    <View
      className={cn(
        'flex-row items-center rounded-full border bg-white px-4 py-2',
        isFocused ? 'border-primary' : 'border-gray-200',
        className
      )}>
      {isSearching ? (
        <ActivityIndicator size="small" color="#5BBFB5" className="mr-2" />
      ) : (
        <MaterialCommunityIcons name="magnify" size={20} color="#666" />
      )}

      <TextInput
        ref={inputRef}
        className="flex-1 px-2 py-1 text-base text-gray-800"
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.4)"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="search"
        autoFocus={autoFocus}
        clearButtonMode="never" // iOS only
      />

      {value !== '' && (
        <TouchableOpacity onPress={handleClear} className="ml-1">
          <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
};
