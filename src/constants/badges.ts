export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  threshold: number;
}

export const BADGES: Badge[] = [
  { id: 'shy_pooper', name: 'Shy Pooper', emoji: '🐣', description: 'Everyone starts somewhere.', threshold: 0 },
  { id: 'throne_scout', name: 'Throne Scout', emoji: '🔍', description: "You've begun your journey.", threshold: 25 },
  { id: 'stall_stalker', name: 'Stall Stalker', emoji: '👀', description: 'You know where all the thrones are.', threshold: 100 },
  { id: 'throne_conqueror', name: 'Throne Conqueror', emoji: '⚔️', description: 'No restroom is safe from your reviews.', threshold: 250 },
  { id: 'stealth_shitter', name: 'Stealth Shitter', emoji: '🥷', description: 'A shadow in the stalls.', threshold: 500 },
  { id: 'porcelain_royalty', name: 'Porcelain Royalty', emoji: '👑', description: 'Bow before the king/queen of thrones.', threshold: 1000 },
];

export const POINTS = {
  ADD_RESTROOM: 50,
  WRITE_REVIEW: 25,
  FIRST_REVIEW_BONUS: 10,
} as const;

export function getCurrentBadge(points: number): Badge {
  let badge = BADGES[0];
  for (const b of BADGES) {
    if (points >= b.threshold) badge = b;
  }
  return badge;
}

export function getNextBadge(points: number): Badge | null {
  for (const b of BADGES) {
    if (points < b.threshold) return b;
  }
  return null;
}

export function getProgressToNext(points: number): number {
  const current = getCurrentBadge(points);
  const next = getNextBadge(points);
  if (!next) return 1;
  const range = next.threshold - current.threshold;
  const progress = points - current.threshold;
  return Math.min(1, progress / range);
}
