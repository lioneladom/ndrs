import React, { useRef, useEffect, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Flame, Droplets, HeartPulse, Car, ShieldAlert, AlertTriangle, 
  Mountain, Wind, Zap, MapPin, Loader2
} from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

const getIncidentIcon = (type) => {
  switch (type) {
    case 'FIRE':       return <Flame size={20} color="white" />;
    case 'FLOOD':      return <Droplets size={20} color="white" />;
    case 'MEDICAL':    return <HeartPulse size={20} color="white" />;
    case 'ACCIDENT':   return <Car size={20} color="white" />;
    case 'POLICE':     return <ShieldAlert size={20} color="white" />;
    case 'EARTHQUAKE': return <AlertTriangle size={20} color="white" />;
    case 'LANDSLIDE':  return <Mountain size={20} color="white" />;
    case 'STORM':      return <Wind size={20} color="white" />;
    case 'POWER':      return <Zap size={20} color="white" />;
    default:           return <AlertTriangle size={20} color="white" />;
  }
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

    const m = new maplibregl.Map({
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

    // Low-accuracy user location (fast: uses WiFi/cell, not GPS)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          m.setCenter([pos.coords.longitude, pos.coords.latitude]);
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }

    return () => {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('resize', handleResize);
      m.remove();
      map.current = null;
    };
  }, [darkMode]);

  // Re-add markers whenever incidents or mapLoaded changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    liveIncidents.forEach(incident => {
      const el = document.createElement('div');
      const color = INCIDENT_COLORS[incident.type] || INCIDENT_COLORS.default;
      el.style.cssText = `
        width:40px;height:40px;border-radius:50%;
        border:2.5px solid white;background:${color};
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;
      `;
      el.innerHTML = ReactDOMServer.renderToString(getIncidentIcon(incident.type));

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
    if (onLocationSelect && selectedLocation) {
      const pin = document.createElement('div');
      pin.style.cssText = `
        width:48px;height:48px;border-radius:50%;
        border:3px solid white;background:#dc2626;
        box-shadow:0 4px 16px rgba(220,38,38,0.5);
        display:flex;align-items:center;justify-content:center;cursor:grab;
      `;
      pin.innerHTML = ReactDOMServer.renderToString(<MapPin size={24} color="white" />);

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
    const bounds = new maplibregl.LngLatBounds();
    liveIncidents.forEach(i => bounds.extend([i.location.lng, i.location.lat]));
    map.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
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
