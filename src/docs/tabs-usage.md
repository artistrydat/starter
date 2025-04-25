# Tabs Component Usage Guide

The Tabs component allows you to create tabbed interfaces with various styling options to fit your UI needs throughout the Vibe app.

## Basic Usage

```tsx
import { useState } from 'react';
import { Tabs } from '@/src/components/ui';
import { TabItem } from '@/src/types/tabs';

// Define your tab items
const tabItems: TabItem[] = [
  { id: 'tab1', label: 'First Tab', icon: '✨' },
  { id: 'tab2', label: 'Second Tab', icon: '🔍' },
  { id: 'tab3', label: 'Third Tab', icon: '📊' },
];

// Initialize active tab state
const [activeTab, setActiveTab] = useState('tab1');

// Use the Tabs component in your JSX
<Tabs
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Render content based on active tab
const renderContent = () => {
  switch (activeTab) {
    case 'tab1':
      return <YourFirstTabContent />;
    case 'tab2':
      return <YourSecondTabContent />;
    case 'tab3':
      return <YourThirdTabContent />;
    default:
      return null;
  }
};

// Then in your JSX:
{renderContent()}
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | Required | Array of tab items to display |
| `activeTab` | `string` | Required | ID of the currently active tab |
| `onTabChange` | `(tabId: string) => void` | Required | Function called when tab is changed |
| `variant` | `'default' \| 'pills' \| 'underline'` | `'default'` | Visual style of tabs |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the tabs |
| `fullWidth` | `boolean` | `false` | Whether tabs should fill the available width |
| `className` | `string` | `undefined` | Additional CSS classes for the tabs container |

## Tab Item Interface

```tsx
interface TabItem {
  id: string;      // Unique ID for the tab
  label: string;   // Display text for the tab
  icon?: string;   // Optional icon or emoji for the tab
}
```

## Styling Variants

### Default

```tsx
<Tabs
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"
/>
```

The default variant displays tabs as rectangular buttons with a primary color background for the active tab.

### Pills

```tsx
<Tabs
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills"
/>
```

The pills variant displays tabs as rounded pill-shaped buttons, with a primary color background for the active tab.

### Underline

```tsx
<Tabs
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline"
/>
```

The underline variant displays tabs with a bottom border for the active tab. This is a more subtle visual indication.

## Size Options

```tsx
// Small tabs
<Tabs size="sm" ... />

// Medium tabs (default)
<Tabs size="md" ... />

// Large tabs
<Tabs size="lg" ... />
```

## Full Width Tabs

To make tabs fill the entire available width:

```tsx
<Tabs fullWidth ... />
```

## Using with Container

To wrap tabs within a Container component:

```tsx
import { Container, Tabs } from '@/src/components/ui';

// In your JSX:
<Container>
  <Tabs
    items={tabItems}
    activeTab={activeTab}
    onTabChange={setActiveTab}
  />
  
  {/* Tab content goes here */}
  {renderTabContent()}
</Container>
```

## Example: Complete Tab Implementation

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Container, Tabs, AppText } from '@/src/components/ui';
import { TabItem } from '@/src/types/tabs';

export default function ScreenWithTabs() {
  // Define tab items
  const tabItems: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'details', label: 'Details', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View className="mt-4 bg-tertiary p-4 rounded-lg">
            <AppText size="lg" weight="bold" color="primary">Overview Content</AppText>
            <AppText color="text">This is the overview section content.</AppText>
          </View>
        );
      case 'details':
        return (
          <View className="mt-4 bg-tertiary p-4 rounded-lg">
            <AppText size="lg" weight="bold" color="primary">Details Content</AppText>
            <AppText color="text">This is the details section content.</AppText>
          </View>
        );
      case 'settings':
        return (
          <View className="mt-4 bg-tertiary p-4 rounded-lg">
            <AppText size="lg" weight="bold" color="primary">Settings Content</AppText>
            <AppText color="text">This is the settings section content.</AppText>
          </View>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container>
      <AppText size="xl" weight="bold" color="text" className="mb-4">
        My Screen with Tabs
      </AppText>
      
      <Tabs
        items={tabItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="pills"
        size="md"
      />
      
      {renderTabContent()}
    </Container>
  );
}
```

## Color Reference

The Tabs component uses the following colors from your theme:

- `primary` - Active tab background (default and pills variants), active tab border and text (underline variant)
- `tertiary` - Inactive tab background (pills variant)
- `quinary` - Active tab text color (default and pills variants)
- `text` - Inactive tab text color (all variants)

## Best Practices

1. **Consistent Navigation**: Use tabs for top-level navigation or content that is equally important.
2. **Limit Tab Count**: Try to limit tabs to 2-5 items for best mobile user experience.
3. **Clear Labels**: Keep tab labels short and descriptive.
4. **Visual Hierarchy**: Choose a tab variant that matches the visual hierarchy needed for your screen.
5. **Tab Content**: Ensure tab content is contextually related but distinct between tabs.