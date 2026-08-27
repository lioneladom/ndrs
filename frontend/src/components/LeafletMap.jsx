import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';
import { Navigation, Satellite, Moon, Mountain, MapPin } from 'lucide-react';

// ─── SVG Icon Paths ────────────────────────────────────────────────────────────
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
  default: '#6b7280'
};

// Custom Marker Generator using pure SVG
const getMarkerIcon = (type, status) => {
  const color = INCIDENT_COLORS[type] || INCIDENT_COLORS.default;
  const svgPath = SVG_ICONS[type] || SVG_ICONS.DEFAULT;
  const isPulsing = status === 'New' || status === 'Dispatched' || status === 'en-route' || status === 'On-Scene';

  return L.divIcon({
    html: `
      <div style="
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
      ">
        ${svgPath}
        ${isPulsing ? `
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 3px solid ${color};
            animation: marker-pulse 1.8s ease-out infinite;
            opacity: 0;
            pointer-events: none;
          "></div>
        ` : ''}
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
  });
};

// User location marker icon
const userIcon = L.divIcon({
  html: `
    <div style="
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
    ">
      <div style="
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px solid #174ea6;
        animation: marker-pulse 1.8s ease-out infinite;
        opacity: 0;
        pointer-events: none;
      "></div>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Draggable selected location pin icon
const pinIcon = L.divIcon({
  html: `
    <div style="
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
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

const isResolved = (incident) => incident?.status?.toLowerCase() === 'resolved';

// Map panning controller
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center[0] === 'number' && typeof center[1] === 'number') {
      map.setView(center, zoom || 14, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

// Auto-fit incidents bounds
function FitBoundsView({ incidents }) {
  const map = useMap();
  useEffect(() => {
    if (!incidents || incidents.length === 0) return;
    try {
      const validPoints = incidents
        .filter(i => i.location && typeof i.location.lat === 'number' && typeof i.location.lng === 'number')
        .map(i => [i.location.lat, i.location.lng]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } catch {
      // ignore
    }
  }, [incidents, map]);
  return null;
}

// Component to handle user location
function UserLocationMarker({ setUserLocation, userLocation, darkMode }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(newPos);
        if (!userLocation) {
          map.setView(newPos, 15);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, setUserLocation, userLocation]);

  return userLocation ? (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        <div style={{ color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '13px', fontWeight: 800 }}>
          Your Current Location
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function LeafletMap({
  center = [5.6037, -0.1870],
  zoom = 13,
  incidents = [],
  resources = [],
  onMarkerClick = null,
  selectedLocation = null,
  onLocationSelect = null,
  darkMode: propDarkMode
}) {
  const themeContext = useTheme();
  const darkMode = propDarkMode !== undefined ? propDarkMode : themeContext?.darkMode;
  const [userLocation, setUserLocation] = useState(null);
  const [activeLayer, setActiveLayer] = useState(() => (darkMode ? 'dark' : 'streets'));

  useEffect(() => {
    setActiveLayer(darkMode ? 'dark' : 'streets');
  }, [darkMode]);

  const liveIncidents = useMemo(
    () => incidents.filter((incident) => !isResolved(incident)),
    [incidents]
  );

  // Draw dispatch route lines
  const activeRoutes = [];
  resources.forEach(res => {
    if (res.assignedTo && res.availability === 'Dispatched') {
      const inc = liveIncidents.find(i => i.id === res.assignedTo);
      if (inc && inc.location && res.location) {
        activeRoutes.push({
          id: `${res.id}-${inc.id}`,
          positions: [
            [res.location.lat, res.location.lng],
            [inc.location.lat, inc.location.lng]
          ],
          color: '#174ea6'
        });
      }
    }
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320 }}>
      {/* Interactive Layer Switcher */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        borderRadius: 14,
        backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
      }}>
        {[
          { id: 'streets', label: 'Streets', icon: Navigation },
          { id: 'satellite', label: 'Satellite', icon: Satellite },
          { id: 'dark', label: 'Dark', icon: Moon },
          { id: 'topo', label: 'Terrain', icon: Mountain },
        ].map(layer => {
          const isSelected = activeLayer === layer.id;
          const Icon = layer.icon;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayer(layer.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: isSelected ? 'var(--ndrs-blue)' : 'transparent',
                color: isSelected ? '#ffffff' : (darkMode ? '#94a3b8' : '#475569'),
                fontWeight: isSelected ? 800 : 600,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={13} />
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Standalone 100% Free Tile Layers */}
        {activeLayer === 'satellite' && (
          <>
            <TileLayer
              key="sat"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              key="sat-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            />
          </>
        )}

        {activeLayer === 'dark' && (
          <>
            <TileLayer
              key="dark-base"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              key="dark-ref"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            />
          </>
        )}

        {activeLayer === 'topo' && (
          <TileLayer
            key="topo"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {activeLayer === 'streets' && (
          <TileLayer
            key="streets"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <ChangeMapView center={userLocation || center} zoom={userLocation ? 15 : zoom} />
        <FitBoundsView incidents={liveIncidents} />
        <UserLocationMarker setUserLocation={setUserLocation} userLocation={userLocation} darkMode={darkMode} />

        {/* Live Incident Markers */}
        {liveIncidents.map(inc => {
          if (!inc.location || typeof inc.location.lat !== 'number' || typeof inc.location.lng !== 'number') return null;
          return (
            <Marker
              key={inc.id}
              position={[inc.location.lat, inc.location.lng]}
              icon={getMarkerIcon(inc.type, inc.status)}
              eventHandlers={{ click: () => onMarkerClick && onMarkerClick(inc, 'incident') }}
            >
              <Popup className="ndrs-leaflet-popup">
                <div style={{
                  color: darkMode ? '#f8fafc' : '#0f172a',
                  minWidth: '180px',
                  fontFamily: 'inherit',
                  padding: '4px 2px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      {inc.type}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: inc.status === 'New' ? '#fee2e2' : '#dbeafe',
                      color: inc.status === 'New' ? '#dc2626' : '#2563eb'
                    }}>
                      {inc.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: darkMode ? '#cbd5e1' : '#475569', lineHeight: '1.45' }}>
                    {inc.description}
                  </p>
                  {inc.severity && (
                    <div style={{ marginTop: 4 }}>
                      <span style={{ 
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        backgroundColor: inc.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                        color: inc.severity === 'CRITICAL' ? '#dc2626' : '#b45309',
                        fontWeight: '800'
                      }}>
                        {inc.severity}
                      </span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Selected confirm pin marker (for reporting) */}
        {selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number' && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={pinIcon}
            draggable={!!onLocationSelect}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onLocationSelect?.({ lat: position.lat, lng: position.lng });
              }
            }}
          />
        )}

        {/* Active Dispatch Routes */}
        {activeRoutes.map(route => (
          <Polyline
            key={route.id}
            positions={route.positions}
            color={route.color}
            dashArray="6, 6"
            weight={3.5}
          />
        ))}
      </MapContainer>
    </div>
  );
}
