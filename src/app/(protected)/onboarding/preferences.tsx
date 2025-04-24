import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';

const preferenceSections = [
  {
    type: 'travel_vibe',
    title: 'Choose Your Travel Vibe',
    subtitle: 'What kind of adventure speaks to you?',
    options: [
      { id: 'aesthetic', label: 'Aesthetic', emoji: '🎨' },
      { id: 'chill', label: 'Chill', emoji: '🏖️' },
      { id: 'thrill', label: 'Thrill', emoji: '🏃' },
      { id: 'festivals', label: 'Festivals', emoji: '🎉' },
      { id: 'trendy', label: 'Trendy', emoji: '✨' },
    ],
  },
  {
    type: 'travel_companion',
    title: "Who's Traveling?",
    subtitle: 'Choose your travel companions',
    options: [
      { id: 'solo', label: 'Solo', emoji: '👤' },
      { id: 'couple', label: 'Partner', emoji: '👫' },
      { id: 'friends', label: 'Besties', emoji: '👥' },
      { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    ],
  },
  {
    type: 'travel_purpose',
    title: 'Why Do You Travel?',
    subtitle: 'Select what interests you most',
    options: [
      { id: 'nature', label: 'Nature', emoji: '🌿' },
      { id: 'art', label: 'Art', emoji: '🎨' },
      { id: 'culture', label: 'Culture', emoji: '🏛️' },
      { id: 'work', label: 'Work', emoji: '💼' },
      { id: 'volunteer', label: 'Volunteer', emoji: '❤️' },
    ],
  },
];

type PreferencesType = {
  travel_vibe: string[];
  travel_companion: string[];
  travel_purpose: string[];
};

export default function PreferencesScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<PreferencesType>({
    travel_vibe: [],
    travel_companion: [],
    travel_purpose: [],
  });

  const currentSection = preferenceSections[currentStep];
  const sectionType = currentSection.type as keyof PreferencesType;

  const handleSelection = (type: keyof PreferencesType, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  const handleNext = () => {
    if (currentStep < preferenceSections.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push({
        pathname: '/onboarding/completion',
        params: { preferences: JSON.stringify(preferences) },
      });
    }
  };

  const OptionCard = ({
    emoji,
    label,
    selected = false,
    onPress,
  }: {
    emoji: string;
    label: string;
    selected?: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      className={`m-2 rounded-2xl p-4 ${selected ? 'bg-primary/20' : 'bg-secondary/10'}`}
      onPress={onPress}>
      <View className="items-center space-y-3">
        <AppText size="3xl">{emoji}</AppText>
        <AppText size="lg" color="primary" className="text-center">
          {label}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="bg-quinary flex-1">
      {/* Progress Dots */}
      <View className="flex-row justify-center py-6">
        {preferenceSections.map((_, index) => (
          <View
            key={index}
            className={`mx-1 h-2 rounded-full ${
              currentStep === index ? 'bg-primary w-4' : 'bg-secondary w-2'
            }`}
          />
        ))}
      </View>

      {/* Screen Title */}
      <View className="mb-8 px-6">
        <AppText size="3xl" weight="bold" color="primary" className="mb-2 text-center">
          {currentSection.title}
        </AppText>
        <AppText size="lg" color="secondary" className="text-center opacity-80">
          {currentSection.subtitle}
        </AppText>
      </View>

      {/* Options Grid */}
      <View className="flex-1 px-4">
        <View className="flex-row flex-wrap justify-center">
          {currentSection.options.map((option) => (
            <View key={option.id} className="w-[45%]">
              <OptionCard
                emoji={option.emoji}
                label={option.label}
                selected={preferences[sectionType].includes(option.id)}
                onPress={() => handleSelection(sectionType, option.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View className="p-6">
        <Button
          title={currentStep === preferenceSections.length - 1 ? "Let's Start" : 'Continue'}
          onPress={handleNext}
          className="bg-primary rounded-full px-8 py-4"
        />
      </View>
    </View>
  );
}
