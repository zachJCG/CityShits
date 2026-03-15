import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../constants/colors';
import { RatingStars } from './RatingStars';
import type { FilterOptions } from '../types';

interface FilterSheetProps {
  visible: boolean;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
  onReset: () => void;
}

export const DEFAULT_FILTERS: FilterOptions = {
  minRating: 0,
  minPrivacy: 0,
  minCleanliness: 0,
  minSoundproofing: 0,
};

export function FilterSheet({
  visible,
  filters,
  onFiltersChange,
  onClose,
  onReset,
}: FilterSheetProps) {
  const updateFilter = (key: keyof FilterOptions, value: number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>🔍 Filter Thrones</Text>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Minimum Overall Rating</Text>
            <RatingStars
              value={filters.minRating}
              onChange={(v) => updateFilter('minRating', v)}
              size={24}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Minimum Cleanliness</Text>
            <RatingStars
              value={filters.minCleanliness}
              onChange={(v) => updateFilter('minCleanliness', v)}
              size={24}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Minimum Privacy</Text>
            <RatingStars
              value={filters.minPrivacy}
              onChange={(v) => updateFilter('minPrivacy', v)}
              size={24}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Minimum Soundproofing</Text>
            <RatingStars
              value={filters.minSoundproofing}
              onChange={(v) => updateFilter('minSoundproofing', v)}
              size={24}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.grayLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.brown,
    marginBottom: 20,
    textAlign: 'center',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brown,
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.brown,
    alignItems: 'center',
  },
  resetText: {
    color: Colors.brown,
    fontWeight: 'bold',
    fontSize: 16,
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.brown,
    alignItems: 'center',
  },
  applyText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
