import React from 'react';
import { Megaphone, Flame, CloudRain, Briefcase, Car, AlertCircle, AlertTriangle, Clock, MapPin, Info } from 'lucide-react';

export default function HomeView({ onNavigate, onQuickReport }) {
  const quickReports = [
    { type: 'FIRE', icon: Flame, label: 'Fire', color: 'var(--ndrs-red)', bgColor: 'var(--ndrs-red-soft)' },
    { type: 'FLOOD', icon: CloudRain, label: 'Flood', color: 'var(--ndrs-blue)', bgColor: 'var(--ndrs-blue-soft)' },
    { type: 'MEDICAL', icon: Briefcase, label: 'Medical', color: 'var(--ndrs-green)', bgColor: 'rgba(16, 185, 129, 0.15)' },
    { type: 'ACCIDENT', icon: Car, label: 'Accident', color: 'var(--ndrs-gold)', bgColor: 'var(--ndrs-gold-soft)' },
  ];

  const alerts = [
    {
      id: 1,
      type: 'critical',
      icon: AlertCircle,
      label: 'Critical Alert',
      title: 'Heavy rain warning in Accra',
      desc: 'Significant flooding expected in low-lying areas of Accra. Seek higher ground immediately.',
      time: '10 mins ago',
      location: 'Accra Central',
    },
    {
      id: 2,
      type: 'warning',
      icon: AlertTriangle,
      label: 'Warning',
      title: 'Public Health Notice',
      desc: 'Update on sanitation protocols for Greater Accra region. Avoid contaminated water sources.',
      time: '2 hours ago',
      location: 'Accra Metro',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Report button */}
          <button
            onClick={() => onNavigate('reports')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--ndrs-red), var(--ndrs-red-700))',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              fontSize: '18px',
              fontWeight: '800',
              fontFamily: 'var(--font-title)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(184, 13, 26, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 14px 36px rgba(184, 13, 26, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(184, 13, 26, 0.25)';
            }}
          >
            <Megaphone size={28} />
            Report an Emergency
          </button>

          {/* Quick report grid */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(16, 24, 40, 0.10)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--ndrs-shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <h3 style={{
                fontFamily: 'var(--font-title)',
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--ndrs-ink)',
                margin: 0
              }}>
                Quick Report
              </h3>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                border: '1px solid rgba(107, 58, 58, 0.22)',
                cursor: 'help',
                color: '#6b3a3a',
                fontSize: '12px'
              }}>
                <Info size={13} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
              {quickReports.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => onQuickReport(item.type)}
                    style={{
                      background: item.bgColor,
                      border: `1px solid ${item.color}22`,
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      color: item.color,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--ndrs-shadow-sm)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--ndrs-shadow-sm)'
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weather widget */}
          <div style={{
            background: 'linear-gradient(135deg, var(--ndrs-blue), var(--ndrs-teal))',
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            boxShadow: 'var(--ndrs-shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img 
              src="/accra_skyline.png" 
              alt="Accra skyline" 
              style={{
                position: 'absolute',
                right: '-20px',
                bottom: 0,
                opacity: 0.25,
                height: '140px',
                objectFit: 'contain'
              }} 
            />
            <div style={{ position: 'relative' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                opacity: 0.9,
                letterSpacing: '0.5px'
              }}>
                Current Weather
              </span>
              <h2 style={{
                fontFamily: 'var(--font-title)',
                fontSize: '32px',
                fontWeight: '900',
                margin: '4px 0 0',
                letterSpacing: '-0.5px'
              }}>
                Accra, 28°C
              </h2>
            </div>
          </div>
        </div>

        {/* Right column - Active alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{
              fontFamily: 'var(--font-title)',
              fontSize: '18px',
              fontWeight: '800',
              color: 'var(--ndrs-ink)',
              margin: 0
            }}>
              Active Alerts in Your Area
            </h3>
            <button
              onClick={() => onNavigate('alerts')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ndrs-red)',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              View All →
            </button>
          </div>

          {alerts.map((alert) => {
            const Icon = alert.icon;
            const borderColor = alert.type === 'critical' ? 'var(--ndrs-red)' : 'var(--ndrs-gold)';
            const bgColor = alert.type === 'critical' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.04)';
            const labelColor = alert.type === 'critical' ? 'var(--ndrs-red)' : 'var(--ndrs-gold)';
            
            return (
              <div 
                key={alert.id}
                style={{
                  background: bgColor,
                  border: `1px solid rgba(16, 24, 40, 0.10)`,
                  borderLeft: `4px solid ${borderColor}`,
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} color={borderColor} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: labelColor
                    }}>
                      {alert.label}
                    </span>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: alert.type === 'critical' ? 'var(--ndrs-red-soft)' : 'var(--ndrs-gold-soft)',
                    color: alert.type === 'critical' ? 'var(--ndrs-red)' : '#854d0e',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {alert.type === 'critical' ? 'High Risk' : 'Advisory'}
                  </div>
                </div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: 'var(--ndrs-ink)',
                  margin: 0
                }}>
                  {alert.title}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--ndrs-muted)',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {alert.desc}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ndrs-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {alert.time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {alert.location}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
