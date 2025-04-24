export type Option = {
  id: string;
  label: string;
  emoji: string;
};

export type BudgetPreference = {
  amount: number;
  style: string[];
};

export type PreferencesType = {
  travel_vibe: string[];
  travel_companion: string[];
  travel_purpose: string[];
  budget: BudgetPreference;
  food_preferences: string[];
  tech_preferences: string[];
};

export const sections = {
  travel_vibe: {
    title: 'Travel Vibe',
    emoji: '🎨',
    options: [
      { id: 'aesthetic', label: 'Aesthetic', emoji: '🎨' },
      { id: 'chill', label: 'Chill', emoji: '🏖️' },
      { id: 'thrill', label: 'Thrill', emoji: '🏃' },
      { id: 'festivals', label: 'Festivals', emoji: '🎉' },
      { id: 'trendy', label: 'Trendy', emoji: '✨' },
    ],
  },
  travel_companion: {
    title: 'Companions',
    emoji: '👥',
    options: [
      { id: 'solo', label: 'Solo', emoji: '👤' },
      { id: 'couple', label: 'Partner', emoji: '👫' },
      { id: 'friends', label: 'Besties', emoji: '👥' },
      { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    ],
  },
  travel_purpose: {
    title: 'Goals',
    emoji: '🎯',
    options: [
      { id: 'nature', label: 'Nature', emoji: '🌿' },
      { id: 'art', label: 'Art', emoji: '🎨' },
      { id: 'culture', label: 'Culture', emoji: '🏛️' },
      { id: 'work', label: 'Work', emoji: '💼' },
      { id: 'volunteer', label: 'Volunteer', emoji: '❤️' },
    ],
  },
  budget: {
    title: 'Budget',
    emoji: '💰',
    options: [
      { id: 'budget', label: 'Budget', emoji: '🪙' },
      { id: 'mid_range', label: 'Mid-Range', emoji: '💵' },
      { id: 'luxury', label: 'Luxury', emoji: '💎' },
      { id: 'mix', label: 'Mixed', emoji: '🎯' },
    ],
  },
  food_preferences: {
    title: 'Food',
    emoji: '🍽️',
    options: [
      { id: 'local', label: 'Local', emoji: '🏠' },
      { id: 'international', label: 'International', emoji: '🌎' },
      { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
      { id: 'street_food', label: 'Street Food', emoji: '🥘' },
      { id: 'fine_dining', label: 'Fine Dining', emoji: '🍷' },
    ],
  },
  tech_preferences: {
    title: 'Tech',
    emoji: '📱',
    options: [
      { id: 'connected', label: 'Always Connected', emoji: '📶' },
      { id: 'minimal', label: 'Minimal Tech', emoji: '🌿' },
      { id: 'photography', label: 'Photography', emoji: '📸' },
      { id: 'work', label: 'Work Setup', emoji: '💼' },
    ],
  },
};
