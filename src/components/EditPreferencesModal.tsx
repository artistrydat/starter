import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { PreferencesType, sections } from '@/src/types/preferences';

type EditPreferencesModalProps = {
  visible: boolean;
  onClose: () => void;
  section: keyof typeof sections;
  currentValues: string[] | { amount: number; style: string[] };
  onSave: (
    type: keyof PreferencesType,
    values: string[] | { amount: number; style: string[] },
  ) => Promise<void>;
};

export function EditPreferencesModal({
  visible,
  onClose,
  section,
  currentValues,
  onSave,
}: EditPreferencesModalProps) {
  const [values, setValues] = useState<string[] | { amount: number; style: string[] }>(currentValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef<View>(null);

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const handleSliderPress = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    if (sliderWidth > 0) {
      const percentage = Math.min(Math.max((locationX / sliderWidth) * 100, 0), 100);
      if (section === 'budget') {
        setValues((prev) => ({
          ...(prev as { amount: number; style: string[] }),
          amount: Math.round(percentage),
          style: [getBudgetCategory(Math.round(percentage))]
        }));
      }
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event) => handleSliderPress(event),
  });

  const getBudgetCategory = (range: number) => {
    if (range < 33) return 'budget';
    if (range < 66) return 'mid_range';
    return 'luxury';
  };

  const getBudgetRangeText = (range: number) => {
    if (range < 33) {
      return 'Budget ($30-100/day)';
    } else if (range < 66) {
      return 'Mid-Range ($100-300/day)';
    } else {
      return 'Luxury ($300+/day)';
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave(section, values);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-[90%] max-w-md">
          <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-3xl">
            <View className="p-6">
              {/* Header */}
              <View className="mb-6 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <AppText size="xl" className="mr-2">
                    {sections[section].emoji}
                  </AppText>
                  <AppText size="xl" weight="bold" color="primary">
                    Edit {sections[section].title}
                  </AppText>
                </View>
                <TouchableOpacity onPress={onClose} className="bg-quaternary/20 rounded-full p-2">
                  <MaterialCommunityIcons name="close" size={24} color="#C5E7E3" />
                </TouchableOpacity>
              </View>

              {/* Budget Amount Slider */}
              {section === 'budget' && (
                <View className="mb-4">
                  <AppText size="sm" color="primary" className="mb-2">
                    Daily Budget Range
                  </AppText>
                  <View
                    ref={sliderRef}
                    onLayout={handleSliderLayout}
                    className="h-8 justify-center"
                    {...panResponder.panHandlers}
                  >
                    <View className="bg-quaternary/20 h-2 rounded-full">
                      <View
                        className="bg-primary absolute bottom-0 top-0 rounded-full"
                        style={{
                          width: `${(values as { amount: number; style: string[] }).amount}%`,
                        }}
                      />
                      <View
                        className="bg-primary absolute -top-2 h-6 w-6 rounded-full"
                        style={{
                          left: `${(values as { amount: number; style: string[] }).amount}%`,
                          transform: [{ translateX: -12 }],
                        }}
                      />
                    </View>
                  </View>
                  <AppText size="sm" color="secondary" align="center" className="mt-2">
                    {getBudgetRangeText((values as { amount: number; style: string[] }).amount)}
                  </AppText>
                </View>
              )}

              {/* Current Values */}
              <ScrollView className="mb-4 max-h-[200px]" showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap">
                  {section === 'budget' && (
                    <View className="bg-primary/20 mb-2 mr-2 flex-row items-center rounded-full px-3 py-2">
                      <AppText size="sm" color="primary" weight="medium">
                        {(values as { amount: number; style: string[] }).style[0]}
                      </AppText>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View className="flex-row space-x-2">
                <Button
                  title="Cancel"
                  theme="secondary"
                  size="lg"
                  onPress={onClose}
                  className="flex-1"
                />
                <Button
                  title={isSubmitting ? 'Saving...' : 'Save Changes'}
                  theme="primary"
                  size="lg"
                  onPress={handleSave}
                  disabled={isSubmitting}
                  className="flex-1"
                />
              </View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
