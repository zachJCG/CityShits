import type { SQLiteDatabase } from 'expo-sqlite';
import type { Review } from '../types';

export async function getReviewsForRestroom(
  db: SQLiteDatabase,
  restroomId: string
): Promise<Review[]> {
  return db.getAllAsync<Review>(
    'SELECT * FROM reviews WHERE restroom_id = ? ORDER BY created_at DESC',
    [restroomId]
  );
}

export async function addReview(
  db: SQLiteDatabase,
  review: Omit<Review, 'created_at'>
): Promise<void> {
  await db.runAsync(
    `INSERT INTO reviews (id, restroom_id, cleanliness, privacy, soundproofing, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      review.id,
      review.restroom_id,
      review.cleanliness,
      review.privacy,
      review.soundproofing,
      review.comment,
    ]
  );
}

export async function getReviewCount(
  db: SQLiteDatabase,
  restroomId: string
): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reviews WHERE restroom_id = ?',
    [restroomId]
  );
  return result?.count ?? 0;
}
