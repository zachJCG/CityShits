import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, PanicColors } from '../../constants/colors';
import { useWebStore } from '../../db/web-store';
import { getDistanceMiles, formatDistance } from '../../utils/distance';
import { HumorBanner } from '../../components/HumorBanner';
import { RatingEmojis } from '../../constants/ratings';
import { getPanicLevel } from '../../types';
import type { Restroom } from '../../types';

export default function PanicScreen() {
  const store = useWebStore();
  const router = useRouter();
  const [nearest, setNearest] = useState<(Restroom & { distance: number }) | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, [pulseAnim]);

  const findNearest = () => {
    setSearching(true);
    setError('');
    setNearest(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setSearching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const restrooms = store.getAllRestrooms();

        let best: (Restroom & { distance: number }) | null = null;
        for (const r of restrooms) {
          if (r.overall < 2.0) continue; // skip danger zones
          const dist = getDistanceMiles(latitude, longitude, r.latitude, r.longitude);
          if (!best || dist < best.distance) {
            best = { ...r, distance: dist };
          }
        }

        // Fallback: if no >= 2.0 restrooms, take anything
        if (!best) {
          for (const r of restrooms) {
            const dist = getDistanceMiles(latitude, longitude, r.latitude, r.longitude);
            if (!best || dist < best.distance) {
              best = { ...r, distance: dist };
            }
          }
        }

        setNearest(best);
        setSearching(false);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setSearching(false);
      }
    );
  };

  return (
    <View style={styles.container}>
      <HumorBanner screen="panic" />

      <View style={styles.content}>
        {!nearest && !searching && (
          <>
            <Text style={styles.title}>🚨 EMERGENCY{'\n'}THRONE FINDER</Text>
            <Text style={styles.subtitle}>
              When it's a Code Brown, every second counts.
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.panicButton} onPress={findNearest}>
                <Text style={styles.panicEmoji}>🚨</Text>
                <Text style={styles.panicText}>FIND NEAREST{'\n'}THRONE NOW</Text>
              </TouchableOpacity>
            </Animated.View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}

        {searching && (
          <View style={styles.searching}>
            <Text style={styles.searchEmoji}>💩</Text>
            <Text style={styles.searchText}>SCANNING FOR THRONES...</Text>
          </View>
        )}

        {nearest && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>NEAREST SAFE THRONE</Text>
            <Text style={styles.resultName}>{nearest.name}</Text>
            <View style={styles.resultMeta}>
              <Text style={styles.resultDistance}>📍 {formatDistance(nearest.distance)}</Text>
              <Text style={styles.resultRating}>
                {RatingEmojis[Math.max(1, Math.min(5, Math.round(nearest.overall)))]}
                {' '}{nearest.overall.toFixed(1)} / 5
              </Text>
            </View>
            {nearest.description ? (
              <Text style={styles.resultDesc}>{nearest.description}</Text>
            ) : null}
            {nearest.access_notes ? (
              <Text style={styles.resultAccess}>📋 {nearest.access_notes}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.goButton}
              onPress={() => router.push(`/restroom/${nearest.id}`)}
            >
              <Text style={styles.goText}>🚽 GO TO THRONE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryButton} onPress={findNearest}>
              <Text style={styles.retryText}>🔄 Search Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2D1010' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.red, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#FFAAAA', textAlign: 'center', marginBottom: 40, fontStyle: 'italic' },
  panicButton: {
    width: 200, height: 200, maxWidth: '55vw' as any, maxHeight: '55vw' as any,
    borderRadius: 9999, backgroundColor: Colors.red,
    justifyContent: 'center', alignItems: 'center', aspectRatio: 1,
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 30, elevation: 10,
  },
  panicEmoji: { fontSize: 48, marginBottom: 8 },
  panicText: { fontSize: 18, fontWeight: 'bold', color: Colors.white, textAlign: 'center' },
  error: { color: Colors.red, marginTop: 16, fontSize: 14 },
  searching: { alignItems: 'center' },
  searchEmoji: { fontSize: 64, marginBottom: 16 },
  searchText: { fontSize: 20, fontWeight: 'bold', color: Colors.yellow },
  resultCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 20,
    width: '100%', maxWidth: 400, alignSelf: 'center', alignItems: 'center',
  },
  resultLabel: { fontSize: 12, fontWeight: 'bold', color: Colors.green, letterSpacing: 2, marginBottom: 8 },
  resultName: { fontSize: 22, fontWeight: 'bold', color: Colors.brown, textAlign: 'center', marginBottom: 12 },
  resultMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  resultDistance: { fontSize: 16, fontWeight: '600', color: Colors.brownLight },
  resultRating: { fontSize: 16, fontWeight: '600', color: Colors.brownLight },
  resultDesc: { fontSize: 13, color: Colors.grayDark, fontStyle: 'italic', textAlign: 'center', marginBottom: 8 },
  resultAccess: { fontSize: 13, color: Colors.brown, marginBottom: 16 },
  goButton: {
    backgroundColor: Colors.green, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 32, marginBottom: 10, width: '100%', alignItems: 'center',
  },
  goText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
  retryButton: { padding: 10 },
  retryText: { color: Colors.gray, fontSize: 14 },
});
