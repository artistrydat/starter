import 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import { EditPreferencesModal } from './EditPreferencesModal';

import { AppText } from '@/src/components/ui';
import { PreferencesType, sections, BudgetPreference } from '@/src/types/preferences';
import { useTravelPreferencesStore } from '@/store/store';

// Style native components with class name props enabled
const StyledView = View as typeof View & { className?: string };
const StyledTouchableOpacity = TouchableOpacity as typeof TouchableOpacity & { className?: string };
const StyledScrollView = ScrollView as typeof ScrollView & { className?: string };

type TabButtonProps = {
  section: keyof typeof sections;
  isActive: boolean;
  hasValues: boolean;
  onPress: () => void;
};

const TabButton = ({ section, isActive, hasValues, onPress }: TabButtonProps) => (
  <StyledTouchableOpacity
    onPress={onPress}
    className={`flex-row items-center border-b-2 px-4 py-3 ${
      isActive ? 'bg-quaternary border-secondary' : 'hover:bg-quaternary/10 border-transparent'
    }`}>
    <StyledView className="relative">
      <AppText size="sm" className="mr-2">
        {sections[section].emoji}
      </AppText>
      {hasValues && (
        <StyledView className="bg-secondary absolute -right-1 -top-1 h-2 w-2 rounded-full" />
      )}
    </StyledView>
    <AppText
      size="sm"
      weight={isActive ? 'bold' : 'normal'}
      color={isActive ? 'secondary' : 'primary'}>
      {sections[section].title}
    </AppText>
  </StyledTouchableOpacity>
);

type PreferenceItemProps = {
  value: string;
  onRemove: () => void;
};

const PreferenceItem = ({ value, onRemove }: PreferenceItemProps) => (
  <StyledTouchableOpacity
    onPress={onRemove}
    className="bg-primary/20 mb-2 mr-2 flex-row items-center rounded-full px-4 py-2">
    <AppText size="sm" color="primary" weight="medium" className="mr-2">
      {value}
    </AppText>
    <MaterialCommunityIcons name="close" size={16} color="#FF6B6B" />
  </StyledTouchableOpacity>
);

const isBudgetPreference = (value: unknown): value is BudgetPreference => {
  return typeof value === 'object' && value !== null && 'amount' in value && 'style' in value;
};

const defaultBudgetPreference: BudgetPreference = {
  amount: 50,
  style: ['Budget'],
};

const getPreferenceValue = (
  preferences: PreferencesType,
  section: keyof typeof sections
): string[] | BudgetPreference => {
  const value = preferences[section as keyof PreferencesType];
  if (section === 'budget') {
    return (value as BudgetPreference) || defaultBudgetPreference;
  }
  return (value as string[]) || [];
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
    <StyledView className="bg-quaternary/10 rounded-xl p-4">
      <StyledView className="mb-4 flex-row items-center justify-between">
        <StyledView className="flex-row items-center">
          <AppText size="xl" className="mr-2">
            {sections[activeTab].emoji}
          </AppText>
          <AppText size="lg" weight="bold" color="primary">
            {sections[activeTab].title}
          </AppText>
        </StyledView>
        <StyledTouchableOpacity onPress={onEdit} className="bg-secondary/20 rounded-full p-2">
          <MaterialCommunityIcons name="pencil" size={20} color="#C5E7E3" />
        </StyledTouchableOpacity>
      </StyledView>

      {activeTab === 'budget' && isBudgetPreference(values) ? (
        <StyledView className="flex-row flex-wrap">
          <StyledView className="bg-primary/20 mb-2 mr-2 rounded-full px-4 py-2">
            <AppText size="sm" color="primary" weight="medium">
              {getBudgetRangeText(values.amount)}
            </AppText>
          </StyledView>
          <StyledView className="bg-primary/20 mb-2 mr-2 rounded-full px-4 py-2">
            <AppText size="sm" color="primary" weight="medium">
              {values.style[0]}
            </AppText>
          </StyledView>
        </StyledView>
      ) : Array.isArray(values) && values.length > 0 ? (
        <StyledView className="flex-row flex-wrap">
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
        </StyledView>
      ) : (
        <StyledView className="items-center py-8">
          <AppText size="lg" color="tertiary" align="center">
            No preferences added yet.{'\n'}Click the edit button to add some!
          </AppText>
        </StyledView>
      )}
    </StyledView>
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
    if (section === 'budget' && isBudgetPreference(value)) {
      return true; // Budget always has a value
    }
    return Array.isArray(value) && value.length > 0;
  };

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#C5E7E3" />
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 items-center justify-center">
        <AppText color="error" size="lg">
          {error}
        </AppText>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1">
      <StyledView className="border-tertiary/10 bg-quaternary/10 mx-4 rounded-xl">
        <StyledScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}>
          <StyledView className="flex-row">
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
          </StyledView>
        </StyledScrollView>
      </StyledView>

      <StyledScrollView className="flex-1 px-4">
        <StyledView className="mt-4">
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
        </StyledView>
      </StyledScrollView>

      {editingSection && (
        <EditPreferencesModal
          visible
          section={editingSection}
          currentValues={getPreferenceValue(preferences, editingSection)}
          onSave={handleUpdatePreferences}
          onClose={() => setEditingSection(null)}
        />
      )}
    </StyledView>
  );
};
