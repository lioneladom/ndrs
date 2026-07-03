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
    case 'FIRE': return <Flame size={24} color="white" />;
    case 'FLOOD': return <Droplets size={24} color="white" />;
    case 'MEDICAL': return <HeartPulse size={24} color="white" />;
    case 'ACCIDENT': return <Car size={24} color="white" />;
    case 'POLICE': return <ShieldAlert size={24} color="white" />;
    case 'EARTHQUAKE': return <AlertTriangle size={24} color="white" />;
    case 'LANDSLIDE': return <Mountain size={24} color="white" />;
    case 'STORM': return <Wind size={24} color="white" />;
    case 'POWER': return <Zap size={24} color="white" />;
    default: return <AlertTriangle size={24} color="white" />;
  }
};

const INCIDENT_COLORS = {
  FIRE: '#dc2626',
  FLOOD: '#2563eb',
  MEDICAL: '#16a34a',
  ACCIDENT: '#f59e0b',
  POLICE: '#7c3aed',
  EARTHQUAKE: '#b45309',
  LANDSLIDE: '#92400e',
  STORM: '#0f172a',
  POWER: '#ca8a04',
  default: '#6b7280'
};

const isResolved = (incident) => incident?.status?.toLowerCase() === 'resolved';

// OpenFreeMap — fast, free, no API key, mobile-optimised
const TILE_STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const TILE_STYLE_DARK  = 'https://tiles.openfreemap.org/styles/dark';

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
  const markers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const liveIncidents = useMemo(
    () => incidents.filter((incident) => !isResolved(incident)),
    [incidents]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    setMapLoaded(false);

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: darkMode ? TILE_STYLE_DARK : TILE_STYLE_LIGHT,
      center: [center[1], center[0]], // [lng, lat]
      zoom: zoom,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxTileCacheSize: 20, // Keep memory footprint small on mobile
    });

    map.current.on('load', () => setMapLoaded(true));

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Get user location (low-accuracy = uses network, much faster on mobile)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(loc);
          map.current?.setCenter(loc);
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 30000 }
      );
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [darkMode]);

  // Update markers when incidents/mapLoaded changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    liveIncidents.forEach(incident => {
      const el = document.createElement('div');
      el.className = 'incident-marker';
      el.style.cssText = `
        width:48px;height:48px;border-radius:50%;border:3px solid white;
        background-color:${INCIDENT_COLORS[incident.type] || INCIDENT_COLORS.default};
        box-shadow:0 4px 14px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;cursor:pointer;
      `;
      el.innerHTML = ReactDOMServer.renderToString(getIncidentIcon(incident.type));

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="min-width:200px;color:${darkMode ? '#f1f5f9' : '#0f172a'};background:${darkMode ? '#1e293b' : 'white'};padding:12px;border-radius:12px;">
              <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:900;">${incident.type}</h3>
              <p style="margin:0 0 8px 0;font-size:14px;color:${darkMode ? '#94a3b8' : '#64748b'};line-height:1.5;">${incident.description}</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span style="padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;background:${incident.status === 'New' ? '#fee2e2' : '#dbeafe'};color:${incident.status === 'New' ? '#d92b2b' : '#174ea6'};">${incident.status}</span>
                ${incident.severity ? `<span style="padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;background:${incident.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7'};color:${incident.severity === 'CRITICAL' ? '#d92b2b' : '#92400e'};">${incident.severity}</span>` : ''}
                ${incident.media?.length ? `<span style="padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;background:#dbeafe;color:#174ea6;">${incident.media.length} file${incident.media.length > 1 ? 's' : ''}</span>` : ''}
              </div>
            </div>
          `)
        )
        .addTo(map.current);

      el.addEventListener('click', () => {
        setSelectedMarker(incident.id);
        onMarkerClick?.(incident);
      });

      markers.current.push(marker);
    });

    if (onLocationSelect && selectedLocation) {
      const confirmEl = document.createElement('div');
      confirmEl.style.cssText = `
        width:56px;height:56px;border-radius:50%;border:4px solid white;
        background:#dc2626;box-shadow:0 6px 20px rgba(220,38,38,0.5);
        display:flex;align-items:center;justify-content:center;cursor:grab;
      `;
      confirmEl.innerHTML = ReactDOMServer.renderToString(<MapPin size={28} color="white" />);

      const confirmMarker = new maplibregl.Marker({ element: confirmEl, anchor: 'center', draggable: true })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current);

      confirmMarker.on('dragend', () => {
        const lngLat = confirmMarker.getLngLat();
        onLocationSelect({ lat: lngLat.lat, lng: lngLat.lng });
      });

      markers.current.push(confirmMarker);
    }
  }, [liveIncidents, selectedLocation, onLocationSelect, darkMode, mapLoaded]);

  // Fit bounds to incidents
  useEffect(() => {
    if (!map.current || !mapLoaded || liveIncidents.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    liveIncidents.forEach(i => bounds.extend([i.location.lng, i.location.lat]));
    map.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 600 });
  }, [liveIncidents, mapLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Loading skeleton shown while tiles fetch */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: darkMode ? '#0f172a' : '#e2e8f0',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12, borderRadius: '24px'
        }}>
          <Loader2 size={32} style={{ color: '#174ea6', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#94a3b8' : '#64748b' }}>
            Loading map…
          </span>
        </div>
      )}
    </div>
  );
}
