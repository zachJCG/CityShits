import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getCurrentBadge, getNextBadge, getProgressToNext, BADGES } from '../../constants/badges';
import { useHumorMode } from '../../context/HumorContext';
import { HumorBanner } from '../../components/HumorBanner';
import type { UserStats } from '../../types';
import { DEFAULT_STATS } from '../../types';

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const { humorMode, toggleHumorMode } = useHumorMode();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const row = await db.getFirstAsync<UserStats>(
          'SELECT * FROM user_stats WHERE id = 1'
        );
        if (row) setStats(row);
      })();
    }, [db])
  );

  const currentBadge = getCurrentBadge(stats.points);
  const nextBadge = getNextBadge(stats.points);
  const progress = getProgressToNext(stats.points);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <HumorBanner screen="profile" />

      {/* Current Badge */}
      <View style={styles.badgeCard}>
        <Text style={styles.badgeEmoji}>{currentBadge.emoji}</Text>
        <Text style={styles.badgeName}>{currentBadge.name}</Text>
        <Text style={styles.badgeDesc}>{currentBadge.description}</Text>
      </View>

      {/* Points */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.points}</Text>
          <Text style={styles.statLabel}>Poop Points</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.reviews_count}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.restrooms_count}</Text>
          <Text style={styles.statLabel}>Thrones Added</Text>
        </View>
      </View>

      {/* Progress */}
      {nextBadge && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            Next: {nextBadge.emoji} {nextBadge.name}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressText}>
            {stats.points} / {nextBadge.threshold} points
          </Text>
        </View>
      )}

      {/* All badges */}
      <Text style={styles.sectionTitle}>🏆 All Badges</Text>
      {BADGES.map((badge) => {
        const unlocked = stats.points >= badge.threshold;
        return (
          <View key={badge.id} style={[styles.badgeRow, !unlocked && styles.badgeLocked]}>
            <Text style={styles.badgeRowEmoji}>{unlocked ? badge.emoji : '🔒'}</Text>
            <View style={styles.badgeRowInfo}>
              <Text style={[styles.badgeRowName, !unlocked && styles.lockedText]}>{badge.name}</Text>
              <Text style={styles.badgeRowDesc}>{badge.description}</Text>
            </View>
            <Text style={styles.badgeRowThreshold}>{badge.threshold} pts</Text>
          </View>
        );
      })}

      {/* Humor Toggle */}
      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>🎙️ Humor Mode</Text>
          <Text style={styles.settingDesc}>Toggle fun narration throughout the app</Text>
        </View>
        <Switch
          value={humorMode}
          onValueChange={toggleHumorMode}
          trackColor={{ false: Colors.grayLight, true: Colors.brownMuted }}
          thumbColor={humorMode ? Colors.brown : Colors.gray}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16 },
  badgeCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  badgeEmoji: { fontSize: 64, marginBottom: 8 },
  badgeName: { fontSize: 22, fontWeight: 'bold', color: Colors.brown, marginBottom: 4 },
  badgeDesc: { fontSize: 14, color: Colors.grayDark, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    alignItems: 'center', shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: Colors.brown },
  statLabel: { fontSize: 11, color: Colors.gray, marginTop: 4, fontWeight: '600' },
  progressCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 20 },
  progressTitle: { fontSize: 15, fontWeight: '600', color: Colors.brown, marginBottom: 10 },
  progressBar: { height: 12, backgroundColor: Colors.grayLight, borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.yellow, borderRadius: 6 },
  progressText: { fontSize: 12, color: Colors.gray, textAlign: 'right' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.brown, marginBottom: 10 },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 12, padding: 14, marginBottom: 8, gap: 12,
  },
  badgeLocked: { opacity: 0.5 },
  badgeRowEmoji: { fontSize: 28 },
  badgeRowInfo: { flex: 1 },
  badgeRowName: { fontSize: 15, fontWeight: 'bold', color: Colors.brown },
  badgeRowDesc: { fontSize: 12, color: Colors.grayDark, fontStyle: 'italic' },
  badgeRowThreshold: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
  lockedText: { color: Colors.gray },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginTop: 20,
  },
  settingLabel: { fontSize: 16, fontWeight: '600', color: Colors.brown },
  settingDesc: { fontSize: 12, color: Colors.gray, marginTop: 2 },
});
