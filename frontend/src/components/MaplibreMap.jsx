import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '../context/ThemeContext';
import { Navigation, Moon, Mountain, MapPin, Compass } from 'lucide-react';

// ─── OpenFreeMap Style URLs (100% free, no API key) ─────────────────────────
const STYLES = {
  bright:   'https://tiles.openfreemap.org/styles/bright',
  liberty:  'https://tiles.openfreemap.org/styles/liberty',
  positron: 'https://tiles.openfreemap.org/styles/positron',
  dark:     'https://tiles.openfreemap.org/styles/dark',
  fiord:    'https://tiles.openfreemap.org/styles/fiord',
};

// ─── SVG Icon Paths for incident markers ────────────────────────────────────
const SVG_ICONS = {
  FIRE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  FLOOD: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  MEDICAL: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  ACCIDENT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5v-5l2-7h10l2 7z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>`,
  POLICE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  DEFAULT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

const INCIDENT_COLORS = {
  FIRE: '#dc2626',
  FLOOD: '#2563eb',
  MEDICAL: '#16a34a',
  ACCIDENT: '#f59e0b',
  POLICE: '#7c3aed',
  EARTHQUAKE: '#b45309',
  LANDSLIDE: '#92400e',
  STORM: '#334155',
  POWER: '#ca8a04',
  default: '#6b7280',
};

const isResolved = (incident) => incident?.status?.toLowerCase() === 'resolved';

// ─── Build a marker DOM element ─────────────────────────────────────────────
function createMarkerEl(type, status) {
  const color = INCIDENT_COLORS[type] || INCIDENT_COLORS.default;
  const svgPath = SVG_ICONS[type] || SVG_ICONS.DEFAULT;
  const isPulsing = status === 'New' || status === 'Dispatched' || status === 'en-route' || status === 'On-Scene';

  const el = document.createElement('div');
  el.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: ${color};
    border: 2.5px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    color: #ffffff;
    cursor: pointer;
  `;
  el.innerHTML = svgPath;

  if (isPulsing) {
    const pulse = document.createElement('div');
    pulse.style.cssText = `
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 3px solid ${color};
      animation: ndrs-marker-pulse 1.8s ease-out infinite;
      opacity: 0;
      pointer-events: none;
    `;
    el.appendChild(pulse);
  }

  return el;
}

function createUserMarkerEl() {
  const el = document.createElement('div');
  el.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: #174ea6;
    border: 3px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(23,78,166,0.4);
  `;
  const pulse = document.createElement('div');
  pulse.style.cssText = `
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 2px solid #174ea6;
    animation: ndrs-marker-pulse 1.8s ease-out infinite;
    opacity: 0;
    pointer-events: none;
  `;
  el.appendChild(pulse);
  return el;
}

function createPinMarkerEl() {
  const el = document.createElement('div');
  el.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background-color: #dc2626;
    border: 3px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(220,38,38,0.5);
    color: #ffffff;
    cursor: grab;
  `;
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  return el;
}

// ─── Inject pulse animation keyframes ───────────────────────────────────────
function injectPulseCSS() {
  if (document.getElementById('ndrs-marker-pulse-css')) return;
  const style = document.createElement('style');
  style.id = 'ndrs-marker-pulse-css';
  style.textContent = `
    @keyframes ndrs-marker-pulse {
      0% { transform: scale(0.8); opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Create popup HTML ──────────────────────────────────────────────────────
function popupHTML(inc, darkMode) {
  const statusBg = inc.status === 'New' ? '#fee2e2' : '#dbeafe';
  const statusColor = inc.status === 'New' ? '#dc2626' : '#2563eb';
  const textColor = darkMode ? '#f8fafc' : '#0f172a';
  const subColor = darkMode ? '#cbd5e1' : '#475569';

  let severityHtml = '';
  if (inc.severity) {
    const sevBg = inc.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7';
    const sevColor = inc.severity === 'CRITICAL' ? '#dc2626' : '#b45309';
    severityHtml = `<div style="margin-top:4px"><span style="padding:2px 8px;border-radius:999px;font-size:10px;text-transform:uppercase;background-color:${sevBg};color:${sevColor};font-weight:800">${inc.severity}</span></div>`;
  }

  return `
    <div style="color:${textColor};min-width:180px;font-family:inherit;padding:4px 2px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
        <h4 style="margin:0;font-size:14px;font-weight:800;color:${textColor}">${inc.type}</h4>
        <span style="padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background-color:${statusBg};color:${statusColor}">${inc.status}</span>
      </div>
      <p style="margin:0 0 6px 0;font-size:12px;color:${subColor};line-height:1.45">${inc.description || ''}</p>
      ${severityHtml}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MaplibreMap Component
// ═══════════════════════════════════════════════════════════════════════════
export default function MaplibreMap({
  center = [5.6037, -0.1870],
  zoom = 13,
  incidents = [],
  resources = [],
  onMarkerClick = null,
  selectedLocation = null,
  onLocationSelect = null,
  darkMode: propDarkMode,
}) {
  const themeContext = useTheme();
  const darkMode = propDarkMode !== undefined ? propDarkMode : themeContext?.darkMode;

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeSourceAdded = useRef(false);
  const userMarkerRef = useRef(null);
  const pinMarkerRef = useRef(null);
  const userLocRef = useRef(null);

  const [activeStyle, setActiveStyle] = useState(() => (darkMode ? 'dark' : 'bright'));

  // Sync style with theme
  useEffect(() => {
    setActiveStyle(darkMode ? 'dark' : 'bright');
  }, [darkMode]);

  // ── Initialize Map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    injectPulseCSS();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[activeStyle] || STYLES.bright,
      center: [center[1], center[0]], // MapLibre uses [lng, lat]
      zoom: zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      pinMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only init once

  // ── Switch style on demand ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    map.setStyle(STYLES[activeStyle] || STYLES.bright);

    // Re-apply view after style loads
    map.once('styledata', () => {
      map.setCenter(currentCenter);
      map.setZoom(currentZoom);
      routeSourceAdded.current = false;
    });
  }, [activeStyle]);

  // ── Add/update incident markers ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const liveIncidents = incidents.filter(i => !isResolved(i));

    liveIncidents.forEach(inc => {
      if (!inc.location || typeof inc.location.lat !== 'number' || typeof inc.location.lng !== 'number') return;

      const el = createMarkerEl(inc.type, inc.status);

      const popup = new maplibregl.Popup({
        offset: 22,
        closeButton: true,
        maxWidth: '260px',
        className: darkMode ? 'ndrs-maplibre-popup-dark' : '',
      }).setHTML(popupHTML(inc, darkMode));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([inc.location.lng, inc.location.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        if (onMarkerClick) onMarkerClick(inc, 'incident');
      });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds
    if (liveIncidents.length > 0) {
      const validPoints = liveIncidents
        .filter(i => i.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number')
        .map(i => [i.location.lng, i.location.lat]);

      if (validPoints.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        validPoints.forEach(p => bounds.extend(p));
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
      }
    }
  }, [incidents, darkMode, onMarkerClick]);

  // ── Dispatch route lines ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const liveIncidents = incidents.filter(i => !isResolved(i));
    const routes = [];
    resources.forEach(res => {
      if (res.assignedTo && res.availability === 'Dispatched') {
        const inc = liveIncidents.find(i => i.id === res.assignedTo);
        if (inc?.location && res.location) {
          routes.push([
            [res.location.lng, res.location.lat],
            [inc.location.lng, inc.location.lat],
          ]);
        }
      }
    });

    const addRoutes = () => {
      const sourceId = 'ndrs-dispatch-routes';
      const layerId = 'ndrs-dispatch-routes-layer';

      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      if (routes.length === 0) return;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: routes.map((coords, idx) => ({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
            properties: { id: idx },
          })),
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#174ea6',
          'line-width': 3.5,
          'line-dasharray': [2, 2],
        },
      });
    };

    if (map.isStyleLoaded()) {
      addRoutes();
    } else {
      map.once('styledata', addRoutes);
    }
  }, [incidents, resources]);

  // ── User GPS location marker ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;

    let active = true;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!active) return;
        const coords = [pos.coords.longitude, pos.coords.latitude];
        userLocRef.current = coords;

        if (!userMarkerRef.current) {
          userMarkerRef.current = new maplibregl.Marker({ element: createUserMarkerEl() })
            .setLngLat(coords)
            .addTo(map);
          // Pan to user on first fix
          map.flyTo({ center: coords, zoom: 15, duration: 1200 });
        } else {
          userMarkerRef.current.setLngLat(coords);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      active = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // ── Draggable selected-location pin (for report placement) ──────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number') {
      if (!pinMarkerRef.current) {
        pinMarkerRef.current = new maplibregl.Marker({
          element: createPinMarkerEl(),
          draggable: !!onLocationSelect,
        })
          .setLngLat([selectedLocation.lng, selectedLocation.lat])
          .addTo(map);

        if (onLocationSelect) {
          pinMarkerRef.current.on('dragend', () => {
            const lngLat = pinMarkerRef.current.getLngLat();
            onLocationSelect({ lat: lngLat.lat, lng: lngLat.lng });
          });
        }
      } else {
        pinMarkerRef.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);
      }
    } else {
      pinMarkerRef.current?.remove();
      pinMarkerRef.current = null;
    }
  }, [selectedLocation, onLocationSelect]);

  // ── Layer Switcher Buttons ──────────────────────────────────────────────
  const layers = [
    { id: 'bright', label: 'Bright', icon: Navigation },
    { id: 'liberty', label: 'Liberty', icon: Compass },
    { id: 'positron', label: 'Light', icon: MapPin },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'fiord', label: 'Fiord', icon: Mountain },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320 }}>
      {/* Layer Switcher */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        borderRadius: 14,
        backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      }}>
        {layers.map(layer => {
          const isSelected = activeStyle === layer.id;
          const Icon = layer.icon;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveStyle(layer.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: isSelected ? 'var(--ndrs-blue, #2563eb)' : 'transparent',
                color: isSelected ? '#ffffff' : (darkMode ? '#94a3b8' : '#475569'),
                fontWeight: isSelected ? 800 : 600,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={13} />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
      />
    </div>
  );
}
