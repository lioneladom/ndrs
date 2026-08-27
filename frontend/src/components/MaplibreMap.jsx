import React, { useRef, useEffect, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Loader2, MapPin } from 'lucide-react';

const SVG_ICONS = {
  FIRE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  FLOOD: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  MEDICAL: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  ACCIDENT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5v-5l2-7h10l2 7z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>`,
  POLICE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  DEFAULT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  PIN: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
};

const getIncidentSvg = (type) => {
  return SVG_ICONS[type] || SVG_ICONS.DEFAULT;
};

const INCIDENT_COLORS = {
  FIRE: '#dc2626', FLOOD: '#2563eb', MEDICAL: '#16a34a',
  ACCIDENT: '#f59e0b', POLICE: '#7c3aed', EARTHQUAKE: '#b45309',
  LANDSLIDE: '#92400e', STORM: '#334155', POWER: '#ca8a04',
  default: '#6b7280'
};

const isResolved = (inc) => inc?.status?.toLowerCase() === 'resolved';

// Stand-alone high performance map tiles — 100% free, 0 API key required, crisp details
function buildRasterStyle(dark) {
  if (dark) {
    return {
      version: 8,
      sources: {
        'esri-dark-base': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256
        },
        'esri-dark-ref': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256
        }
      },
      layers: [
        { id: 'esri-dark-base', type: 'raster', source: 'esri-dark-base' },
        { id: 'esri-dark-ref', type: 'raster', source: 'esri-dark-ref' }
      ]
    };
  }

  return {
    version: 8,
    sources: {
      'esri-street': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256
      }
    },
    layers: [
      { id: 'esri-street', type: 'raster', source: 'esri-street' }
    ]
  };
}

export default function MaplibreMap({
  center = [5.6037, -0.1870],
  zoom = 13,
  incidents = [],
  resources = [],
  onMarkerClick = null,
  isInteractive = true,
  selectedLocation = null,
  onLocationSelect = null,
  darkMode = false
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const resizeObserver = useRef(null);
  const markers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const liveIncidents = useMemo(
    () => incidents.filter((i) => !isResolved(i)),
    [incidents]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    setMapLoaded(false);
    setMapError(false);

    let m;
    try {
      m = new maplibregl.Map({
        container: mapContainer.current,
        style: buildRasterStyle(darkMode),
        center: [center[1], center[0]],
        zoom,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
      });

      map.current = m;

      m.on('load', () => setMapLoaded(true));
      m.on('error', () => setMapError(true));

      requestAnimationFrame(() => m.resize());
      if ('ResizeObserver' in window) {
        resizeObserver.current = new ResizeObserver(() => {
          requestAnimationFrame(() => m.resize());
        });
        resizeObserver.current.observe(mapContainer.current);
      }

      const handleResize = () => m.resize();
      window.addEventListener('orientationchange', handleResize);
      window.addEventListener('resize', handleResize);

      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      // User location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (m && map.current) {
              m.setCenter([pos.coords.longitude, pos.coords.latitude]);
            }
          },
          () => {},
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      }
    } catch (e) {
      console.warn('Map initialization note:', e);
      setMapError(true);
    }

    return () => {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
      if (m) {
        try {
          m.remove();
        } catch {
          // ignore cleanup errors
        }
      }
      map.current = null;
    };
  }, [darkMode]);

  // Re-add markers whenever incidents or mapLoaded changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    liveIncidents.forEach(incident => {
      if (!incident.location || typeof incident.location.lat !== 'number' || typeof incident.location.lng !== 'number') return;

      const el = document.createElement('div');
      const color = INCIDENT_COLORS[incident.type] || INCIDENT_COLORS.default;
      el.style.cssText = `
        width:40px;height:40px;border-radius:50%;
        border:2.5px solid white;background:${color};
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;
      `;
      el.innerHTML = getIncidentSvg(incident.type);

      const popupBg = darkMode ? '#0f172a' : '#ffffff';
      const popupText = darkMode ? '#f8fafc' : '#0f172a';
      const popupMuted = darkMode ? '#cbd5e1' : '#475569';
      const popupBorder = darkMode ? '#334155' : '#e2e8f0';

      const popup = new maplibregl.Popup({
        offset: 24,
        maxWidth: '260px',
        className: 'ndrs-maplibre-popup'
      }).setHTML(`
        <div style="padding:12px 14px;background:${popupBg};color:${popupText};border-radius:14px;border:1px solid ${popupBorder};font-family:inherit;box-shadow:0 10px 25px rgba(0,0,0,0.25);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <strong style="font-size:14px;color:${popupText};font-weight:800;">${incident.type}</strong>
            <span style="font-size:11px;padding:2px 8px;border-radius:999px;background:${color}22;color:${color};font-weight:700;">${incident.status}</span>
          </div>
          <p style="font-size:12px;margin:0;color:${popupMuted};line-height:1.5;">${incident.description || 'Incident reported.'}</p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener('click', () => onMarkerClick?.(incident));
      markers.current.push(marker);
    });

    // Draggable confirm-location marker
    if (onLocationSelect && selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number') {
      const pin = document.createElement('div');
      pin.style.cssText = `
        width:48px;height:48px;border-radius:50%;
        border:3px solid white;background:#dc2626;
        box-shadow:0 4px 16px rgba(220,38,38,0.5);
        display:flex;align-items:center;justify-content:center;cursor:grab;
      `;
      pin.innerHTML = SVG_ICONS.PIN;

      const confirmMarker = new maplibregl.Marker({ element: pin, anchor: 'center', draggable: true })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current);

      confirmMarker.on('dragend', () => {
        const { lat, lng } = confirmMarker.getLngLat();
        onLocationSelect({ lat, lng });
      });
      markers.current.push(confirmMarker);
    }
  }, [liveIncidents, selectedLocation, onLocationSelect, mapLoaded, darkMode]);

  // Fit map to show all incidents
  useEffect(() => {
    if (!map.current || !mapLoaded || liveIncidents.length === 0) return;
    try {
      const bounds = new maplibregl.LngLatBounds();
      liveIncidents.forEach(i => {
        if (i.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number') {
          bounds.extend([i.location.lng, i.location.lat]);
        }
      });
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
      }
    } catch {
      // ignore fitBounds calculation errors
    }
  }, [liveIncidents, mapLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320 }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: 'inherit' }} />

      {/* Loading overlay */}
      {!mapLoaded && !mapError && (
        <div style={{
          position: 'absolute', inset: 0,
          background: darkMode ? '#0f172a' : '#e2e8f0',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <Loader2
            size={32}
            style={{ color: '#174ea6', animation: 'spin 1s linear infinite' }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#94a3b8' : '#64748b' }}>
            Loading map…
          </span>
        </div>
      )}

      {/* Error state */}
      {mapError && (
        <div style={{
          position: 'absolute', inset: 0,
          background: darkMode ? '#0f172a' : '#f8fafc',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <MapPin size={32} style={{ color: '#94a3b8' }} />
          <span style={{ fontSize: 14, color: '#64748b', textAlign: 'center', padding: '0 16px' }}>
            Map failed to load. Check your connection and try again.
          </span>
        </div>
      )}
    </div>
  );
}
