import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';

import { AppText, Button, Container, Tabs } from '@/src/components/ui';
import { TabItem } from '@/src/types/tabs';

export default function ThirdScreen() {
  const router = useRouter();

  // Sample tabs data
  const tabItems: TabItem[] = [
    { id: 'tab1', label: 'Overview', icon: '📊' },
    { id: 'tab2', label: 'Details', icon: '📝' },
    { id: 'tab3', label: 'Settings', icon: '⚙️' },
    { id: 'tab4', label: 'History', icon: '📅' },
  ];

  const [activeTab, setActiveTab] = useState('tab1');

  // Tab content rendering function
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tab1':
        return (
          <View className="mt-2 rounded-lg bg-tertiary p-2">
            <AppText size="lg" weight="bold" color="primary" className="mb-2">
              Overview Content
            </AppText>
            <AppText color="text" className="mb-3">
              This is the overview section where you can see a summary of all important information.
            </AppText>
            <View className="mb-3 rounded-md border border-primary/20 bg-quinary p-3">
              <AppText weight="medium" color="primary">
                Total Items
              </AppText>
              <AppText size="2xl" weight="bold">
                42
              </AppText>
            </View>
            <View className="mb-3 rounded-md border border-primary/20 bg-quinary p-3">
              <AppText weight="medium" color="primary">
                Active Items
              </AppText>
              <AppText size="2xl" weight="bold">
                28
              </AppText>
            </View>
          </View>
        );
      case 'tab2':
        return (
          <View className="mt-4 rounded-lg bg-tertiary p-4">
            <AppText size="lg" weight="bold" color="primary" className="mb-2">
              Details Content
            </AppText>
            <AppText color="text" className="mb-3">
              Here you can find detailed information about each item in your collection.
            </AppText>
            {[1, 2, 3].map((item) => (
              <View key={item} className="mb-3 rounded-md border border-primary/20 bg-quinary p-3">
                <AppText weight="medium" color="primary">
                  Item #{item}
                </AppText>
                <AppText color="text">Detailed information about item #{item}</AppText>
                <AppText color="accent" size="sm" className="mt-1">
                  Last updated: April 23, 2025
                </AppText>
              </View>
            ))}
          </View>
        );
      case 'tab3':
        return (
          <View className="mt-4 rounded-lg bg-tertiary p-4">
            <AppText size="lg" weight="bold" color="primary" className="mb-2">
              Settings Content
            </AppText>
            <AppText color="text" className="mb-3">
              Configure your preferences and application settings.
            </AppText>
            {['Notifications', 'Display', 'Privacy', 'Account'].map((setting) => (
              <View
                key={setting}
                className="mb-3 flex-row items-center justify-between rounded-md border border-primary/20 bg-quinary p-3">
                <AppText weight="medium" color="text">
                  {setting}
                </AppText>
                <View className="h-6 w-12 rounded-full bg-quaternary" />
              </View>
            ))}
          </View>
        );
      case 'tab4':
        return (
          <View className="mt-4 rounded-lg bg-tertiary p-4">
            <AppText size="lg" weight="bold" color="primary" className="mb-2">
              History Content
            </AppText>
            <AppText color="text" className="mb-3">
              View your activity history and past interactions.
            </AppText>
            {['Today', 'Yesterday', 'Last Week'].map((period) => (
              <View
                key={period}
                className="mb-3 rounded-md border border-primary/20 bg-quinary p-3">
                <AppText weight="medium" color="primary">
                  {period}
                </AppText>
                <View className="my-2 h-px bg-tertiary" />
                <AppText color="text">Activity data for {period.toLowerCase()}</AppText>
                <AppText color="accent" size="sm" className="mt-1">
                  3 activities
                </AppText>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      <AppText size="2xl" weight="bold" color="primary" align="center" className="mb-6 mt-4 px-4">
        Third Screen
      </AppText>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Container>
          <AppText weight="medium" color="text" className="mb-2">
            Tabs Example:
          </AppText>
          <Tabs
            items={tabItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="pills"
            size="lg"
          />

          {renderTabContent()}
        </Container>
      </ScrollView>

      <Button
        title="Back"
        color="secondary"
        size="lg"
        onPress={() => router.back()}
        className="m-4"
      />
    </View>
  );
}
