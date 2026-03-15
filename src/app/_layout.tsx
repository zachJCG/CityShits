import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { migrateDbIfNeeded } from '../db/database';
import { Colors } from '../constants/colors';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Suspense } from 'react';

function LoadingFallback() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingEmoji}>💩</Text>
      <Text style={styles.loadingText}>Loading your thrones...</Text>
      <ActivityIndicator size="large" color={Colors.brown} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider databaseName="cityshits.db" onInit={migrateDbIfNeeded}>
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
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.brown,
    marginBottom: 16,
    fontWeight: '600',
  },
});
