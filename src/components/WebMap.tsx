import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import type { Restroom } from '../types';
import { getPanicLevel } from '../types';
import { Colors } from '../constants/colors';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    .leaflet-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .cs-popup .leaflet-popup-content-wrapper {
      border-radius: 14px; padding: 0;
      box-shadow: 0 6px 20px rgba(0,0,0,0.18);
      border: none;
    }
    .cs-popup .leaflet-popup-tip { display: none; }
    .cs-popup .leaflet-popup-content { margin: 0; min-width: 200px; }
    .cs-popup-inner { padding: 14px 16px; }
    .cs-popup-name {
      font-weight: 700; color: ${Colors.brown}; font-size: 14px;
      margin-bottom: 6px; line-height: 1.3;
    }
    .cs-popup-stats {
      display: flex; gap: 8px; margin-bottom: 8px;
      font-size: 12px; color: ${Colors.grayDark};
    }
    .cs-popup-stat { white-space: nowrap; }
    .cs-popup-score {
      display: inline-flex; align-items: center; gap: 4px;
      font-weight: 700; font-size: 13px; margin-bottom: 8px;
    }
    .cs-popup-btn {
      display: block; width: 100%; padding: 10px;
      background: ${Colors.brown}; color: white; border-radius: 0 0 14px 14px;
      font-weight: 700; font-size: 13px; text-align: center;
      cursor: pointer; border: none; transition: background 0.15s;
      letter-spacing: 0.3px;
    }
    .cs-popup-btn:hover { background: ${Colors.brownLight}; }
  `;
  document.head.appendChild(style);
}

function createMarkerIcon(overall: number): L.DivIcon {
  const level = getPanicLevel(overall);
  const bg = { green: Colors.panicGreen, yellow: Colors.panicYellow, red: Colors.panicRed }[level];

  return L.divIcon({
    className: '',
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50%;
      background: ${bg}; border: 2.5px solid white;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      cursor: pointer; transition: transform 0.15s;
    " onmouseover="this.style.transform='scale(1.2)'"
       onmouseout="this.style.transform='scale(1)'">🚽</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

interface WebMapProps {
  restrooms: Restroom[];
  onRestroomPress: (id: string) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  interactive?: boolean; // full interaction (drag/scroll zoom) — default true
}

export function WebMap({ restrooms, onRestroomPress, userLocation, interactive = true }: WebMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    injectCSS();

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const center: [number, number] = userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : [40.758, -73.9855];

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 14,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      if (userLocation) {
        L.circleMarker([userLocation.latitude, userLocation.longitude], {
          radius: 7,
          fillColor: '#4285F4',
          color: 'white',
          weight: 2.5,
          fillOpacity: 1,
        }).addTo(map).bindPopup('📍 You are here');
      }

      // Force a resize after CSS loads
      setTimeout(() => map.invalidateSize(), 300);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;
    markersRef.current.clearLayers();

    for (const r of restrooms) {
      const marker = L.marker([r.latitude, r.longitude], {
        icon: createMarkerIcon(r.overall),
      });

      const dot = r.overall >= 3.5 ? '🟢' : r.overall >= 2.0 ? '🟡' : '🔴';

      marker.bindPopup(
        `<div class="cs-popup-inner">
          <div class="cs-popup-name">${r.name}</div>
          <div class="cs-popup-score">${dot} ${r.overall.toFixed(1)} / 5</div>
          <div class="cs-popup-stats">
            <span class="cs-popup-stat">🧹 ${r.cleanliness.toFixed(1)}</span>
            <span class="cs-popup-stat">🚪 ${r.privacy.toFixed(1)}</span>
            <span class="cs-popup-stat">🔇 ${r.soundproofing.toFixed(1)}</span>
          </div>
        </div>
        <button class="cs-popup-btn" data-id="${r.id}">View Details →</button>`,
        { className: 'cs-popup', closeButton: false }
      );

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector(`button[data-id="${r.id}"]`);
          if (btn) btn.addEventListener('click', () => onRestroomPress(r.id));
        }, 10);
      });

      marker.addTo(markersRef.current!);
    }

    // Fit bounds to markers if we have them
    if (restrooms.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(restrooms.map((r) => [r.latitude, r.longitude] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [restrooms, onRestroomPress]);

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
    }
  }, [userLocation]);

  return (
    <div
      ref={(el: HTMLDivElement | null) => { mapContainerRef.current = el; }}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 250,
        touchAction: interactive ? 'none' : 'pan-y',
      }}
    />
  );
}
