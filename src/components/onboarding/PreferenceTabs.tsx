import 'nativewind';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import { EditPreferencesModal } from './EditPreferencesModal';

import { AppText, Tabs } from '@/src/components/ui';
import { PreferencesType, sections, BudgetPreference } from '@/src/types/preferences';
import { TabItem } from '@/src/types/tabs';
import { useTravelPreferencesStore } from '@/store/store';

// Style native components with class name props enabled
const StyledView = View as typeof View & { className?: string };
const StyledTouchableOpacity = TouchableOpacity as typeof TouchableOpacity & { className?: string };
const StyledScrollView = ScrollView as typeof ScrollView & { className?: string };

type PreferenceItemProps = {
  value: string;
  onRemove: () => void;
};

const PreferenceItem = ({ value, onRemove }: PreferenceItemProps) => (
  <StyledTouchableOpacity
    onPress={onRemove}
    className="mb-2 mr-2 flex-row items-center rounded-full bg-primary/20 px-4 py-2">
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
    <StyledView className="rounded-xl bg-quaternary/10 p-4">
      <StyledView className="mb-4 flex-row items-center justify-between">
        <StyledView className="flex-row items-center">
          <AppText size="xl" className="mr-2">
            {sections[activeTab].emoji}
          </AppText>
          <AppText size="lg" weight="bold" color="primary">
            {sections[activeTab].title}
          </AppText>
        </StyledView>
        <StyledTouchableOpacity onPress={onEdit} className="rounded-full bg-secondary/20 p-2">
          <MaterialCommunityIcons name="pencil" size={20} color="#C5E7E3" />
        </StyledTouchableOpacity>
      </StyledView>

      {activeTab === 'budget' && isBudgetPreference(values) ? (
        <StyledView className="flex-row flex-wrap">
          <StyledView className="mb-2 mr-2 rounded-full bg-primary/20 px-4 py-2">
            <AppText size="sm" color="primary" weight="medium">
              {getBudgetRangeText(values.amount)}
            </AppText>
          </StyledView>
          <StyledView className="mb-2 mr-2 rounded-full bg-primary/20 px-4 py-2">
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

  // Convert sections to TabItem format for the Tabs component
  const tabItems: TabItem[] = Object.entries(sections).map(([key, section]) => ({
    id: key,
    label: section.title,
    icon: section.emoji,
  }));

  const handleUpdatePreferences = async (
    type: keyof PreferencesType,
    values: string[] | BudgetPreference
  ) => {
    await updatePreferences({ [type]: values } as Partial<PreferencesType>);
  };

  const handleEditTab = (section: keyof typeof sections) => {
    setEditingSection(section);
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
      <StyledView className="mx-4 rounded-xl border-tertiary/10 bg-quaternary/10">
        <Tabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={(tabId) => onTabChange(tabId as keyof typeof sections)}
          variant="underline"
          size="md"
        />
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
