import React, { useState } from 'react';
import { Home, ClipboardList, Map as MapIcon, BookOpen, Bell, Menu, Signal, Wifi, Battery, MapPin } from 'lucide-react';
import HomeView from '../views/HomeView.jsx';
import ReportsView from '../views/ReportsView.jsx';
import MapView from '../views/MapView.jsx';
import ResourcesView from '../views/ResourcesView.jsx';
import AlertsView from '../views/AlertsView.jsx';
import { api } from '../utils/api.js';

export default function PhoneSimulator({
  incidents = [],
  resources = [],
  onReportAdded = null
}) {
  const [activeView, setActiveView] = useState('home');
  const [reportInitialType, setReportInitialType] = useState(null);
  const [sosCountdown, setSosCountdown] = useState(null);
  const [sosTimerId, setSosTimerId] = useState(null);
  
  // Track mock battery/time
  const mockTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const navigateTo = (view) => {
    setActiveView(view);
    setReportInitialType(null);
  };

  const triggerQuickReport = (type) => {
    setReportInitialType(type);
    setActiveView('reports');
  };

  const handleSosTrigger = () => {
    setSosCountdown(3);
    
    const interval = setInterval(() => {
      setSosCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          sendSosAlert();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setSosTimerId(interval);
  };

  const cancelSos = () => {
    if (sosTimerId) {
      clearInterval(sosTimerId);
    }
    setSosCountdown(null);
  };

  const sendSosAlert = async () => {
    const lat = 5.5601 + (Math.random() - 0.5) * 0.02;
    const lng = -0.2084 + (Math.random() - 0.5) * 0.02;

    try {
      const sosReport = {
        type: 'MEDICAL',
        description: 'CITIZEN SOS TRIGGER - Active emergency assistance requested immediately.',
        location: { lat, lng },
        severity: 'CRITICAL',
        reportedBy: 'SOS Device Keypress'
      };

      const result = await api.reportIncident(sosReport);
      if (onReportAdded) onReportAdded(result);

      alert('SOS TRANSMITTED — Operations dispatchers have locked onto your GPS and dispatched the closest first-responders to your location.');
    } catch (err) {
      console.error('Failed to trigger backend SOS:', err);
    }
  };

  return (
    <div className={`phone-chassis citizen-view-${activeView}`}>
      {/* Notch */}
      <div className="phone-notch"></div>
      
      <div className="phone-screen">
        {/* Status Bar */}
        <div className="phone-status-bar">
          <span>{mockTime}</span>
          <div className="status-icons">
            <Signal size={13} fill="#0f172a" />
            <Wifi size={13} />
            <Battery size={15} fill="#0f172a" />
          </div>
        </div>

        {/* Dynamic top Ghana stripe */}
        <div className="ghana-stripe">
          <div className="red"></div>
          <div className="gold"></div>
          <div className="green"></div>
        </div>

        {/* App Header (except for map drawer details) */}
        <div className="app-header">
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => alert('NDRS Ghana Citizen Menu Options')}>
            <Menu size={20} color="#083c82" />
          </button>
          
          <div className="app-title-container">
            <MapPin size={18} color="#bb1919" fill="#bb1919" /> NDRS GHANA
          </div>

          <button className="sos-button" onClick={handleSosTrigger}>
            SOS
          </button>
        </div>

        {/* Interactive SOS Overlay screen */}
        {sosCountdown !== null && (
          <div className="sos-overlay">
            <h2 className="sos-title">SENDING SOS</h2>
            <p style={{ opacity: 0.8, fontSize: '14px' }}>Dispatching rescue services to your GPS coordinates...</p>
            <div className="sos-timer">{sosCountdown}</div>
            <button className="sos-cancel-btn" onClick={cancelSos}>
              CANCEL SOS
            </button>
          </div>
        )}

        {/* Active View Router */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {activeView === 'home' && (
            <HomeView 
              onNavigate={navigateTo} 
              onQuickReport={triggerQuickReport} 
            />
          )}
          {activeView === 'reports' && (
            <ReportsView 
              initialType={reportInitialType} 
              onNavigate={navigateTo} 
            />
          )}
          {activeView === 'map' && (
            <MapView 
              incidents={incidents} 
              resources={resources} 
            />
          )}
          {activeView === 'resources' && (
            <ResourcesView />
          )}
          {activeView === 'alerts' && (
            <AlertsView 
              onNavigate={navigateTo} 
            />
          )}
        </div>

        {/* Bottom Nav Bar */}
        <div className="bottom-nav">
          <div 
            className={`nav-item ${activeView === 'home' ? 'active-blue' : ''}`}
            onClick={() => navigateTo('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'reports' ? 'active-cyan' : ''}`}
            onClick={() => navigateTo('reports')}
          >
            <ClipboardList size={18} />
            <span>Reports</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'map' ? 'active-blue' : ''}`}
            onClick={() => navigateTo('map')}
          >
            <MapIcon size={18} />
            <span>Map</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'resources' ? 'active-blue' : ''}`}
            onClick={() => navigateTo('resources')}
          >
            <BookOpen size={18} />
            <span>Resources</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'alerts' ? 'active-blue' : ''}`}
            onClick={() => navigateTo('alerts')}
          >
            <Bell size={18} />
            <span>Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
