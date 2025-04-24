import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { AppText } from './AppText';

export type PreferencesType = {
  travel_vibe: string[];
  travel_companion: string[];
  travel_purpose: string[];
  budget_style: string[];
  food_preferences: string[];
  tech_preferences: string[];
};

export const sections = {
  travel_vibe: { title: 'Travel Vibe', emoji: '🎨' },
  travel_companion: { title: 'Companions', emoji: '👥' },
  travel_purpose: { title: 'Goals', emoji: '🎯' },
  budget_style: { title: 'Budget', emoji: '💰' },
  food_preferences: { title: 'Food', emoji: '🍽️' },
  tech_preferences: { title: 'Tech', emoji: '📱' },
};

type TabButtonProps = {
  section: keyof typeof sections;
  isActive: boolean;
  onPress: () => void;
};

const TabButton = ({ section, isActive, onPress }: TabButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center px-3 py-2 ${isActive ? 'bg-quaternary border-secondary border-b-2' : 'border-b-2 border-transparent'}`}>
    <AppText size="sm" className="mr-2">
      {sections[section].emoji}
    </AppText>
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
};

const PreferenceItem = ({ value }: PreferenceItemProps) => (
  <View className="bg-primary/50 mb-2 mr-2 rounded-full px-3 py-1">
    <AppText size="sm" color="primary" weight="medium">
      {value}
    </AppText>
  </View>
);

type TabContentProps = {
  activeTab: keyof typeof sections;
  values: string[];
};

const TabContent = ({ activeTab, values }: TabContentProps) => (
  <View className="bg-quaternary/10 rounded-xl p-4">
    <View className="mb-4 flex-row items-center">
      <AppText size="xl" className="mr-2">
        {sections[activeTab].emoji}
      </AppText>
      <AppText size="lg" weight="bold" color="primary">
        {sections[activeTab].title}
      </AppText>
    </View>
    <View className="flex-row flex-wrap">
      {values.map((value) => (
        <PreferenceItem key={value} value={value} />
      ))}
    </View>
  </View>
);

type PreferenceTabsProps = {
  preferences: PreferencesType;
  activeTab: keyof typeof sections;
  onTabChange: (tab: keyof typeof sections) => void;
};

export const PreferenceTabs = ({ preferences, activeTab, onTabChange }: PreferenceTabsProps) => {
  return (
    <View className="flex-1">
      <View className="border-tertiary/10 bg-quaternary/10 mx-4 rounded-xl">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row px-4">
            {Object.entries(preferences).map(
              ([key, values]) =>
                Array.isArray(values) &&
                values.length > 0 && (
                  <TabButton
                    key={key}
                    section={key as keyof typeof sections}
                    isActive={activeTab === key}
                    onPress={() => onTabChange(key as keyof typeof sections)}
                  />
                )
            )}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        {Array.isArray(preferences[activeTab]) && preferences[activeTab].length > 0 && (
          <View className="mt-4">
            <TabContent activeTab={activeTab} values={preferences[activeTab]} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};
