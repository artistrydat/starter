import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import { AppText } from './AppText';
import { EditPreferencesModal } from './EditPreferencesModal';

import { PreferencesType, sections, BudgetPreference } from '@/src/types/preferences';
import { useTravelPreferencesStore } from '@/store/store';

type TabButtonProps = {
  section: keyof typeof sections;
  isActive: boolean;
  hasValues: boolean;
  onPress: () => void;
};

const TabButton = ({ section, isActive, hasValues, onPress }: TabButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center border-b-2 px-4 py-3 ${
      isActive ? 'bg-quaternary border-secondary' : 'hover:bg-quaternary/10 border-transparent'
    }`}>
    <View className="relative">
      <AppText size="sm" className="mr-2">
        {sections[section].emoji}
      </AppText>
      {hasValues && <View className="bg-secondary absolute -right-1 -top-1 h-2 w-2 rounded-full" />}
    </View>
    <AppText
      size="sm"
      weight={isActive ? 'bold' : 'normal'}
      color={isActive ? 'secondary' : 'primary'}>
      {sections[section].title}
    </AppText>
  </TouchableOpacity>
);

type PreferenceItemProps = {
  value: string;
  onRemove: () => void;
};

const PreferenceItem = ({ value, onRemove }: PreferenceItemProps) => (
  <TouchableOpacity
    onPress={onRemove}
    className="bg-primary/20 mb-2 mr-2 flex-row items-center rounded-full px-4 py-2">
    <AppText size="sm" color="primary" weight="medium" className="mr-2">
      {value}
    </AppText>
    <MaterialCommunityIcons name="close" size={16} color="#FF6B6B" />
  </TouchableOpacity>
);

const isBudgetPreference = (value: unknown): value is BudgetPreference => {
  return typeof value === 'object' && value !== null && 'amount' in value && 'style' in value;
};

const getPreferenceValue = (
  preferences: PreferencesType,
  section: keyof typeof sections
): string[] | BudgetPreference | undefined => {
  return preferences[section as keyof PreferencesType];
};

type TabContentProps = {
  activeTab: keyof typeof sections;
  values: string[] | BudgetPreference;
  onUpdatePreferences: (type: keyof PreferencesType, values: string[] | BudgetPreference) => void;
  onEdit: () => void;
};

const TabContent = ({ activeTab, values, onUpdatePreferences, onEdit }: TabContentProps) => {
  const getBudgetRangeText = (range: number) => {
    if (range < 33) {
      return 'Budget ($30-100/day)';
    } else if (range < 66) {
      return 'Mid-Range ($100-300/day)';
    } else {
      return 'Luxury ($300+/day)';
    }
  };

  return (
    <View className="bg-quaternary/10 rounded-xl p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <AppText size="xl" className="mr-2">
            {sections[activeTab].emoji}
          </AppText>
          <AppText size="lg" weight="bold" color="primary">
            {sections[activeTab].title}
          </AppText>
        </View>
        <TouchableOpacity onPress={onEdit} className="bg-secondary/20 rounded-full p-2">
          <MaterialCommunityIcons name="pencil" size={20} color="#C5E7E3" />
        </TouchableOpacity>
      </View>

      {activeTab === 'budget' && isBudgetPreference(values) ? (
        <View className="flex-row flex-wrap">
          <View className="bg-primary/20 mb-2 mr-2 rounded-full px-4 py-2">
            <AppText size="sm" color="primary" weight="medium">
              {getBudgetRangeText(values.amount)}
            </AppText>
          </View>
          <View className="bg-primary/20 mb-2 mr-2 rounded-full px-4 py-2">
            <AppText size="sm" color="primary" weight="medium">
              {values.style[0]}
            </AppText>
          </View>
        </View>
      ) : Array.isArray(values) && values.length > 0 ? (
        <View className="flex-row flex-wrap">
          {values.map((value) => (
            <PreferenceItem
              key={value}
              value={value}
              onRemove={() => {
                const newValues = values.filter((v) => v !== value);
                onUpdatePreferences(activeTab, newValues);
              }}
            />
          ))}
        </View>
      ) : (
        <View className="items-center py-8">
          <AppText size="lg" color="tertiary" align="center">
            No preferences added yet.{'\n'}Click the edit button to add some!
          </AppText>
        </View>
      )}
    </View>
  );
};

type PreferenceTabsProps = {
  activeTab: keyof typeof sections;
  onTabChange: (tab: keyof typeof sections) => void;
};

export const PreferenceTabs = ({ activeTab, onTabChange }: PreferenceTabsProps) => {
  const { preferences, isLoading, error, fetchPreferences, updatePreferences } =
    useTravelPreferencesStore();

  const [editingSection, setEditingSection] = useState<keyof typeof sections | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleUpdatePreferences = async (
    type: keyof PreferencesType,
    values: string[] | BudgetPreference
  ) => {
    await updatePreferences({ [type]: values } as Partial<PreferencesType>);
  };

  const handleEditTab = (section: keyof typeof sections) => {
    setEditingSection(section);
  };

  const hasValues = (section: keyof PreferencesType) => {
    const value = getPreferenceValue(preferences, section);
    if (!value) return false;
    if (section === 'budget' && isBudgetPreference(value)) {
      return value.style.length > 0;
    }
    return Array.isArray(value) && value.length > 0;
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#C5E7E3" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <AppText color="error" size="lg">
          {error}
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="border-tertiary/10 bg-quaternary/10 mx-4 rounded-xl">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}>
          <View className="flex-row">
            {Object.entries(sections).map(([key]) => {
              const section = key as keyof typeof sections;
              return (
                <TabButton
                  key={key}
                  section={section}
                  isActive={activeTab === section}
                  hasValues={hasValues(section)}
                  onPress={() => onTabChange(section)}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="mt-4">
          <TabContent
            activeTab={activeTab}
            values={
              activeTab === 'budget'
                ? (getPreferenceValue(preferences, activeTab) as BudgetPreference)
                : ((getPreferenceValue(preferences, activeTab) ?? []) as string[])
            }
            onUpdatePreferences={handleUpdatePreferences}
            onEdit={() => handleEditTab(activeTab)}
          />
        </View>
      </ScrollView>

      {editingSection && (
        <EditPreferencesModal
          visible
          section={editingSection}
          currentValues={
            editingSection === 'budget'
              ? (getPreferenceValue(preferences, editingSection) as BudgetPreference)
              : ((getPreferenceValue(preferences, editingSection) ?? []) as string[])
          }
          onSave={handleUpdatePreferences}
          onClose={() => setEditingSection(null)}
        />
      )}
    </View>
  );
};
