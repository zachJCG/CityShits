import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { RatingEmojis } from '../constants/ratings';
import type { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const avgRating = (review.cleanliness + review.privacy + review.soundproofing) / 3;
  const emoji = RatingEmojis[Math.max(1, Math.min(5, Math.round(avgRating)))];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.ratings}>
          <Text style={styles.ratingText}>🧹 {review.cleanliness}</Text>
          <Text style={styles.ratingText}>🚪 {review.privacy}</Text>
          <Text style={styles.ratingText}>🔇 {review.soundproofing}</Text>
        </View>
      </View>
      {review.comment ? (
        <Text style={styles.comment}>"{review.comment}"</Text>
      ) : null}
      <Text style={styles.date}>
        {new Date(review.created_at).toLocaleDateString()}
      </Text>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  ratings: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.brownLight,
    fontWeight: '600',
  },
  comment: {
    fontSize: 14,
    color: Colors.grayDark,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    color: Colors.gray,
  },
});
