import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function BottomTabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'teal' }} backBehavior="order">
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarLabel: 'Index',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="numeric-1-box-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="second"
        options={{
          title: 'Second',
          headerShown: false,
          popToTopOnBlur: true,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="numeric-2-box-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="third"
        options={{
          title: 'Third',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="numeric-3-box-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="six"
        options={{
          tabBarBadge: 100,
          tabBarBadgeStyle: {
            backgroundColor: 'tomato',
            color: 'white',
          },
          title: 'six',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="numeric-4-box-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
