export const Colors = {
  // Primary palette
  brown: '#4A2F1A',
  brownLight: '#8B6914',
  brownSurface: '#F5E6D3',
  brownMuted: '#D4B896',

  // Rating colors
  green: '#4CAF50',
  greenLight: '#81C784',
  yellow: '#FFC107',
  yellowLight: '#FFD54F',
  red: '#F44336',
  redLight: '#E57373',

  // UI
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#9E9E9E',
  grayLight: '#E0E0E0',
  grayDark: '#616161',

  // Backgrounds
  background: '#FFF8F0',
  card: '#FFFFFF',
  tabBar: '#4A2F1A',
  tabBarInactive: '#D4B896',
  tabBarActive: '#FFC107',

  // Status
  panicGreen: '#4CAF50',
  panicYellow: '#FFC107',
  panicRed: '#F44336',
};

export const PanicColors = {
  green: Colors.panicGreen,
  yellow: Colors.panicYellow,
  red: Colors.panicRed,
} as const;
