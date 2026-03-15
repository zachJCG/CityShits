import type { SQLiteDatabase } from 'expo-sqlite';
import type { Restroom, FilterOptions } from '../types';

interface RestroomRow extends Omit<Restroom, 'requires_key'> {
  requires_key: number;
}

function toRestroom(row: RestroomRow): Restroom {
  return { ...row, requires_key: Boolean(row.requires_key) };
}

export async function getAllRestrooms(db: SQLiteDatabase): Promise<Restroom[]> {
  const rows = await db.getAllAsync<RestroomRow>(
    'SELECT * FROM restrooms ORDER BY overall DESC'
  );
  return rows.map(toRestroom);
}

export async function getFilteredRestrooms(
  db: SQLiteDatabase,
  filters: FilterOptions
): Promise<Restroom[]> {
  const rows = await db.getAllAsync<RestroomRow>(
    `SELECT * FROM restrooms
     WHERE overall >= ? AND privacy >= ? AND cleanliness >= ? AND soundproofing >= ?
     ORDER BY overall DESC`,
    [filters.minRating, filters.minPrivacy, filters.minCleanliness, filters.minSoundproofing]
  );
  return rows.map(toRestroom);
}

export async function getRestroomById(
  db: SQLiteDatabase,
  id: string
): Promise<Restroom | null> {
  const row = await db.getFirstAsync<RestroomRow>(
    'SELECT * FROM restrooms WHERE id = ?',
    [id]
  );
  if (!row) return null;
  return toRestroom(row);
}

export async function addRestroom(
  db: SQLiteDatabase,
  restroom: Omit<Restroom, 'overall' | 'created_at'>
): Promise<void> {
  const overall = (restroom.cleanliness + restroom.privacy + restroom.soundproofing) / 3;
  await db.runAsync(
    `INSERT INTO restrooms (id, name, description, latitude, longitude, cleanliness, privacy, soundproofing, overall, requires_key, access_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      restroom.id,
      restroom.name,
      restroom.description,
      restroom.latitude,
      restroom.longitude,
      restroom.cleanliness,
      restroom.privacy,
      restroom.soundproofing,
      overall,
      restroom.requires_key ? 1 : 0,
      restroom.access_notes,
    ]
  );
}

export async function updateRestroomAverages(
  db: SQLiteDatabase,
  restroomId: string
): Promise<void> {
  await db.runAsync(
    `UPDATE restrooms SET
      cleanliness = (SELECT AVG(cleanliness) FROM reviews WHERE restroom_id = ?),
      privacy = (SELECT AVG(privacy) FROM reviews WHERE restroom_id = ?),
      soundproofing = (SELECT AVG(soundproofing) FROM reviews WHERE restroom_id = ?),
      overall = (
        (SELECT AVG(cleanliness) FROM reviews WHERE restroom_id = ?) +
        (SELECT AVG(privacy) FROM reviews WHERE restroom_id = ?) +
        (SELECT AVG(soundproofing) FROM reviews WHERE restroom_id = ?)
      ) / 3.0
     WHERE id = ?`,
    [restroomId, restroomId, restroomId, restroomId, restroomId, restroomId, restroomId]
  );
}
