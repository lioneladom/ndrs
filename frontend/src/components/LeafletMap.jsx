import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';

// ─── SVG Icon Paths ────────────────────────────────────────────────────────────
const SVG_ICONS = {
  FIRE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  FLOOD: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  MEDICAL: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  ACCIDENT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5v-5l2-7h10l2 7z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>`,
};

// Custom Marker Generator using pure SVG
const getMarkerIcon = (type, status) => {
  let color = '#174ea6';
  let svgPath = SVG_ICONS.FIRE;

  if (type === 'FIRE') {
    color = '#dc2626';
    svgPath = SVG_ICONS.FIRE;
  } else if (type === 'FLOOD') {
    color = '#2563eb';
    svgPath = SVG_ICONS.FLOOD;
  } else if (type === 'MEDICAL') {
    color = '#16a34a';
    svgPath = SVG_ICONS.MEDICAL;
  } else if (type === 'ACCIDENT') {
    color = '#f59e0b';
    svgPath = SVG_ICONS.ACCIDENT;
  }

  const isPulsing = status === 'New' || status === 'Dispatched' || status === 'en-route' || status === 'On-Scene';
  const svgEncoded = svgPath.replace(/"/g, "'");

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
        ${svgEncoded}
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

const isResolved = (incident) => incident?.status?.toLowerCase() === 'resolved';

// Map panning controller
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
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
  darkMode: propDarkMode
}) {
  const themeContext = useTheme();
  const darkMode = propDarkMode !== undefined ? propDarkMode : themeContext?.darkMode;
  const [userLocation, setUserLocation] = useState(null);
  const liveIncidents = useMemo(
    () => incidents.filter((incident) => !isResolved(incident)),
    [incidents]
  );

  // Draw dispatch route lines
  const activeRoutes = [];
  resources.forEach(res => {
    if (res.assignedTo && res.availability === 'Dispatched') {
      const inc = liveIncidents.find(i => i.id === res.assignedTo);
      if (inc) {
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
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%', borderRadius: '24px' }}
      zoomControl={true}
      attributionControl={false}
    >
      {/* 100% Free, Standalone Esri tiles - Zero API keys, zero watermarks */}
      {darkMode ? (
        <>
          <TileLayer
            key="esri-dark-base"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />
          <TileLayer
            key="esri-dark-ref"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          />
        </>
      ) : (
        <TileLayer
          key="esri-street"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
      )}

      <ChangeMapView center={userLocation || center} zoom={userLocation ? 15 : zoom} />
      <UserLocationMarker setUserLocation={setUserLocation} userLocation={userLocation} darkMode={darkMode} />

      {liveIncidents.map(inc => (
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
      ))}

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
  );
}
