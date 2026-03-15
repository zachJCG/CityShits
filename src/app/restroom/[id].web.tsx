import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { v4 as uuid } from 'uuid';
import { Colors, PanicColors } from '../../constants/colors';
import { RatingBadge } from '../../components/RatingBadge';
import { RatingStars } from '../../components/RatingStars';
import { ReviewCard } from '../../components/ReviewCard';
import { useWebStore } from '../../db/web-store';
import { ReviewPlaceholders, RatingEmojis } from '../../constants/ratings';
import type { Restroom, Review } from '../../types';
import { getPanicLevel } from '../../types';

export default function RestroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useWebStore();

  const [restroom, setRestroom] = useState<Restroom | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [newCleanliness, setNewCleanliness] = useState(3);
  const [newPrivacy, setNewPrivacy] = useState(3);
  const [newSoundproofing, setNewSoundproofing] = useState(3);
  const [newComment, setNewComment] = useState('');

  const placeholder =
    ReviewPlaceholders[Math.floor(Math.random() * ReviewPlaceholders.length)];

  const loadData = useCallback(() => {
    if (!id) return;
    setRestroom(store.getRestroomById(id));
    setReviews(store.getReviewsForRestroom(id));
  }, [store, id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSubmitReview = () => {
    if (!id) return;

    store.addReview({
      id: uuid(),
      restroom_id: id,
      cleanliness: newCleanliness,
      privacy: newPrivacy,
      soundproofing: newSoundproofing,
      comment: newComment.trim(),
    });

    store.updateRestroomAverages(id);

    setNewCleanliness(3);
    setNewPrivacy(3);
    setNewSoundproofing(3);
    setNewComment('');
    setShowReviewForm(false);

    loadData();
    window.alert('Review Dropped! Thanks for contributing to the throne database.');
  };

  if (!restroom) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>💩 Loading throne...</Text>
      </View>
    );
  }

  const panicLevel = getPanicLevel(restroom.overall);
  const overallEmoji = RatingEmojis[Math.max(1, Math.min(5, Math.round(restroom.overall)))];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.header, { borderLeftColor: PanicColors[panicLevel] }]}>
        <Text style={styles.name}>{restroom.name}</Text>
        <View style={styles.overallRow}>
          <Text style={styles.overallEmoji}>{overallEmoji}</Text>
          <Text style={styles.overallRating}>{restroom.overall.toFixed(1)} / 5</Text>
          <View style={[styles.panicBadge, { backgroundColor: PanicColors[panicLevel] }]}>
            <Text style={styles.panicText}>
              {panicLevel === 'green'
                ? '🟢 Safe Haven'
                : panicLevel === 'yellow'
                  ? '🟡 Caution'
                  : '🔴 Danger Zone'}
            </Text>
          </View>
        </View>
        {restroom.description ? (
          <Text style={styles.description}>{restroom.description}</Text>
        ) : null}
      </View>

      {/* Access Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Access Info</Text>
        <View style={styles.accessCard}>
          <Text style={styles.accessItem}>
            {restroom.requires_key ? '🔐 Key/Code Required' : '🚪 Open Access'}
          </Text>
          {restroom.access_notes ? (
            <Text style={styles.accessNotes}>{restroom.access_notes}</Text>
          ) : null}
        </View>
      </View>

      {/* Rating Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Ratings Breakdown</Text>
        <RatingBadge category="cleanliness" value={restroom.cleanliness} />
        <RatingBadge category="privacy" value={restroom.privacy} />
        <RatingBadge category="soundproofing" value={restroom.soundproofing} />
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <View style={styles.reviewHeader}>
          <Text style={styles.sectionTitle}>
            💬 Reviews ({reviews.length})
          </Text>
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowReviewForm(!showReviewForm)}
          >
            <Text style={styles.addReviewText}>
              {showReviewForm ? '✕ Cancel' : '+ Add Review'}
            </Text>
          </TouchableOpacity>
        </View>

        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.formTitle}>Drop Your Review 💩</Text>
            <RatingStars label="🧹 Cleanliness" value={newCleanliness} onChange={setNewCleanliness} />
            <RatingStars label="🚪 Privacy" value={newPrivacy} onChange={setNewPrivacy} />
            <RatingStars label="🔇 Soundproofing" value={newSoundproofing} onChange={setNewSoundproofing} />
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder={placeholder}
              placeholderTextColor={Colors.gray}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
              <Text style={styles.submitText}>💩 Submit Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>
            No reviews yet. Be the first to rate this throne! 👑
          </Text>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.brown,
  },
  header: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brown,
    marginBottom: 8,
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  overallEmoji: {
    fontSize: 28,
  },
  overallRating: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.brownLight,
  },
  panicBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  panicText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.grayDark,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brown,
    marginBottom: 10,
  },
  accessCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accessItem: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brown,
    marginBottom: 4,
  },
  accessNotes: {
    fontSize: 14,
    color: Colors.grayDark,
    fontStyle: 'italic',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addReviewButton: {
    backgroundColor: Colors.brown,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addReviewText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  reviewForm: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: Colors.brownMuted,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brown,
    marginBottom: 12,
    textAlign: 'center',
  },
  commentInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.black,
    marginTop: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  submitButton: {
    backgroundColor: Colors.brown,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  noReviews: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
  },
});
