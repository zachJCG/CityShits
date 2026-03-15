export interface Restroom {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  cleanliness: number;
  privacy: number;
  soundproofing: number;
  overall: number;
  requires_key: boolean;
  access_notes: string;
  created_at: string;
}

export interface Review {
  id: string;
  restroom_id: string;
  cleanliness: number;
  privacy: number;
  soundproofing: number;
  comment: string;
  created_at: string;
}

export interface FilterOptions {
  minRating: number;
  minPrivacy: number;
  minCleanliness: number;
  minSoundproofing: number;
}

export interface UserStats {
  points: number;
  reviews_count: number;
  restrooms_count: number;
}

export const DEFAULT_STATS: UserStats = {
  points: 0,
  reviews_count: 0,
  restrooms_count: 0,
};

export type PanicLevel = 'green' | 'yellow' | 'red';

export function getPanicLevel(overall: number): PanicLevel {
  if (overall >= 3.5) return 'green';
  if (overall >= 2.0) return 'yellow';
  return 'red';
}
