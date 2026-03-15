import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, PanicColors } from '../../constants/colors';
import { useWebStore } from '../../db/web-store';
import { FilterSheet, DEFAULT_FILTERS } from '../../components/FilterSheet';
import { RatingEmojis } from '../../constants/ratings';
import type { Restroom, FilterOptions } from '../../types';
import { getPanicLevel } from '../../types';

export default function MapScreen() {
  const store = useWebStore();
  const router = useRouter();
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

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

  const hasActiveFilters = Object.values(filters).some((v) => v > 0);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.countText}>
          🚽 {restrooms.length} throne{restrooms.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={styles.filterButtonText}>
            🔍 {hasActiveFilters ? 'Filtered' : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.panicGreen }]} />
          <Text style={styles.legendText}>Safe Haven</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.panicYellow }]} />
          <Text style={styles.legendText}>Proceed w/ Caution</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.panicRed }]} />
          <Text style={styles.legendText}>Danger Zone</Text>
        </View>
      </View>

      {/* Restroom List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {restrooms.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🚽</Text>
            <Text style={styles.emptyText}>No thrones match your filters. Lower your standards?</Text>
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
                  <Text style={styles.cardName}>{restroom.name}</Text>
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
                  <Text style={styles.cardMetaText}>
                    🧹 {restroom.cleanliness.toFixed(1)}
                  </Text>
                  <Text style={styles.cardMetaText}>
                    🚪 {restroom.privacy.toFixed(1)}
                  </Text>
                  <Text style={styles.cardMetaText}>
                    🔇 {restroom.soundproofing.toFixed(1)}
                  </Text>
                  <Text style={styles.cardMetaText}>
                    {restroom.requires_key ? '🔐 Key' : '🚪 Open'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

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
    paddingVertical: 12,
    backgroundColor: Colors.brown,
  },
  countText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 15,
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.grayDark,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
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
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardName: {
    fontSize: 17,
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
    fontSize: 20,
  },
  cardScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brownLight,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.grayDark,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  cardMetaText: {
    fontSize: 13,
    color: Colors.brownLight,
    fontWeight: '600',
  },
});
