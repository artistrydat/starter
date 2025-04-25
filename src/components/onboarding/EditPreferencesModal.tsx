import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText, Button } from '@/src/components/ui';
import { PreferencesType, sections, BudgetPreference } from '@/src/types/preferences';

type EditPreferencesModalProps = {
  visible: boolean;
  onClose: () => void;
  section: keyof typeof sections;
  currentValues: string[] | BudgetPreference;
  onSave: (type: keyof PreferencesType, values: string[] | BudgetPreference) => Promise<void>;
};

const defaultBudgetPreference: BudgetPreference = {
  amount: 50,
  style: ['Budget'],
};

const isBudgetPreference = (value: unknown): value is BudgetPreference => {
  return typeof value === 'object' && value !== null && 'amount' in value && 'style' in value;
};

export function EditPreferencesModal({
  visible,
  onClose,
  section,
  currentValues,
  onSave,
}: EditPreferencesModalProps) {
  const initialBudgetValues =
    section === 'budget' && isBudgetPreference(currentValues)
      ? currentValues
      : defaultBudgetPreference;

  const [budgetValues, setBudgetValues] = useState<BudgetPreference>(initialBudgetValues);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(currentValues) ? currentValues : []
  );

  const getBudgetCategory = (amount: number): string => {
    if (amount <= 100) return 'Budget';
    if (amount <= 300) return 'Mid-Range';
    return 'Luxury';
  };

  const handleBudgetChange = (text: string) => {
    const amount = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    setBudgetValues({
      amount,
      style: [getBudgetCategory(amount)],
    });
  };

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    try {
      if (section === 'budget') {
        await onSave(section, budgetValues);
      } else {
        await onSave(section, selectedValues);
      }
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
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
                <TouchableOpacity onPress={onClose} className="rounded-full bg-quaternary/20 p-2">
                  <MaterialCommunityIcons name="close" size={24} color="#C5E7E3" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              {section === 'budget' ? (
                <View className="mb-4">
                  <AppText size="sm" color="primary" className="mb-2">
                    Daily Budget Amount ($)
                  </AppText>
                  <TextInput
                    className="mb-2 rounded-lg bg-quaternary/20 px-4 py-3 text-white"
                    keyboardType="numeric"
                    value={String(budgetValues.amount)}
                    onChangeText={handleBudgetChange}
                    placeholder="Enter daily budget"
                    placeholderTextColor="#C5E7E3"
                  />
                  <AppText size="sm" color="secondary" className="mt-2">
                    Category: {budgetValues.style[0]}
                  </AppText>
                </View>
              ) : (
                <ScrollView className="mb-4 max-h-[200px]" showsVerticalScrollIndicator={false}>
                  <View className="flex-row flex-wrap">
                    {sections[section].options?.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => toggleValue(option.id)}
                        className={`mb-2 mr-2 flex-row items-center rounded-full px-3 py-2 ${
                          selectedValues.includes(option.id) ? 'bg-primary' : 'bg-primary/20'
                        }`}>
                        <AppText size="sm" className="mr-2">
                          {option.emoji}
                        </AppText>
                        <AppText
                          size="sm"
                          color={selectedValues.includes(option.id) ? 'secondary' : 'primary'}
                          weight="medium">
                          {option.label}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}

              {/* Action Buttons */}
              <View className="flex-row justify-end">
                <Button title="Save Changes" color="primary" size="sm" onPress={handleSave} />
              </View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
