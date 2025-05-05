
```markdown
# Mobile Expo App Implementation Guide

## Project structure
src/app
├── components/
│   └── Card.tsx
├── screens/
│   └── HomeScreen.tsx
├── api/
│   ├── Supabaseclient.ts
│   ├── mockItems.ts
│   └── items.ts
├── hooks/
│   └── useItems.ts
├── store/
│   └── useItemStore.ts
└── utils/
    └── types.ts
```

## Setup Instructions

## Implementation Guidelines

### 1. UI Components (`components/Card.tsx`)
```tsx
import { View, Text, Button, StyleSheet } from 'react-native';
import { useItemStore } from '../store/useItemStore';
import type { Item } from '../utils/types';

export default function Card({ item }: { item: Item }) {
  const { deleteItem } = useItemStore();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Button title="Delete" onPress={() => deleteItem(item.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, margin: 8, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold' }
});
```

### 2. Screen Component (`screens/HomeScreen.tsx`)
```tsx
import { FlatList, ActivityIndicator } from 'react-native';
import { useItems } from '../hooks/useItems';
import Card from '../components/Card';
import { useItemStore } from '../store/useItemStore';

export default function HomeScreen() {
  const { data, isLoading, error } = useItems();
  const { mockData } = useItemStore();

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={data || mockData}
      renderItem={({ item }) => <Card item={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### 3. Data Fetching Layer

#### Types (`utils/types.ts`)
```ts
export type Item = {
  id: string;
  title: string;
  description?: string;
};
```

#### Mock Data (`api/mockItems.ts`)
```ts
import { Item } from '../utils/types';

export const mockItems: Item[] = [
  {
    id: "1",
    title: "Mock Task 1",
    description: "Example mock data item"
  },
  {
    id: "2", 
    title: "Mock Task 2",
    description: "Another mock item"
  }
];
```

#### Supabase Client (`api/client.ts`)
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!
);
```

### 4. State Management

#### Zustand Store (`store/useItemStore.ts`)
```ts
import create from 'zustand';
import { supabase } from '../api/client';
import { mockItems } from '../api/mockItems';
import { Item } from '../utils/types';

type Store = {
  mockData: Item[];
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
};

export const useItemStore = create<Store>((set, get) => ({
  mockData: process.env.EXPO_PUBLIC_USE_MOCK ? mockItems : [],
  
  deleteItem: async (id) => {
    if (process.env.EXPO_PUBLIC_USE_MOCK) {
      set({ mockData: get().mockData.filter(item => item.id !== id) });
    } else {
      await supabase.from('items').delete().eq('id', id);
    }
  },

  updateItem: async (id, updates) => {
    if (process.env.EXPO_PUBLIC_USE_MOCK) {
      set({
        mockData: get().mockData.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      });
    } else {
      await supabase.from('items').update(updates).eq('id', id);
    }
  }
}));
```

### 5. TanStack Query Integration

#### Query Hook (`hooks/useItems.ts`)
```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../api/client';
import { mockItems } from '../api/mockItems';
import { useItemStore } from '../store/useItemStore';

const fetchItems = async () => {
  if (process.env.EXPO_PUBLIC_USE_MOCK) {
    return mockItems;
  }
  
  const { data, error } = await supabase.from('items').select('*');
  return error ? [] : data;
};

export const useItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
    enabled: !process.env.EXPO_PUBLIC_USE_MOCK
  });
};
```

## Development Workflow

1. **Toggle Data Source**:
   - Set `EXPO_PUBLIC_USE_MOCK=true` for local mock data
   - Set `EXPO_PUBLIC_USE_MOCK=false` for Supabase data

2. **Component Development**:
   ```bash
   EXPO_PUBLIC_USE_MOCK=true npx expo start
   ```

3. **Supabase Integration Testing**:
   ```bash
   EXPO_PUBLIC_USE_MOCK=false npx expo start
   ```

## Best Practices

1. **Component Architecture**:
   - Keep components in `/components` as pure UI elements
   - All business logic in stores/hooks

2. **Data Handling**:
   - Use mock data for UI development
   - Switch to real data for integration testing

3. **State Management**:
   - Use Zustand for client-side state
   - Use TanStack Query for server-state management

4. **Type Safety**:
   - Maintain all types in `/utils/types.ts`
   - Use TypeScript interfaces consistently

## Testing Checklist

✅ Verify mock data appears when `USE_MOCK=true`  
✅ Confirm Supabase connection works  
✅ Test CRUD operations in both modes  
✅ Validate error handling for API failures  
✅ Check UI responsiveness
```

This guideline provides:
1. Clear file structure expectations
2. Ready-to-use code snippets
3. Environment setup instructions
4. Development workflow guidance
5. Best practice reminders