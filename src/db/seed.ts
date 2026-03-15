import type { SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuid } from 'uuid';

export interface SeedRestroom {
  name: string;
  description: string;
  lat: number;
  lng: number;
  requires_key: boolean;
  access_notes: string;
  reviews: { cleanliness: number; privacy: number; soundproofing: number; comment: string }[];
}

export const SEED_DATA: SeedRestroom[] = [
  {
    name: 'The Porcelain Palace (Starbucks)',
    description: 'Premium pooping at its finest. The baristas judge you, but the throne does not.',
    lat: 40.7580,
    lng: -73.9855,
    requires_key: true,
    access_notes: 'Ask barista. Code: 1234. Buy a latte to ease the guilt.',
    reviews: [
      { cleanliness: 5, privacy: 4, soundproofing: 4, comment: 'Heated seats. HEATED. SEATS. I have peaked in life.' },
      { cleanliness: 4, privacy: 4, soundproofing: 3, comment: 'Great spot. The jazz music covers your symphony of splashes.' },
      { cleanliness: 5, privacy: 5, soundproofing: 4, comment: 'I have found inner peace. It was in Stall 3.' },
    ],
  },
  {
    name: 'Gas Station of Doom',
    description: 'Only if you\'re about to erupt like Vesuvius. Bring your own everything.',
    lat: 40.7549,
    lng: -73.9840,
    requires_key: true,
    access_notes: 'Key attached to a hubcap. Classic.',
    reviews: [
      { cleanliness: 1, privacy: 1, soundproofing: 1, comment: 'I saw things in there that will haunt my dreams forever.' },
      { cleanliness: 1, privacy: 2, soundproofing: 1, comment: 'Post-apocalyptic. The toilet seat was just... gone. Like it escaped.' },
      { cleanliness: 2, privacy: 1, soundproofing: 2, comment: 'Avoid Stall 2: It\'s haunted by the ghost of tacos past.' },
    ],
  },
  {
    name: 'The Throne Room (Nordstrom)',
    description: 'Where royalty goes to release. Actual nice soap. Towels that aren\'t sandpaper.',
    lat: 40.7624,
    lng: -73.9738,
    requires_key: false,
    access_notes: '3rd floor, past the shoe department. Worth the trek.',
    reviews: [
      { cleanliness: 5, privacy: 5, soundproofing: 5, comment: 'Five stars. I\'d poop here again on purpose.' },
      { cleanliness: 5, privacy: 5, soundproofing: 4, comment: 'So clean I felt bad using it. Almost apologized to the toilet.' },
    ],
  },
  {
    name: 'Bryant Park Public Restroom',
    description: 'Surprisingly civilized for a public restroom. An oasis in the concrete jungle.',
    lat: 40.7536,
    lng: -73.9832,
    requires_key: false,
    access_notes: 'Behind the fountain. Free and open. No judgment here.',
    reviews: [
      { cleanliness: 4, privacy: 3, soundproofing: 2, comment: 'An attendant keeps it clean! In NYC! Is this real life?' },
      { cleanliness: 4, privacy: 3, soundproofing: 3, comment: 'Decent for a public restroom. The bar is low, but they cleared it.' },
      { cleanliness: 3, privacy: 3, soundproofing: 2, comment: 'Pro Tip: Bring Febreze. The air freshener is just a sad pine tree hanging from the mirror.' },
    ],
  },
  {
    name: 'The Speakeasy Stall (Hidden Bar)',
    description: 'Knock three times and say "I gotta go." Seriously, it\'s behind a bookshelf.',
    lat: 40.7265,
    lng: -73.9898,
    requires_key: false,
    access_notes: 'Behind the bookshelf in the back. Through the hallway of regrets.',
    reviews: [
      { cleanliness: 3, privacy: 5, soundproofing: 5, comment: 'So hidden nobody will ever know you were there. Perfect for the shy pooper.' },
      { cleanliness: 3, privacy: 5, soundproofing: 4, comment: 'The graffiti alone is worth the visit. Truly inspirational.' },
    ],
  },
  {
    name: 'Grand Central Convenience',
    description: 'The people-watching from the sink is unmatched. Commuter chaos edition.',
    lat: 40.7527,
    lng: -73.9772,
    requires_key: false,
    access_notes: 'Downstairs near the food court. Follow the scent of Shake Shack.',
    reviews: [
      { cleanliness: 3, privacy: 2, soundproofing: 1, comment: 'Echo chamber of doom. My neighbor was humming the Star Wars theme.' },
      { cleanliness: 3, privacy: 2, soundproofing: 2, comment: 'The stall gaps are big enough to pass notes. Or regrets.' },
      { cleanliness: 2, privacy: 2, soundproofing: 1, comment: 'Rush hour? More like flush hour. Long lines but gets the job done.' },
    ],
  },
  {
    name: 'Whole Foods Wellness Throne',
    description: 'Organic, free-range, non-GMO pooping experience. As pretentious as it sounds.',
    lat: 40.7420,
    lng: -73.9951,
    requires_key: false,
    access_notes: 'Second floor, past the overpriced granola. Follow the kombucha trail.',
    reviews: [
      { cleanliness: 4, privacy: 4, soundproofing: 3, comment: 'Smells like eucalyptus in here. My poop has never felt so zen.' },
      { cleanliness: 5, privacy: 4, soundproofing: 3, comment: 'Clean enough to eat off the floor. Not that you should. Don\'t be weird.' },
    ],
  },
  {
    name: 'The Port-a-Potty Experience (Central Park)',
    description: 'Nature called. It got voicemail. Left a strongly worded message.',
    lat: 40.7829,
    lng: -73.9654,
    requires_key: false,
    access_notes: 'Near the Great Lawn. Blue boxes of broken dreams.',
    reviews: [
      { cleanliness: 1, privacy: 2, soundproofing: 1, comment: 'Congratulations, you\'re now part of a group therapy session.' },
      { cleanliness: 2, privacy: 2, soundproofing: 2, comment: 'Summer edition: add 10 degrees and subtract all hope.' },
    ],
  },
  {
    name: 'Hotel Lobby Luxe (The Plaza)',
    description: 'Act like you belong. Walk with confidence. Poop like a VIP.',
    lat: 40.7645,
    lng: -73.9744,
    requires_key: false,
    access_notes: 'Walk through the lobby like you own the place. Restrooms near the elevators.',
    reviews: [
      { cleanliness: 5, privacy: 5, soundproofing: 5, comment: 'Felt like a king on this throne. Marble everything. I wept.' },
      { cleanliness: 5, privacy: 5, soundproofing: 5, comment: 'This bathroom saved my marriage — no echoes meant no awkward post-dinner explanations.' },
      { cleanliness: 5, privacy: 4, soundproofing: 5, comment: 'There\'s a person who hands you towels. A PERSON. HANDS. YOU. TOWELS.' },
    ],
  },
  {
    name: 'The Philosopher\'s Throne (NYU Library)',
    description: 'Ponder life\'s greatest mysteries while you... unload. Inspirational graffiti included.',
    lat: 40.7295,
    lng: -73.9965,
    requires_key: false,
    access_notes: 'Ground floor. Pretend you\'re a student. They never check.',
    reviews: [
      { cleanliness: 3, privacy: 4, soundproofing: 3, comment: 'Read half a chapter of Kant on the wall. 10/10 would contemplate again.' },
      { cleanliness: 3, privacy: 4, soundproofing: 4, comment: 'Quiet, private, intellectual. My colon graduated with honors.' },
    ],
  },
  {
    name: 'Museum of Modern Dumps (MoMA)',
    description: 'Art before, art during, art after. The full cultural experience.',
    lat: 40.7614,
    lng: -73.9776,
    requires_key: false,
    access_notes: 'Requires museum admission ($25). Your most expensive poop yet.',
    reviews: [
      { cleanliness: 4, privacy: 4, soundproofing: 4, comment: 'Is this a bathroom or an art installation? Either way, masterpiece.' },
      { cleanliness: 5, privacy: 4, soundproofing: 3, comment: 'Minimalist design. My poop felt very contemporary.' },
    ],
  },
  {
    name: 'Penn Station Panic Room',
    description: 'For emergencies only. The kind where waiting is NOT an option.',
    lat: 40.7506,
    lng: -73.9935,
    requires_key: false,
    access_notes: 'Near Track 13. Descend into the abyss. Turn left at the rats.',
    reviews: [
      { cleanliness: 2, privacy: 1, soundproofing: 1, comment: 'I\'ve seen war zones more peaceful. But when you gotta go, you gotta go.' },
      { cleanliness: 1, privacy: 2, soundproofing: 1, comment: 'Someone was playing a saxophone outside. Made it feel cinematic at least.' },
      { cleanliness: 2, privacy: 1, soundproofing: 2, comment: 'Emergency use only. Don\'t look down. Don\'t look up. Don\'t look at all.' },
    ],
  },
];

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  for (const spot of SEED_DATA) {
    const restroomId = uuid();
    const avgCleanliness =
      spot.reviews.reduce((sum, r) => sum + r.cleanliness, 0) / spot.reviews.length;
    const avgPrivacy =
      spot.reviews.reduce((sum, r) => sum + r.privacy, 0) / spot.reviews.length;
    const avgSoundproofing =
      spot.reviews.reduce((sum, r) => sum + r.soundproofing, 0) / spot.reviews.length;
    const overall = (avgCleanliness + avgPrivacy + avgSoundproofing) / 3;

    await db.runAsync(
      `INSERT INTO restrooms (id, name, description, latitude, longitude, cleanliness, privacy, soundproofing, overall, requires_key, access_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restroomId,
        spot.name,
        spot.description,
        spot.lat,
        spot.lng,
        avgCleanliness,
        avgPrivacy,
        avgSoundproofing,
        overall,
        spot.requires_key ? 1 : 0,
        spot.access_notes,
      ]
    );

    for (const review of spot.reviews) {
      const reviewId = uuid();
      await db.runAsync(
        `INSERT INTO reviews (id, restroom_id, cleanliness, privacy, soundproofing, comment)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [reviewId, restroomId, review.cleanliness, review.privacy, review.soundproofing, review.comment]
      );
    }
  }
}
