import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useWebStore } from '../../db/web-store';
import { FilterSheet, DEFAULT_FILTERS } from '../../components/FilterSheet';
import { HumorBanner } from '../../components/HumorBanner';
import { WebMap } from '../../components/WebMap';
import { RatingEmojis } from '../../constants/ratings';
import { Colors, PanicColors } from '../../constants/colors';
import type { Restroom, FilterOptions } from '../../types';
import { getPanicLevel } from '../../types';

export default function MapScreen() {
  const store = useWebStore();
  const router = useRouter();
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isWide, setIsWide] = useState(() => window.innerWidth > 800);

  const loadRestrooms = useCallback(() => {
    const hasFilters = Object.values(filters).some((v) => v > 0);
    setRestrooms(hasFilters ? store.getFilteredRestrooms(filters) : store.getAllRestrooms());
  }, [store, filters]);

  useFocusEffect(useCallback(() => { loadRestrooms(); }, [loadRestrooms]));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Responsive listener
  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth > 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleRestroomPress = useCallback(
    (id: string) => router.push(`/restroom/${id}`),
    [router]
  );

  const hasActiveFilters = Object.values(filters).some((v) => v > 0);

  return (
    <div style={S.page}>
      <HumorBanner screen="map" />

      {/* Header bar */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <span style={S.logo}>🚽</span>
          <span style={S.title}>
            {restrooms.length} throne{restrooms.length !== 1 ? 's' : ''} nearby
          </span>
        </div>
        <div style={S.headerRight}>
          <div style={S.legend}>
            {([['#4CAF50', 'Safe'], ['#FF9800', 'Meh'], ['#F44336', 'Yikes']] as const).map(([c, l]) => (
              <span key={l} style={S.legendItem}>
                <span style={{ ...S.legendDot, background: c }} />
                {isWide && <span style={S.legendLabel}>{l}</span>}
              </span>
            ))}
          </div>
          <button
            style={{
              ...S.filterBtn,
              ...(hasActiveFilters ? S.filterBtnActive : {}),
            }}
            onClick={() => setFilterVisible(true)}
          >
            {hasActiveFilters ? '✨ Filtered' : '🔍 Filter'}
          </button>
        </div>
      </div>

      {/* Main content */}
      {isWide ? (
        /* Wide: side-by-side, map fills left, scrollable card sidebar */
        <div style={S.mainWide}>
          <div style={S.mapWide}>
            <WebMap
              restrooms={restrooms}
              onRestroomPress={handleRestroomPress}
              userLocation={userLocation}
            />
          </div>
          <div style={S.listWide}>
            <div style={S.listInner}>
              <CardList restrooms={restrooms} router={router} />
            </div>
          </div>
        </div>
      ) : (
        /* Narrow: single scrollable column — map + cards flow together */
        <div style={S.mainNarrow}>
          <div style={S.mapNarrow}>
            <WebMap
              restrooms={restrooms}
              onRestroomPress={handleRestroomPress}
              userLocation={userLocation}
              interactive={false}
            />
          </div>
          <div style={S.listInner}>
            <CardList restrooms={restrooms} router={router} />
          </div>
        </div>
      )}

      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => { setFilterVisible(false); loadRestrooms(); }}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />
    </div>
  );
}

function CardList({ restrooms, router }: { restrooms: Restroom[]; router: ReturnType<typeof useRouter> }) {
  if (restrooms.length === 0) {
    return (
      <div style={S.empty}>
        <div style={{ fontSize: 56 }}>🚽</div>
        <p style={S.emptyText}>No thrones match your filters. Lower your standards?</p>
      </div>
    );
  }
  return (
    <>
      {restrooms.map((r) => (
        <RestroomCard key={r.id} restroom={r} onPress={() => router.push(`/restroom/${r.id}`)} />
      ))}
    </>
  );
}

function RestroomCard({ restroom, onPress }: { restroom: Restroom; onPress: () => void }) {
  const panicLevel = getPanicLevel(restroom.overall);
  const emoji = RatingEmojis[Math.max(1, Math.min(5, Math.round(restroom.overall)))];
  const borderColor = PanicColors[panicLevel];

  return (
    <div style={{ ...S.card, borderLeftColor: borderColor }} onClick={onPress}>
      <div style={S.cardTop}>
        <span style={S.cardName}>{restroom.name}</span>
        <span style={S.cardScore}>
          <span>{emoji}</span>
          <span style={S.cardScoreNum}>{restroom.overall.toFixed(1)}</span>
        </span>
      </div>
      {restroom.description ? (
        <p style={S.cardDesc}>{restroom.description}</p>
      ) : null}
      <div style={S.cardTags}>
        <span style={S.tag}>🧹 {restroom.cleanliness.toFixed(1)}</span>
        <span style={S.tag}>🚪 {restroom.privacy.toFixed(1)}</span>
        <span style={S.tag}>🔇 {restroom.soundproofing.toFixed(1)}</span>
        <span style={{ ...S.tag, ...(restroom.requires_key ? S.tagKey : {}) }}>
          {restroom.requires_key ? '🔐 Key' : '🚪 Open'}
        </span>
      </div>
    </div>
  );
}

// ── Styles (plain objects for <div> — no RN StyleSheet) ──

const S: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#FAF6F1',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: Colors.brown,
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: { fontSize: 22 },
  title: { color: 'white', fontWeight: 700, fontSize: 15, letterSpacing: 0.2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  legend: { display: 'flex', gap: 10, alignItems: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' } as React.CSSProperties,
  legendLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  filterBtn: {
    padding: '7px 16px',
    borderRadius: 20,
    border: 'none',
    background: 'white',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    color: Colors.brown,
    transition: 'all 0.15s',
  },
  filterBtnActive: { background: Colors.yellow, color: Colors.brown },

  // Wide: side-by-side, fills remaining viewport
  mainWide: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  } as React.CSSProperties,

  // Narrow: single scrollable column
  mainNarrow: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  } as React.CSSProperties,

  // Map
  mapWide: { flex: 1, minHeight: 0 },
  mapNarrow: {
    height: 'clamp(250px, 40vh, 380px)',
    position: 'relative',
    flexShrink: 0,
  } as React.CSSProperties,

  // List (wide only — narrow cards just flow in the scroll)
  listWide: {
    width: 'clamp(300px, 30vw, 400px)',
    flexShrink: 0,
    overflowY: 'auto',
    borderLeft: `1px solid ${Colors.grayLight}`,
    background: '#FAF6F1',
  } as React.CSSProperties,
  listInner: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  } as React.CSSProperties,

  // Empty
  empty: { textAlign: 'center', paddingTop: 48 } as React.CSSProperties,
  emptyText: { fontSize: 15, color: Colors.gray, fontStyle: 'italic', marginTop: 8 },

  // Card
  card: {
    background: 'white',
    borderRadius: 12,
    padding: '12px 14px',
    borderLeft: '4px solid',
    cursor: 'pointer',
    transition: 'transform 0.12s, box-shadow 0.12s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  cardName: {
    fontWeight: 700,
    fontSize: 14,
    color: Colors.brown,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  } as React.CSSProperties,
  cardScore: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  cardScoreNum: { fontWeight: 700, fontSize: 14, color: Colors.brownLight },
  cardDesc: {
    fontSize: 12,
    color: Colors.grayDark,
    fontStyle: 'italic',
    margin: '0 0 6px',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  } as React.CSSProperties,
  cardTags: { display: 'flex', gap: 8, flexWrap: 'wrap' } as React.CSSProperties,
  tag: { fontSize: 12, color: Colors.brownLight, fontWeight: 600 },
  tagKey: { color: Colors.panicRed },
};
