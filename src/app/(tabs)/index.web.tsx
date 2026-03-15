import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, PanicColors } from '../../constants/colors';
import { useWebStore } from '../../db/web-store';
import { FilterSheet, DEFAULT_FILTERS } from '../../components/FilterSheet';
import { HumorBanner } from '../../components/HumorBanner';
import { WebMap } from '../../components/WebMap';
import { RatingEmojis } from '../../constants/ratings';
import type { Restroom, FilterOptions } from '../../types';
import { getPanicLevel } from '../../types';

export default function MapScreen() {
  const store = useWebStore();
  const router = useRouter();
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const loadRestrooms = useCallback(() => {
    const hasFilters = Object.values(filters).some((v) => v > 0);
    const data = hasFilters
      ? store.getFilteredRestrooms(filters)
      : store.getAllRestrooms();
    setRestrooms(data);
  }, [store, filters]);

  useFocusEffect(
    useCallback(() => {
      loadRestrooms();
    }, [loadRestrooms])
  );

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {} // silently fail
      );
    }
  }, []);

  const handleRestroomPress = useCallback(
    (id: string) => router.push(`/restroom/${id}`),
    [router]
  );

  const hasActiveFilters = Object.values(filters).some((v) => v > 0);
  const { width } = useWindowDimensions();
  const isWide = width > 900;

  return (
    <View style={styles.container}>
      <HumorBanner screen="map" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.countText}>
          🚽 {restrooms.length} throne{restrooms.length !== 1 ? 's' : ''} found
        </Text>
        <View style={styles.topBarRight}>
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.panicGreen }]} />
              <Text style={styles.legendText}>Safe</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.panicYellow }]} />
              <Text style={styles.legendText}>Caution</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.panicRed }]} />
              <Text style={styles.legendText}>Danger</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setFilterVisible(true)}
          >
            <Text style={styles.filterButtonText}>
              🔍 {hasActiveFilters ? 'Filtered' : 'Filter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content: map + list */}
      <View style={[styles.main, isWide && styles.mainWide]}>
        {/* Map */}
        <View style={[styles.mapContainer, isWide && styles.mapContainerWide]}>
          <WebMap
            restrooms={restrooms}
            onRestroomPress={handleRestroomPress}
            userLocation={userLocation}
          />
        </View>

        {/* Card list */}
        <ScrollView
          style={[styles.list, isWide && styles.listWide]}
          contentContainerStyle={styles.listContent}
        >
          {restrooms.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🚽</Text>
              <Text style={styles.emptyText}>
                No thrones match your filters. Lower your standards?
              </Text>
            </View>
          ) : (
            restrooms.map((restroom) => {
              const panicLevel = getPanicLevel(restroom.overall);
              const emoji = RatingEmojis[Math.max(1, Math.min(5, Math.round(restroom.overall)))];
              return (
                <TouchableOpacity
                  key={restroom.id}
                  style={[styles.card, { borderLeftColor: PanicColors[panicLevel] }]}
                  onPress={() => router.push(`/restroom/${restroom.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {restroom.name}
                    </Text>
                    <View style={styles.cardRating}>
                      <Text style={styles.cardEmoji}>{emoji}</Text>
                      <Text style={styles.cardScore}>{restroom.overall.toFixed(1)}</Text>
                    </View>
                  </View>
                  {restroom.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {restroom.description}
                    </Text>
                  ) : null}
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaText}>🧹 {restroom.cleanliness.toFixed(1)}</Text>
                    <Text style={styles.cardMetaText}>🚪 {restroom.privacy.toFixed(1)}</Text>
                    <Text style={styles.cardMetaText}>🔇 {restroom.soundproofing.toFixed(1)}</Text>
                    <Text style={styles.cardMetaText}>
                      {restroom.requires_key ? '🔐 Key' : '🚪 Open'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => {
          setFilterVisible(false);
          loadRestrooms();
        }}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.brown,
  },
  countText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.tabBarInactive,
  },
  filterButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: Colors.yellow,
  },
  filterButtonText: {
    fontWeight: 'bold',
    color: Colors.brown,
    fontSize: 13,
  },
  // Layout
  main: {
    flex: 1,
  },
  mainWide: {
    flexDirection: 'row',
  },
  mapContainer: {
    height: 400,
  },
  mapContainerWide: {
    flex: 1,
    height: 'auto' as any,
  },
  list: {
    flex: 1,
  },
  listWide: {
    width: 380,
    maxWidth: 380,
    borderLeftWidth: 1,
    borderLeftColor: Colors.grayLight,
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.brown,
    flex: 1,
    marginRight: 8,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardEmoji: {
    fontSize: 16,
  },
  cardScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.brownLight,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.grayDark,
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  cardMetaText: {
    fontSize: 12,
    color: Colors.brownLight,
    fontWeight: '600',
  },
});
