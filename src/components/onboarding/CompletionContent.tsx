import React from 'react';
import { View } from 'react-native';

import { AppText, Button } from '@/src/components/ui';
import { PreferencesType, sections } from '@/src/types/preferences';

/**
 * CompletionContent - Pure UI component for displaying the onboarding completion screen
 * No data fetching or source-specific logic included
 */
type CompletionContentProps = {
  preferences: Partial<PreferencesType>;
  budgetRange: number;
  isLoading: boolean;
  onComplete: () => void;
};

export const CompletionContent = ({
  preferences,
  budgetRange,
  isLoading,
  onComplete,
}: CompletionContentProps) => {
  // Helper function to get budget range text based on the range value
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
    <View className="flex-1 bg-background p-6">
      <View className="flex-1 items-center">
        <View className="mb-8">
          <View className="h-64 w-64 items-center justify-center">
            <AppText size="4xl">🎉</AppText>
          </View>
        </View>

        <View className="rounded-3xl bg-tertiary p-8 shadow-sm">
          <View className="items-center space-y-4">
            <AppText size="3xl" weight="bold" color="text" align="center">
              Your travel profile is set! ✨
            </AppText>

            <AppText size="lg" color="text" align="center" className="max-w-[280px] opacity-80">
              We've got everything we need to make your trips amazing
            </AppText>

            <View className="mt-6 w-full">
              {Object.entries(preferences).map(([key, values]) => {
                const sectionKey = key as keyof typeof sections;
                if (!sections[sectionKey] || key === 'budget' || (values as string[]).length === 0)
                  return null;

                return (
                  <View key={key} className="mb-4">
                    <View className="flex-row items-center">
                      <AppText size="lg" className="mr-2">
                        {sections[sectionKey].emoji}
                      </AppText>
                      <AppText size="sm" color="text" className="mb-2 font-medium">
                        {sections[sectionKey].title}
                      </AppText>
                    </View>
                    <View className="flex-row flex-wrap">
                      {(values as string[]).map((value) => (
                        <View
                          key={value}
                          className="mb-2 mr-2 rounded-full bg-quaternary/20 px-4 py-2">
                          <AppText size="sm" color="text" weight="medium">
                            {value}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}

              {/* Display Budget Range and Style */}
              <View className="mb-4">
                <View className="flex-row items-center">
                  <AppText size="lg" className="mr-2">
                    💰
                  </AppText>
                  <AppText size="sm" color="text" className="mb-2 font-medium">
                    Budget Style
                  </AppText>
                </View>
                <View className="flex-row flex-wrap">
                  <View className="mb-2 mr-2 rounded-full bg-quaternary/20 px-4 py-2">
                    <AppText size="sm" color="text" weight="medium">
                      {getBudgetRangeText(budgetRange)}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View>
        <Button
          title={isLoading ? 'Finishing Up...' : 'Show Me Trips ✈️'}
          onPress={onComplete}
          className="rounded-full bg-primary px-8 py-4"
          color="white"
          disabled={isLoading}
        />
      </View>
    </View>
  );
};
