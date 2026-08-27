import React, { useState, useEffect } from 'react';
import { Flame, Briefcase, CloudRain, ChevronUp, AlertCircle, Phone, Shield, Car, X, Clock } from 'lucide-react';
import LeafletMap from '../components/LeafletMap.jsx';
import TimeAgo from '../components/TimeAgo.jsx';

export default function MapView({ incidents = [], resources = [] }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  // Set default selected item to the first critical flood incident
  useEffect(() => {
    if (incidents.length > 0 && !selectedItem) {
      const defaultInc = incidents.find(i => i.type === 'FLOOD' && i.severity === 'CRITICAL') || incidents[0];
      setSelectedItem(defaultInc);
    }
  }, [incidents]);

  const handleMarkerClick = (item) => {
    setSelectedItem(item);
  };

  const filteredIncidents = incidents.filter(inc => {
    if (activeFilter === 'ALL') return true;
    return inc.type === activeFilter;
  });

  const fireCount = incidents.filter(i => i.type === 'FIRE').length;
  const medicalCount = incidents.filter(i => i.type === 'MEDICAL').length;
  const floodCount = incidents.filter(i => i.type === 'FLOOD').length;

  const filters = [
    { id: 'ALL', label: `All (${incidents.length})` },
    { id: 'FIRE', label: `Fires (${fireCount})`, icon: Flame, color: 'var(--ndrs-red)' },
    { id: 'MEDICAL', label: `Medical (${medicalCount})`, icon: Briefcase, color: 'var(--ndrs-green)' },
    { id: 'FLOOD', label: `Flood (${floodCount})`, icon: CloudRain, color: 'var(--ndrs-blue)' },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: selectedItem ? '1.5fr 400px' : '1fr', 
      gap: '24px', 
      height: 'calc(100vh - 150px)'
    }}>
      {/* Left side: Map */}
      <div style={{ 
        position: 'relative', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: 'var(--ndrs-shadow-sm)', 
        background: '#cfe8ef' 
      }}>
        {/* Filter overlay */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid rgba(16, 24, 40, 0.10)',
          borderRadius: '14px',
          padding: '8px',
          boxShadow: 'var(--ndrs-shadow-sm)',
          display: 'flex',
          gap: '8px',
          zIndex: 1000
        }}>
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeFilter === filter.id ? 'var(--ndrs-blue-soft)' : 'transparent',
                  color: activeFilter === filter.id ? 'var(--ndrs-blue)' : 'var(--ndrs-muted)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {Icon && <Icon size={16} />}
                {filter.label}
              </button>
            );
          })}
        </div>

        <LeafletMap
          incidents={filteredIncidents}
          resources={resources}
          onMarkerClick={handleMarkerClick}
          center={selectedItem ? [selectedItem.location?.lat || 5.5601, selectedItem.location?.lng || -0.2084] : [5.5601, -0.2084]}
          zoom={14}
        />
      </div>

      {/* Right side: Details panel */}
      {selectedItem && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(16, 24, 40, 0.10)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: 'var(--ndrs-shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              padding: '4px 12px',
              borderRadius: '999px',
              background: selectedItem.severity === 'CRITICAL' ? 'var(--ndrs-red-soft)' : 'var(--ndrs-gold-soft)',
              color: selectedItem.severity === 'CRITICAL' ? 'var(--ndrs-red)' : '#854d0e',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              {selectedItem.severity || 'CRITICAL'}
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                background: 'rgba(16, 24, 40, 0.05)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ndrs-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 
                selectedItem.type === 'FIRE' ? 'var(--ndrs-red-soft)' :
                selectedItem.type === 'FLOOD' ? 'var(--ndrs-blue-soft)' :
                selectedItem.type === 'MEDICAL' ? 'rgba(16, 185, 129, 0.15)' : 'var(--ndrs-gold-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 
                selectedItem.type === 'FIRE' ? 'var(--ndrs-red)' :
                selectedItem.type === 'FLOOD' ? 'var(--ndrs-blue)' :
                selectedItem.type === 'MEDICAL' ? 'var(--ndrs-green)' : 'var(--ndrs-gold)'
            }}>
              {selectedItem.type === 'FIRE' && <Flame size={24} />}
              {selectedItem.type === 'FLOOD' && <CloudRain size={24} />}
              {selectedItem.type === 'MEDICAL' && <Briefcase size={24} />}
              {(selectedItem.type === 'POLICE' || selectedItem.type === 'ACCIDENT') && <Car size={24} />}
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-title)',
                fontSize: '20px',
                fontWeight: '900',
                color: 'var(--ndrs-ink)',
                margin: 0
              }}>
                {selectedItem.type === 'FIRE' && 'Fire Outbreak'}
                {selectedItem.type === 'FLOOD' && 'Active Flood Area'}
                {selectedItem.type === 'MEDICAL' && 'Medical Emergency'}
                {selectedItem.type === 'POLICE' && 'Police Dispatch'}
                {(selectedItem.type === 'ACCIDENT') && 'Accident Scene'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--ndrs-muted)' }}>
                  {selectedItem.distance || '0.8 km away'}
                </span>
                {(selectedItem.timestamp || selectedItem.createdAt) && (
                  <>
                    <span style={{ fontSize: '12px', color: 'var(--ndrs-muted)' }}>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--ndrs-muted)' }}>
                      <Clock size={11} />
                      <TimeAgo date={selectedItem.timestamp || selectedItem.createdAt} />
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            color: 'var(--ndrs-muted)',
            lineHeight: '1.6',
            margin: 0
          }}>
            {selectedItem.description || 'Active emergency report under verification by authorities.'}
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--ndrs-blue), var(--ndrs-blue-700))',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => alert(`Showing safety protocol checklists for ${selectedItem.type} emergencies.`)}
            >
              See Safety Protocols
            </button>
            <a
              href="tel:112"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--ndrs-red-soft)',
                color: 'var(--ndrs-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                textDecoration: 'none'
              }}
            >
              <Phone size={20} />
            </a>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          div[style*="grid-template-columns"] > div:first-child {
            height: 500px !important;
          }
        }
      `}</style>
    </div>
  );
}
