import React, { useRef, useEffect, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Flame, Droplets, HeartPulse, Car, ShieldAlert, AlertTriangle, 
  Mountain, Wind, Zap, MapPin, HandHelping
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
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const liveIncidents = useMemo(
    () => incidents.filter((incident) => !isResolved(incident)),
    [incidents]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize MapLibre map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: darkMode 
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' 
        : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [center[1], center[0]], // [lng, lat]
      zoom: zoom,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(loc);
          map.current?.setCenter(loc);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [darkMode]);

  // Update markers when incidents change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add incident markers
    liveIncidents.forEach(incident => {
      const el = document.createElement('div');
      el.className = 'incident-marker';
      el.style.width = '48px';
      el.style.height = '48px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.backgroundColor = INCIDENT_COLORS[incident.type] || INCIDENT_COLORS.default;
      el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.innerHTML = ReactDOMServer.renderToString(getIncidentIcon(incident.type));

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="min-width: 200px; color: ${darkMode ? '#f1f5f9' : '#0f172a'}; background-color: ${darkMode ? '#1e293b' : 'white'}; padding: 12px; border-radius: 12px;">
              <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 900;">${incident.type}</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: ${darkMode ? '#94a3b8' : '#64748b'}; line-height: 1.5;">${incident.description}</p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span style="padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; background-color: ${incident.status === 'New' ? '#fee2e2' : '#dbeafe'}; color: ${incident.status === 'New' ? '#d92b2b' : '#174ea6'};">${incident.status}</span>
                ${incident.severity ? `<span style="padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; background-color: ${incident.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7'}; color: ${incident.severity === 'CRITICAL' ? '#d92b2b' : '#92400e'};">${incident.severity}</span>` : ''}
                ${incident.media && incident.media.length > 0 ? `<span style="padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; background-color: #dbeafe; color: #174ea6;">${incident.media.length} attachment${incident.media.length > 1 ? 's' : ''}</span>` : ''}
              </div>
            </div>
          `)
        )
        .addTo(map.current);

      el.addEventListener('click', () => {
        setSelectedMarker(incident.id);
        onMarkerClick && onMarkerClick(incident);
      });

      markers.current.push(marker);
    });

    // If we have a selected location for report confirmation, add a draggable marker
    if (onLocationSelect && selectedLocation) {
      const confirmEl = document.createElement('div');
      confirmEl.className = 'confirm-location-marker';
      confirmEl.style.width = '56px';
      confirmEl.style.height = '56px';
      confirmEl.style.borderRadius = '50%';
      confirmEl.style.border = '4px solid white';
      confirmEl.style.backgroundColor = '#dc2626';
      confirmEl.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.5)';
      confirmEl.style.display = 'flex';
      confirmEl.style.alignItems = 'center';
      confirmEl.style.justifyContent = 'center';
      confirmEl.innerHTML = ReactDOMServer.renderToString(<MapPin size={28} color="white" />);
      confirmEl.style.cursor = 'grab';

      const confirmMarker = new maplibregl.Marker({
        element: confirmEl,
        anchor: 'center',
        draggable: true
      })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current);

      confirmMarker.on('dragend', () => {
        const lngLat = confirmMarker.getLngLat();
        onLocationSelect({ lat: lngLat.lat, lng: lngLat.lng });
      });

      markers.current.push(confirmMarker);
    }
  }, [liveIncidents, selectedLocation, onLocationSelect, darkMode]);

  // Fit bounds if we have incidents
  useEffect(() => {
    if (!map.current || liveIncidents.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    liveIncidents.forEach(incident => {
      bounds.extend([incident.location.lng, incident.location.lat]);
    });

    map.current.fitBounds(bounds, {
      padding: 100,
      maxZoom: 15,
      duration: 1000
    });
  }, [liveIncidents]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '24px',
        overflow: 'hidden'
      }}
    />
  );
}
