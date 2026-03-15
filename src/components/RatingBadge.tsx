import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { CleanlinessLabels, PrivacyLabels, SoundproofingLabels, RatingEmojis } from '../constants/ratings';

type RatingCategory = 'cleanliness' | 'privacy' | 'soundproofing';

const CATEGORY_CONFIG: Record<RatingCategory, { title: string; labels: Record<number, string> }> = {
  cleanliness: { title: '🧹 Cleanliness', labels: CleanlinessLabels },
  privacy: { title: '🚪 Privacy', labels: PrivacyLabels },
  soundproofing: { title: '🔇 Soundproofing', labels: SoundproofingLabels },
};

interface RatingBadgeProps {
  category: RatingCategory;
  value: number;
}

export function RatingBadge({ category, value }: RatingBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  const rounded = Math.round(value);
  const clamped = Math.max(1, Math.min(5, rounded));
  const emoji = RatingEmojis[clamped];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.rating}>
          {emoji} {value.toFixed(1)} / 5
        </Text>
      </View>
      <Text style={styles.description}>{config.labels[clamped]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brown,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brownLight,
  },
  description: {
    fontSize: 13,
    color: Colors.grayDark,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
