import { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import L from 'leaflet';
import type { Restroom } from '../types';
import { getPanicLevel } from '../types';
import { Colors } from '../constants/colors';

const LEAFLET_CSS = `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`;

// Inject Leaflet CSS once
let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);

  // Fix default marker icon paths (Leaflet CDN icons)
  const style = document.createElement('style');
  style.textContent = `
    .leaflet-container { font-family: inherit; }
    .cs-popup .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .cs-popup .leaflet-popup-content { margin: 12px 16px; }
    .cs-popup-name { font-weight: bold; color: #4A2F1A; font-size: 15px; margin-bottom: 4px; }
    .cs-popup-rating { font-size: 14px; margin-bottom: 2px; }
    .cs-popup-hint { font-size: 11px; color: #9E9E9E; font-style: italic; }
    .cs-popup-btn {
      display: inline-block; margin-top: 8px; padding: 6px 14px;
      background: #4A2F1A; color: white; border-radius: 8px;
      font-weight: bold; font-size: 12px; text-decoration: none; cursor: pointer;
      border: none;
    }
    .cs-popup-btn:hover { background: #8B6914; }
  `;
  document.head.appendChild(style);
}

function createMarkerIcon(overall: number): L.DivIcon {
  const level = getPanicLevel(overall);
  const colors = {
    green: Colors.panicGreen,
    yellow: Colors.panicYellow,
    red: Colors.panicRed,
  };
  const bg = colors[level];
  const emoji = overall >= 3.5 ? '🟢' : overall >= 2.0 ? '🟡' : '🔴';

  return L.divIcon({
    className: '',
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50%;
      background: ${bg}; border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    ">🚽</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

interface WebMapProps {
  restrooms: Restroom[];
  onRestroomPress: (id: string) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function WebMap({ restrooms, onRestroomPress, userLocation }: WebMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    injectCSS();

    // Small delay to ensure CSS is loaded
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const center: [number, number] = userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : [40.758, -73.9855]; // NYC default

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Add user location marker
      if (userLocation) {
        L.circleMarker([userLocation.latitude, userLocation.longitude], {
          radius: 8,
          fillColor: '#4285F4',
          color: 'white',
          weight: 3,
          fillOpacity: 1,
        }).addTo(map).bindPopup('📍 You are here');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when restrooms change
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    markersRef.current.clearLayers();

    for (const restroom of restrooms) {
      const marker = L.marker([restroom.latitude, restroom.longitude], {
        icon: createMarkerIcon(restroom.overall),
      });

      const ratingDot = restroom.overall >= 3.5 ? '🟢' : restroom.overall >= 2.0 ? '🟡' : '🔴';

      marker.bindPopup(
        `<div class="cs-popup">
          <div class="cs-popup-name">${restroom.name}</div>
          <div class="cs-popup-rating">${ratingDot} ${restroom.overall.toFixed(1)} / 5</div>
          <div class="cs-popup-hint">🧹 ${restroom.cleanliness.toFixed(1)} · 🚪 ${restroom.privacy.toFixed(1)} · 🔇 ${restroom.soundproofing.toFixed(1)}</div>
          <button class="cs-popup-btn" data-id="${restroom.id}">View Details →</button>
        </div>`,
        { className: 'cs-popup' }
      );

      marker.on('popupopen', () => {
        // Attach click handler to the button inside the popup
        setTimeout(() => {
          const btn = document.querySelector(`button[data-id="${restroom.id}"]`);
          if (btn) {
            btn.addEventListener('click', () => onRestroomPress(restroom.id));
          }
        }, 10);
      });

      marker.addTo(markersRef.current!);
    }
  }, [restrooms, onRestroomPress]);

  // Recenter if user location updates
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
    }
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <div
        ref={(el: HTMLDivElement | null) => { mapContainerRef.current = el; }}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
});
