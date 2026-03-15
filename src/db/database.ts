import type { SQLiteDatabase } from 'expo-sqlite';
import { seedDatabase } from './seed';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS restrooms (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      cleanliness REAL NOT NULL DEFAULT 3,
      privacy REAL NOT NULL DEFAULT 3,
      soundproofing REAL NOT NULL DEFAULT 3,
      overall REAL NOT NULL DEFAULT 3,
      requires_key INTEGER NOT NULL DEFAULT 0,
      access_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY NOT NULL,
      restroom_id TEXT NOT NULL,
      cleanliness INTEGER NOT NULL,
      privacy INTEGER NOT NULL,
      soundproofing INTEGER NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (restroom_id) REFERENCES restrooms(id)
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      points INTEGER NOT NULL DEFAULT 0,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      restrooms_count INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO user_stats (id, points, reviews_count, restrooms_count)
    VALUES (1, 0, 0, 0);
  `);

  // Seed if empty
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM restrooms'
  );
  if (result && result.count === 0) {
    await seedDatabase(db);
  }
}
