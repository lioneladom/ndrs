import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Map, ChevronDown, Share2, Compass, Heart, ArrowRight } from 'lucide-react';

export default function AlertsView({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showOlder, setShowOlder] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'CRITICAL',
      title: 'Severe Flooding - Greater Accra Region',
      desc: 'Flash flooding reported in low-lying areas of Accra. Avoid Circle, Kaneshie, and Alajo. Emergency services are on high alert.',
      time: '2 mins ago',
      actionLabel: 'See Safety Tips',
      action: () => alert('SAFETY TIPS: Move to upper floors immediately. Turn off utility power switches. Avoid walking or driving in flood waters.')
    },
    {
      id: 2,
      type: 'WARNING',
      title: 'High Winds Expected - Central Coast',
      desc: 'Strong gusts up to 50km/h expected tonight. Secure outdoor items and avoid coastal fishing activities.',
      time: '45 mins ago',
      actionLabel: 'See Safety Tips',
      action: () => alert('WIND SAFETY: Secure loose garden/balcony furniture. Stay indoors away from windows and large trees.')
    },
    {
      id: 3,
      type: 'INFO',
      title: 'Power Grid Maintenance - Kumasi',
      desc: 'Scheduled maintenance on the national grid might cause intermittent power outages in the Adum district today from 2 PM to 5 PM.',
      time: '2 hours ago',
      actionLabel: 'View Schedule',
      action: () => alert('MAINTENANCE SCHEDULE: Power shutdown from 2:00 PM to 5:00 PM GMT for substation reinforcement in Adum.')
    },
    {
      id: 4,
      type: 'CRITICAL',
      title: 'Medical Supply Shortage - Volta Region',
      desc: 'Blood Type O- urgently needed at Ho Teaching Hospital. Citizens are encouraged to visit the nearest blood donation drive.',
      time: '5 hours ago',
      actionLabel: 'Find Donation Center',
      action: () => alert('DONATION DRIVE: Ho General Hospital blood collection point is open 8 AM - 6 PM daily.')
    }
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return notif.type === 'CRITICAL';
    if (activeFilter === 'WARNING') return notif.type === 'WARNING';
    return false;
  });

  return (
    <div className="page-content">
      {/* Active Alerts Banner Card */}
      <div className="white-card" style={{
        backgroundColor: '#fee2e2',
        borderColor: '#fca5a5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#7f1d1d' }}>Active Alerts</span>
          <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#b91c1c', marginTop: '2px' }}>
            3 CRITICAL
          </h4>
          <span style={{ fontSize: '11px', color: '#991b1b', opacity: 0.8 }}>Accra Metro Area</span>
        </div>
        
        <AlertCircle size={28} color="#b91c1c" />
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        <button 
          className={`filter-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          All Notifications
        </button>
        <button 
          className={`filter-pill ${activeFilter === 'CRITICAL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('CRITICAL')}
        >
          Critical
        </button>
        <button 
          className={`filter-pill ${activeFilter === 'WARNING' ? 'active' : ''}`}
          onClick={() => setActiveFilter('WARNING')}
        >
          Warnings
        </button>
      </div>

      {/* Notifications Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredNotifications.map((notif, idx) => {
          const typeClass = notif.type.toLowerCase();
          const IconComponent = notif.type === 'CRITICAL' ? AlertCircle : notif.type === 'WARNING' ? AlertTriangle : Info;
          const iconColor = notif.type === 'CRITICAL' ? '#bb1919' : notif.type === 'WARNING' ? '#d97706' : '#083c82';

          return (
            <React.Fragment key={notif.id}>
              {/* Injecting visual cards to match the design file flow */}
              {idx === 2 && (
                <div 
                  className="white-card" 
                  onClick={() => onNavigate('map')}
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("/accra_skyline.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: '#fff',
                    height: '110px',
                    justifyContent: 'flex-end',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Map size={18} />
                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Incident Map</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-title)', marginTop: '2px' }}>
                    Monitor active threats in real-time
                  </h4>
                </div>
              )}

              {idx === 3 && (
                <div 
                  className="white-card" 
                  style={{ borderLeft: '4px solid #083c82', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                  onClick={() => alert('Opening emergency readiness quiz...')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#083c82' }}>
                    <Compass size={16} />
                    <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Preparedness</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    Is your family prepared? Take our 5-minute disaster readiness quiz.
                  </h4>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#083c82', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Start Quiz <ArrowRight size={14} />
                  </span>
                </div>
              )}

              <div className={`white-card alert-card ${typeClass}`}>
                <div className="alert-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconComponent size={16} color={iconColor} />
                    <span className="alert-type-label">{notif.type} ALERT</span>
                  </div>
                  <span className="alert-time">{notif.time}</span>
                </div>
                
                <h4 className="alert-title">{notif.title}</h4>
                <p className="alert-desc">{notif.desc}</p>
                
                <div className="alert-footer">
                  <button className="alert-action-btn" onClick={notif.action}>
                    {notif.actionLabel}
                  </button>
                  <div className="share-btn" onClick={() => alert('Sharing emergency alert broadcast details...')}>
                    <Share2 size={14} />
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Load Older Notifications */}
      <button 
        onClick={() => {
          setShowOlder(true);
          alert('No older emergency notifications on file currently.');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          border: 'none',
          background: 'none',
          color: '#475569',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          margin: '10px auto'
        }}
      >
        LOAD OLDER NOTIFICATIONS
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
