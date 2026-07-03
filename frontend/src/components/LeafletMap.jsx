import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// ─── SVG Icon Paths ────────────────────────────────────────────────────────────
const SVG_ICONS = {
  // Flame (fire)
  FIRE: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  // Cloud-rain (flood)
  FLOOD: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  // Cross / briefcase (medical)
  MEDICAL: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  // Car (accident)
  ACCIDENT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5v-5l2-7h10l2 7z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>`,
};

// Custom Marker Generator using pure SVG
const getMarkerIcon = (type, status, name = '') => {
  let color = '#174ea6';
  let svgPath = SVG_ICONS.FIRE;

  if (type === 'FIRE') {
    color = '#d92b2b';
    svgPath = SVG_ICONS.FIRE;
  } else if (type === 'FLOOD') {
    color = '#174ea6';
    svgPath = SVG_ICONS.FLOOD;
  } else if (type === 'MEDICAL') {
    color = '#0f9d58';
    svgPath = SVG_ICONS.MEDICAL;
  } else if (type === 'ACCIDENT') {
    color = '#f4b400';
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
        width: 42px;
        height: 42px;
        background-color: ${color};
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
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
    iconSize: [42, 42],
    iconAnchor: [21, 21],
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
function UserLocationMarker({ setUserLocation, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(newPos);
        if (!userLocation) {
          map.setView(newPos, 15);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, setUserLocation, userLocation]);

  return userLocation ? (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: 'bold' }}>
          Your location
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
}) {
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
    >
      {/* Carto Voyager tiles - clean, modern map style */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <ChangeMapView center={userLocation || center} zoom={userLocation ? 15 : zoom} />
      <UserLocationMarker setUserLocation={setUserLocation} userLocation={userLocation} />

      {liveIncidents.map(inc => (
        <Marker
          key={inc.id}
          position={[inc.location.lat, inc.location.lng]}
          icon={getMarkerIcon(inc.type, inc.status)}
          eventHandlers={{ click: () => onMarkerClick && onMarkerClick(inc, 'incident') }}
        >
          <Popup>
            <div style={{ color: '#0f172a', minWidth: '180px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '900' }}>{inc.type} Report</h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{inc.description}</p>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 8px', borderRadius: '999px',
                  backgroundColor: inc.status === 'New' ? '#fee2e2' : '#dbeafe',
                  color: inc.status === 'New' ? '#d92b2b' : '#174ea6', fontWeight: 'bold'
                }}>{inc.status}</span>
                {inc.severity && (
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '999px',
                    backgroundColor: inc.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                    color: inc.severity === 'CRITICAL' ? '#d92b2b' : '#92400e', fontWeight: 'bold'
                  }}>{inc.severity}</span>
                )}
              </div>
              {inc.media && inc.media.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Attachments: {inc.media.length}</p>
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
