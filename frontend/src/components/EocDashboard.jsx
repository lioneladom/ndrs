import React, { useState } from 'react';
import { Shield, Radio, CheckCircle, Flame, CloudRain, Briefcase, MapPin, Clock, Truck, Satellite, Wifi, AlertCircle, Users } from 'lucide-react';
import LeafletMap from './LeafletMap.jsx';
import TimeAgo from './TimeAgo.jsx';
import { api } from '../utils/api.js';

export default function EocDashboard({
  incidents = [],
  resources = [],
  dispatches = []
}) {
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [etaInput, setEtaInput] = useState('10 mins');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  // Filter available resources for dispatch
  const availableResources = resources.filter(res => res.availability === 'Available');

  // Compute metrics
  const totalCases = incidents.length;
  const pendingCases = incidents.filter(i => i.status === 'New').length;
  const activeDispatches = dispatches.filter(d => d.status !== 'resolved').length;
  const resolvedCases = incidents.filter(i => i.status === 'Resolved').length;

  const handleIncidentSelect = (id) => {
    setSelectedIncidentId(id);
    setSelectedResourceId('');
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncidentId || !selectedResourceId) return;

    setIsSubmitting(true);
    try {
      await api.dispatch({
        incidentId: selectedIncidentId,
        resourceId: selectedResourceId,
        eta: etaInput
      });
      setSelectedResourceId('');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Failed to dispatch resource:', err);
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async (id) => {
    try {
      await api.resolveIncident(id);
      if (selectedIncidentId === id) {
        setSelectedIncidentId(null);
      }
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    }
  };

  return (
    <div className="dashboard-pane">
      {/* Top Header */}
      <div className="eoc-header">
        <div className="eoc-header-title">
          <Shield size={22} className="text-blue-500" />
          <span>National Emergency Operations Center (EOC)</span>
          <span className="eoc-logo-badge">DISPATCH CONSOLE</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#94a3b8', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Satellite size={14} color="#60a5fa" /> GPS Link: Connected</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Wifi size={14} color="#34d399" /> Live Node: Online</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
        padding: '16px 24px',
        backgroundColor: '#0a0d17',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        gap: '16px'
      }}>
        <div style={{ backgroundColor: '#131929', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Incidents</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', marginTop: '4px' }}>{totalCases}</h3>
        </div>
        
        <div style={{ backgroundColor: '#131929', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #fbbf24' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>New Reports</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>{pendingCases}</h3>
        </div>

        <div style={{ backgroundColor: '#131929', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Dispatches</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#3b82f6', marginTop: '4px' }}>{activeDispatches}</h3>
        </div>

        <div style={{ backgroundColor: '#131929', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Resolved cases</span>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{resolvedCases}</h3>
        </div>
      </div>

      {/* Main Console Split */}
      <div className="eoc-main-content">
        {/* Left Side: Incident Feeds */}
        <div className="eoc-sidebar">
          <div className="eoc-sidebar-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={15} color="#ef4444" /> Live Incident Feed</span>
            <span style={{ fontSize: '11px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              Real-time
            </span>
          </div>
          
          <div className="eoc-scroll-area">
            {incidents.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                No active incidents reported.
              </div>
            ) : (
              incidents.map(inc => (
                <div 
                  key={inc.id}
                  className={`eoc-incident-card ${selectedIncidentId === inc.id ? 'active-selected' : ''}`}
                  onClick={() => handleIncidentSelect(inc.id)}
                >
                  <div className="eoc-card-header">
                    <span className={`eoc-card-type ${inc.type.toLowerCase()}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {inc.type === 'FIRE' ? <><Flame size={13} /> FIRE</> :
                       inc.type === 'FLOOD' ? <><CloudRain size={13} /> FLOOD</> :
                       inc.type === 'MEDICAL' ? <><Briefcase size={13} /> MEDICAL</> :
                       <><Shield size={13} /> POLICE</>}
                    </span>
                    <span className={`eoc-card-status ${inc.status.toLowerCase()}`}>
                      {inc.status}
                    </span>
                  </div>
                  <p className="eoc-card-desc">{inc.description}</p>
                  
                  <div className="eoc-card-footer">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} /> {inc.location.lat.toFixed(4)}, {inc.location.lng.toFixed(4)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> <TimeAgo date={inc.timestamp || inc.createdAt} /></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Map & Resources */}
        <div className="eoc-map-pane">
          {/* Leaflet Live Map */}
          <div className="eoc-map-container">
            <LeafletMap
              incidents={incidents}
              resources={resources}
              center={selectedIncident ? [selectedIncident.location.lat, selectedIncident.location.lng] : [5.6037, -0.1870]}
              zoom={13}
              onMarkerClick={(item) => handleIncidentSelect(item.id)}
            />
          </div>

          {/* Bottom Resource List and Dispatch forms */}
          <div className="eoc-bottom-panel">
            {/* Resources list */}
            <div className="eoc-panel-col">
              <span className="eoc-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={13} /> Fleet Status Directory</span>
              <div className="eoc-resources-grid">
                {resources.map(res => (
                  <div key={res.id} className="eoc-resource-card">
                    <div>
                      <span className="eoc-resource-name">{res.name}</span>
                      <div className="eoc-resource-type">
                        {res.type.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <span className={`eoc-resource-status-badge ${res.availability.toLowerCase()}`}>
                      {res.availability}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Dispatch control panel */}
            <div className="eoc-panel-col">
              <span className="eoc-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Truck size={13} /> Dispatch Operations Command</span>
              {selectedIncident ? (
                selectedIncident.status === 'Resolved' ? (
                  <div className="dispatch-form" style={{ justifyContent: 'center', alignItems: 'center', color: '#10b981', textAlign: 'center' }}>
                    <CheckCircle size={32} />
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Incident Resolved</span>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>This incident file is closed and resolved.</p>
                  </div>
                ) : selectedIncident.status === 'Dispatched' || selectedIncident.status === 'Acknowledged' ? (
                  <div className="dispatch-form">
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24' }}>
                      Status: Responder en-route / On-Scene
                    </span>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Unit is tracking active GPS coordinates. Click resolve once scene operations finish.
                    </p>
                    <button 
                      className="dispatch-submit-btn" 
                      style={{ backgroundColor: '#bb1919', marginTop: 'auto' }}
                      onClick={() => handleResolveIncident(selectedIncident.id)}
                    >
                      Resolve Incident File
                    </button>
                  </div>
                ) : (
                  <form className="dispatch-form" onSubmit={handleDispatchSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Target: {selectedIncident.type} Report</span>
                      <strong style={{ fontSize: '13px' }}>{selectedIncident.description.slice(0, 45)}...</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#94a3b8' }}>Select Available Unit</label>
                      <select 
                        className="dispatch-dropdown"
                        value={selectedResourceId}
                        onChange={(e) => setSelectedResourceId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Unit --</option>
                        {availableResources.map(res => (
                          <option key={res.id} value={res.id}>
                            {res.name} ({res.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <input 
                          type="text" 
                          placeholder="ETA (e.g. 5m)" 
                          className="dispatch-dropdown"
                          value={etaInput}
                          onChange={(e) => setEtaInput(e.target.value)}
                          style={{ padding: '6px 10px' }}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="dispatch-submit-btn" 
                        disabled={isSubmitting || !selectedResourceId}
                        style={{ flex: 1 }}
                      >
                        {isSubmitting ? 'Dispatching...' : 'Dispatch Unit'}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="dispatch-form" style={{ justifyContent: 'center', alignItems: 'center', color: '#64748b', textAlign: 'center' }}>
                  <Radio size={32} style={{ animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '13px', marginTop: '8px' }}>Select an Incident to Dispatch Resources</span>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
