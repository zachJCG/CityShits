import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, PanicColors } from '../../constants/colors';
import { getAllRestrooms, getFilteredRestrooms } from '../../db/restrooms';
import { FilterSheet, DEFAULT_FILTERS } from '../../components/FilterSheet';
import type { Restroom, FilterOptions } from '../../types';
import { getPanicLevel } from '../../types';

const NYC_REGION: Region = {
  latitude: 40.7580,
  longitude: -73.9855,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function MapScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [region, setRegion] = useState<Region>(NYC_REGION);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  const loadRestrooms = useCallback(async () => {
    const hasFilters = Object.values(filters).some((v) => v > 0);
    const data = hasFilters
      ? await getFilteredRestrooms(db, filters)
      : await getAllRestrooms(db);
    setRestrooms(data);
  }, [db, filters]);

  useFocusEffect(
    useCallback(() => {
      loadRestrooms();
    }, [loadRestrooms])
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
      }
    })();
  }, []);

  const getMarkerColor = (overall: number): string => {
    const level = getPanicLevel(overall);
    return PanicColors[level];
  };

  const hasActiveFilters = Object.values(filters).some((v) => v > 0);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {restrooms.map((restroom) => (
          <Marker
            key={restroom.id}
            coordinate={{
              latitude: restroom.latitude,
              longitude: restroom.longitude,
            }}
            pinColor={getMarkerColor(restroom.overall)}
            onCalloutPress={() => router.push(`/restroom/${restroom.id}`)}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{restroom.name}</Text>
                <Text style={styles.calloutRating}>
                  {restroom.overall >= 3.5 ? '🟢' : restroom.overall >= 2.0 ? '🟡' : '🔴'}{' '}
                  {restroom.overall.toFixed(1)} / 5
                </Text>
                <Text style={styles.calloutHint}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Filter button */}
      <TouchableOpacity
        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        onPress={() => setFilterVisible(true)}
      >
        <Text style={styles.filterButtonText}>
          🔍 {hasActiveFilters ? 'Filtered' : 'Filter'}
        </Text>
      </TouchableOpacity>

      {/* Restroom count badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          🚽 {restrooms.length} throne{restrooms.length !== 1 ? 's' : ''} found
        </Text>
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

      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => {
          setFilterVisible(false);
          loadRestrooms();
        }}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    padding: 8,
    minWidth: 160,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.brown,
    marginBottom: 4,
  },
  calloutRating: {
    fontSize: 13,
    marginBottom: 2,
  },
  calloutHint: {
    fontSize: 11,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  filterButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.yellow,
  },
  filterButtonText: {
    fontWeight: 'bold',
    color: Colors.brown,
    fontSize: 14,
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.brown,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  countText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.grayDark,
  },
});
