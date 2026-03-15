import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { SEED_DATA } from './seed';
import type { Restroom, Review, FilterOptions } from '../types';

interface WebStoreContextValue {
  getAllRestrooms: () => Restroom[];
  getFilteredRestrooms: (filters: FilterOptions) => Restroom[];
  getRestroomById: (id: string) => Restroom | null;
  addRestroom: (data: Omit<Restroom, 'overall' | 'created_at'>) => void;
  getReviewsForRestroom: (id: string) => Review[];
  addReview: (data: Omit<Review, 'created_at'>) => void;
  updateRestroomAverages: (id: string) => void;
}

const WebStoreContext = createContext<WebStoreContextValue | null>(null);

export function useWebStore(): WebStoreContextValue {
  const ctx = useContext(WebStoreContext);
  if (!ctx) throw new Error('useWebStore must be used within WebStoreProvider');
  return ctx;
}

function buildSeedData(): { restrooms: Restroom[]; reviews: Review[] } {
  const restrooms: Restroom[] = [];
  const reviews: Review[] = [];

  for (const spot of SEED_DATA) {
    const restroomId = uuid();
    const avgCleanliness = spot.reviews.reduce((s, r) => s + r.cleanliness, 0) / spot.reviews.length;
    const avgPrivacy = spot.reviews.reduce((s, r) => s + r.privacy, 0) / spot.reviews.length;
    const avgSoundproofing = spot.reviews.reduce((s, r) => s + r.soundproofing, 0) / spot.reviews.length;
    const overall = (avgCleanliness + avgPrivacy + avgSoundproofing) / 3;

    restrooms.push({
      id: restroomId,
      name: spot.name,
      description: spot.description,
      latitude: spot.lat,
      longitude: spot.lng,
      cleanliness: avgCleanliness,
      privacy: avgPrivacy,
      soundproofing: avgSoundproofing,
      overall,
      requires_key: spot.requires_key,
      access_notes: spot.access_notes,
      created_at: new Date().toISOString(),
    });

    for (const rev of spot.reviews) {
      reviews.push({
        id: uuid(),
        restroom_id: restroomId,
        cleanliness: rev.cleanliness,
        privacy: rev.privacy,
        soundproofing: rev.soundproofing,
        comment: rev.comment,
        created_at: new Date().toISOString(),
      });
    }
  }

  return { restrooms, reviews };
}

export function WebStoreProvider({ children }: { children: ReactNode }) {
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const seed = buildSeedData();
    setRestrooms(seed.restrooms);
    setReviews(seed.reviews);
  }, []);

  const getAllRestrooms = useCallback((): Restroom[] => {
    return [...restrooms].sort((a, b) => b.overall - a.overall);
  }, [restrooms]);

  const getFilteredRestrooms = useCallback(
    (filters: FilterOptions): Restroom[] => {
      return restrooms
        .filter(
          (r) =>
            r.overall >= filters.minRating &&
            r.privacy >= filters.minPrivacy &&
            r.cleanliness >= filters.minCleanliness &&
            r.soundproofing >= filters.minSoundproofing
        )
        .sort((a, b) => b.overall - a.overall);
    },
    [restrooms]
  );

  const getRestroomById = useCallback(
    (id: string): Restroom | null => {
      return restrooms.find((r) => r.id === id) ?? null;
    },
    [restrooms]
  );

  const addRestroomFn = useCallback(
    (data: Omit<Restroom, 'overall' | 'created_at'>) => {
      const overall = (data.cleanliness + data.privacy + data.soundproofing) / 3;
      const newRestroom: Restroom = {
        ...data,
        overall,
        created_at: new Date().toISOString(),
      };
      setRestrooms((prev) => [...prev, newRestroom]);
    },
    []
  );

  const getReviewsForRestroom = useCallback(
    (id: string): Review[] => {
      return reviews
        .filter((r) => r.restroom_id === id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    [reviews]
  );

  const addReviewFn = useCallback((data: Omit<Review, 'created_at'>) => {
    const newReview: Review = {
      ...data,
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, newReview]);
  }, []);

  const updateRestroomAverages = useCallback(
    (id: string) => {
      setRestrooms((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const rRevs = reviews.filter((rev) => rev.restroom_id === id);
          if (rRevs.length === 0) return r;
          const avgC = rRevs.reduce((s, rev) => s + rev.cleanliness, 0) / rRevs.length;
          const avgP = rRevs.reduce((s, rev) => s + rev.privacy, 0) / rRevs.length;
          const avgS = rRevs.reduce((s, rev) => s + rev.soundproofing, 0) / rRevs.length;
          return {
            ...r,
            cleanliness: avgC,
            privacy: avgP,
            soundproofing: avgS,
            overall: (avgC + avgP + avgS) / 3,
          };
        })
      );
    },
    [reviews]
  );

  const value: WebStoreContextValue = {
    getAllRestrooms,
    getFilteredRestrooms,
    getRestroomById,
    addRestroom: addRestroomFn,
    getReviewsForRestroom,
    addReview: addReviewFn,
    updateRestroomAverages,
  };

  return <WebStoreContext.Provider value={value}>{children}</WebStoreContext.Provider>;
}
