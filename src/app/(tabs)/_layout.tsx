import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 28 : 24, opacity: focused ? 1 : 0.7 }}>
      {emoji}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.brownLight,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: Colors.brown },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Find a Throne',
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
          headerTitle: '💩 CityShits',
        }}
      />
      <Tabs.Screen
        name="panic"
        options={{
          title: 'Code Brown',
          tabBarLabel: 'Panic',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} />,
          headerTitle: '🚨 Code Brown',
          headerStyle: { backgroundColor: '#2D1010' },
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Drop a Pin',
          tabBarLabel: 'Add',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📍" focused={focused} />,
          headerTitle: '📍 Add a Throne',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👑" focused={focused} />,
          headerTitle: '👑 Your Legacy',
        }}
      />
    </Tabs>
  );
}
