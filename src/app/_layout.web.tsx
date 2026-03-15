import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { WebStoreProvider } from '../db/web-store';

export default function RootLayout() {
  return (
    <WebStoreProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.brown },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="restroom/[id]"
          options={{
            title: 'Restroom Details',
            presentation: 'card',
          }}
        />
      </Stack>
    </WebStoreProvider>
  );
}
