import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

type Option = {
  id: string;
  label: string;
  emoji: string;
};

type Screen = {
  id: string;
  title: string;
  subtitle: string;
  type: 'welcome' | 'options' | 'carousel' | 'grid';
  options?: Option[];
};

const screens: Screen[] = [
  {
    id: 'welcome',
    title: "Let's plan your perfect trip",
    subtitle: "We'll help you create unforgettable experiences",
    type: 'welcome',
  },
  {
    id: 'vibe',
    title: 'Choose Your Travel Vibe',
    subtitle: 'What kind of adventure speaks to you?',
    type: 'options',
    options: [
      { id: 'aesthetic', label: 'Aesthetic', emoji: '🎨' },
      { id: 'chill', label: 'Chill', emoji: '🏖️' },
      { id: 'thrill', label: 'Thrill', emoji: '🏃' },
      { id: 'festivals', label: 'Festivals', emoji: '🎉' },
      { id: 'trendy', label: 'Trendy', emoji: '✨' },
    ],
  },
  {
    id: 'companions',
    title: "Who's Traveling?",
    subtitle: 'Choose your travel companions',
    type: 'carousel',
    options: [
      { id: 'solo', label: 'Solo', emoji: '👤' },
      { id: 'couple', label: 'Partner', emoji: '👫' },
      { id: 'friends', label: 'Besties', emoji: '👥' },
      { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    ],
  },
  {
    id: 'purpose',
    title: 'Why Do You Travel?',
    subtitle: 'Select what interests you most',
    type: 'grid',
    options: [
      { id: 'nature', label: 'Nature', emoji: '🌿' },
      { id: 'art', label: 'Art', emoji: '🎨' },
      { id: 'culture', label: 'Culture', emoji: '🏛️' },
      { id: 'work', label: 'Work', emoji: '💼' },
      { id: 'volunteer', label: 'Volunteer', emoji: '❤️' },
    ],
  },
];

type OptionCardProps = {
  emoji: string;
  label: string;
  selected?: boolean;
};

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const currentScreen = screens[currentStep];

  const OptionCard = ({ emoji, label, selected = false }: OptionCardProps) => (
    <TouchableOpacity
      className={`m-2 rounded-2xl p-4 ${selected ? 'bg-primary/20' : 'bg-secondary/10'}`}>
      <View className="items-center space-y-3">
        <AppText size="3xl">{emoji}</AppText>
        <AppText size="lg" color="primary" className="text-center">
          {label}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (currentScreen.type) {
      case 'welcome':
        return (
          <View className="flex-1 items-center justify-center p-6">
            <View className="mb-8">
              <AppText size="4xl" weight="bold" color="primary" className="mb-4 text-center">
                {currentScreen.title}
              </AppText>
              <AppText size="lg" color="secondary" className="text-center opacity-80">
                {currentScreen.subtitle}
              </AppText>
            </View>
            <Button
              title="Let's Go"
              onPress={() => setCurrentStep((curr) => curr + 1)}
              className="bg-primary rounded-full px-8 py-4"
            />
          </View>
        );

      case 'carousel':
        return (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}>
            {currentScreen.options?.map((option) => (
              <OptionCard key={option.id} emoji={option.emoji} label={option.label} />
            ))}
          </ScrollView>
        );

      default:
        return (
          <View className="flex-row flex-wrap justify-center">
            {currentScreen.options?.map((option) => (
              <View key={option.id} className="w-[45%]">
                <OptionCard emoji={option.emoji} label={option.label} />
              </View>
            ))}
          </View>
        );
    }
  };

  return (
    <View className="bg-quinary flex-1">
      {/* Progress Dots */}
      <View className="flex-row justify-center py-6">
        {screens.map((_, index) => (
          <View
            key={index}
            className={`mx-1 h-2 rounded-full ${
              currentStep === index ? 'bg-primary w-4' : 'bg-secondary w-2'
            }`}
          />
        ))}
      </View>

      {/* Screen Title */}
      {currentScreen.type !== 'welcome' && (
        <View className="mb-8 px-6">
          <AppText size="3xl" weight="bold" color="primary" className="mb-2 text-center">
            {currentScreen.title}
          </AppText>
          <AppText size="lg" color="secondary" className="text-center opacity-80">
            {currentScreen.subtitle}
          </AppText>
        </View>
      )}

      {/* Screen Content */}
      {renderContent()}

      {/* Navigation */}
      {currentScreen.type !== 'welcome' && (
        <View className="p-6">
          <Button
            title={currentStep === screens.length - 1 ? "Let's Start" : 'Continue'}
            onPress={() => setCurrentStep((curr) => curr + 1)}
            className="bg-primary rounded-full px-8 py-4"
          />
        </View>
      )}
    </View>
  );
}
