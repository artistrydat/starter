import { useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, TouchableOpacity, View } from 'react-native';

import { AppText, Button } from '@/src/components/ui';
import { sections, PreferencesType } from '@/src/types/preferences';

type OnboardingStepType = {
  id: keyof PreferencesType;
  type: 'options' | 'slider';
};

const STEPS: OnboardingStepType[] = [
  { id: 'budget', type: 'slider' },
  { id: 'travel_vibe', type: 'options' },
  { id: 'travel_companion', type: 'options' },
  { id: 'travel_purpose', type: 'options' },
  { id: 'food_preferences', type: 'options' },
  { id: 'tech_preferences', type: 'options' },
];

interface OnboardingProps {
  onComplete: (preferences: PreferencesType, budgetRange: number) => void;
}

export const OnboardingScreen = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<PreferencesType>>({});
  const [budgetRange, setBudgetRange] = useState(50);
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef<View>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const handleSliderPress = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    if (sliderWidth > 0) {
      const percentage = Math.min(Math.max((locationX / sliderWidth) * 100, 0), 100);
      setBudgetRange(Math.round(percentage));
      updateBudgetPreference(Math.round(percentage));
    }
  };

  const getBudgetAmount = (range: number): string => {
    if (range < 33) {
      return `$${Math.round(30 + range * 2.12)}`; // $30-100 range
    } else if (range < 66) {
      return `$${Math.round(100 + (range - 33) * 6.06)}`; // $100-300 range
    }
    return `$${Math.round(300 + (range - 66) * 10.61)}`; // $300+ range
  };

  const getBudgetCategory = (range: number): string => {
    if (range < 33) return 'budget';
    if (range < 66) return 'mid_range';
    return 'luxury';
  };

  const updateBudgetPreference = (range: number) => {
    setPreferences((prev) => ({
      ...prev,
      budget: {
        amount: range,
        style: [getBudgetCategory(range)],
      },
    }));
  };

  const toggleOption = (section: keyof PreferencesType, optionId: string) => {
    setPreferences((prev) => {
      const current = (prev[section] as string[]) || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [section]: updated };
    });
  };

  const currentSection = sections[STEPS[currentStep].id];
  const step = STEPS[currentStep];

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      onComplete(preferences as PreferencesType, budgetRange);
    } else {
      setCurrentStep((curr) => curr + 1);
    }
  };

  return (
    <View className="bg-background flex-1">
      <View className="flex-1 p-6">
        <AppText size="2xl" weight="bold" color="text" className="mb-2">
          {currentSection.emoji} {currentSection.title}
        </AppText>
        <AppText size="lg" weight="bold" color="text" className="mb-4">
          {step.type === 'slider' ? "What's your typical travel budget?" : 'Select all that apply'}
        </AppText>

        {step.type === 'slider' ? (
          <>
            <View ref={sliderRef} onLayout={handleLayout} className="relative h-8 justify-center">
              <View className="absolute left-0 right-0 top-3 h-2 rounded-full bg-quaternary/20">
                <View
                  className="absolute bottom-0 left-0 top-0 rounded-full bg-quaternary/60"
                  style={{ width: `${budgetRange}%` }}
                />
                <TouchableOpacity
                  onPress={handleSliderPress}
                  className="absolute -top-3 h-8 w-8 rounded-full border-2 border-white bg-primary shadow-sm"
                  style={{ left: `${budgetRange}%`, transform: [{ translateX: -16 }] }}
                />
              </View>
            </View>

            <View className="mt-6 flex-row justify-between">
              <View>
                <AppText color="text" size="sm">
                  Budget
                </AppText>
                <AppText color="text" size="sm" className="font-medium">
                  $30/day
                </AppText>
              </View>
              <View>
                <AppText color="text" size="sm" align="right">
                  Luxury
                </AppText>
                <AppText color="text" size="sm" align="right" className="font-medium">
                  $300+/day
                </AppText>
              </View>
            </View>

            <AppText size="lg" weight="bold" color="primary" className="mt-8">
              {getBudgetAmount(budgetRange)}/day
            </AppText>
          </>
        ) : (
          <View className="flex-row flex-wrap">
            {currentSection.options?.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggleOption(step.id, option.id)}
                className={`mb-4 mr-4 flex-row items-center rounded-full px-4 py-2 ${
                  (preferences[step.id] as string[] | undefined)?.includes(option.id)
                    ? 'bg-primary'
                    : 'bg-tertiary'
                }`}>
                <AppText size="lg" className="mr-2">
                  {option.emoji}
                </AppText>
                <AppText
                  size="base"
                  color={
                    (preferences[step.id] as string[] | undefined)?.includes(option.id)
                      ? 'white'
                      : 'text'
                  }>
                  {option.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View className="border-t border-quaternary/10 bg-tertiary p-6">
        <Button
          title={currentStep === STEPS.length - 1 ? 'Complete' : 'Continue'}
          className="bg-primary"
          color="white"
          size="lg"
          onPress={handleNext}
        />
      </View>
    </View>
  );
};
