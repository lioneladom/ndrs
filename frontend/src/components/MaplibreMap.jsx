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

// Lightweight raster tile style — loads instantly on mobile, no WebGL font/sprite overhead
function buildRasterStyle(dark) {
  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: dark
          // CartoDB dark raster — fast CDN, no API key
          ? ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
             'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png']
          : ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
             'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
             'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
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
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

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

      const popup = new maplibregl.Popup({ offset: 24, maxWidth: '240px' }).setHTML(`
        <div style="padding:10px 12px;font-family:sans-serif;">
          <strong style="font-size:14px;">${incident.type} — ${incident.status}</strong>
          <p style="font-size:12px;margin:6px 0 0;color:#555;line-height:1.4;">${incident.description || ''}</p>
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
  }, [liveIncidents, selectedLocation, onLocationSelect, mapLoaded]);

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
