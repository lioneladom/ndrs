import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HandHelping,
  Flame,
  Droplets,
  HeartPulse,
  Car,
  Shield,
  Bell,
  ArrowRight,
  MapPin,
  PhoneCall,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const quickReports = [
    { type: 'Fire Outbreak', icon: Flame, color: '#dc2626', bg: darkMode ? 'rgba(239,68,68,0.15)' : '#fee2e2', desc: 'Structure & bush fires' },
    { type: 'Flood Crisis', icon: Droplets, color: '#2563eb', bg: darkMode ? 'rgba(37,99,235,0.15)' : '#dbeafe', desc: 'Rising waters & overflow' },
    { type: 'Medical Help', icon: HeartPulse, color: '#0f9d58', bg: darkMode ? 'rgba(15,157,88,0.15)' : '#d1fae5', desc: 'Paramedics & trauma' },
    { type: 'Road Accident', icon: Car, color: '#d97706', bg: darkMode ? 'rgba(217,119,6,0.15)' : '#fef3c7', desc: 'Highway & traffic collisions' },
  ];

  const features = [
    {
      icon: Bell,
      title: 'Instant Alerts',
      desc: 'Receive real-time push notifications and emergency advisories from national and regional response units.',
      tag: 'Real-Time'
    },
    {
      icon: MapPin,
      title: 'Live Location GPS',
      desc: 'Report incidents with accurate GPS coordinates for rapid first-responder dispatch directly to your location.',
      tag: 'Precision'
    },
    {
      icon: Shield,
      title: 'Verified Response',
      desc: 'Direct integration with Ghana Fire Service, National Ambulance Service, and Ghana Police Service.',
      tag: 'Official'
    },
    {
      icon: Radio,
      title: 'Preparedness Guides',
      desc: 'Access emergency action protocols, evacuation safety procedures, and disaster checklists anytime.',
      tag: 'Safety'
    },
  ];

  const emergencyContacts = [
    { label: 'National Emergency', number: '112', bg: '#dc2626' },
    { label: 'Fire Service', number: '192', bg: '#d97706' },
    { label: 'Ambulance', number: '193', bg: '#0f9d58' },
    { label: 'Police Service', number: '191', bg: '#2563eb' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ndrs-canvas)', color: 'var(--ndrs-ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Ghana Flag Colors Accent Stripe */}
      <div style={{ height: 6, width: '100%', display: 'flex', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ flex: 1, backgroundColor: '#ce1126' }} />
        <div style={{ flex: 1, backgroundColor: '#fcd116' }} />
        <div style={{ flex: 1, backgroundColor: '#006b3f' }} />
      </div>

      {/* Header */}
      <header style={{
        backgroundColor: 'var(--ndrs-surface-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ndrs-border)',
        position: 'sticky',
        top: 6,
        zIndex: 40,
        transition: 'background-color 0.25s ease, border-color 0.25s ease'
      }}>
        <div className="ndrs-shell landing-header" style={{ paddingTop: 12, paddingBottom: 12 }}>
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', minWidth: 0 }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#174ea6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(23,78,166,0.35)',
              flexShrink: 0
            }}>
              <HandHelping size={20} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.15, fontFamily: 'var(--font-title)', letterSpacing: '-0.3px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                NDRS Ghana
              </div>
              <div style={{ fontSize: 10, color: 'var(--ndrs-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                Disaster Response
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--ndrs-ink)',
                border: '1px solid var(--ndrs-border)',
                background: 'var(--ndrs-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ndrs-border)';
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{
                padding: '7px 15px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                color: 'white',
                backgroundColor: 'var(--ndrs-blue)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px var(--ndrs-glow-blue)',
                height: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="ndrs-shell" style={{ paddingTop: 'clamp(28px, 5vw, 56px)', paddingBottom: 'clamp(36px, 5vw, 64px)' }}>
          <div className="landing-hero-grid">
            {/* Left: Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* Status Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 999,
                backgroundColor: 'var(--ndrs-blue-soft)',
                color: 'var(--ndrs-blue)',
                fontWeight: 700,
                fontSize: 12,
                marginBottom: 16,
                border: '1px solid var(--ndrs-border)'
              }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#10b981', animation: 'pulse 2s infinite' }} />
                <span>Republic of Ghana • Operations Active</span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(2rem, 5.5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: 16,
                fontFamily: 'var(--font-title)',
                letterSpacing: '-0.02em',
                color: 'var(--ndrs-ink)'
              }}>
                Keeping Ghana{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #174ea6 0%, #3b82f6 50%, #0f9d58 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Safe and Prepared
                </span>
              </h1>

              {/* Description */}
              <p style={{
                fontSize: 'clamp(14px, 1.8vw, 17px)',
                color: 'var(--ndrs-muted)',
                lineHeight: 1.6,
                marginBottom: 24,
                maxWidth: 520
              }}>
                Report emergencies in seconds, coordinate first-responders with GPS tracking, and receive verified disaster alerts across all 16 regions of Ghana.
              </p>

              {/* Action Buttons */}
              <div className="landing-actions" style={{ width: '100%', marginBottom: 28 }}>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  style={{
                    padding: '14px 24px',
                    borderRadius: 14,
                    fontWeight: 800,
                    fontSize: 15,
                    color: 'white',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 6px 20px rgba(220,38,38,0.28)',
                    flex: '1 1 auto',
                    minHeight: 48,
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  <span>Report an Incident</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '14px 20px',
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 15,
                    color: 'var(--ndrs-ink)',
                    backgroundColor: 'var(--ndrs-surface)',
                    border: '1px solid var(--ndrs-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    flex: '1 1 auto',
                    minHeight: 48,
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
                    e.currentTarget.style.backgroundColor = 'var(--ndrs-surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ndrs-border)';
                    e.currentTarget.style.backgroundColor = 'var(--ndrs-surface)';
                  }}
                >
                  <Shield size={17} style={{ color: 'var(--ndrs-blue)' }} />
                  <span>Authority Portal</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', color: 'var(--ndrs-muted)', fontSize: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                  Official Response
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                  24/7 EOC Dispatch
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                  All 16 Regions
                </span>
              </div>
            </div>

            {/* Right: Quick Access Cards */}
            <div>
              <div style={{
                backgroundColor: 'var(--ndrs-surface)',
                borderRadius: 22,
                padding: 'clamp(16px, 3.5vw, 22px)',
                border: '1px solid var(--ndrs-border)',
                boxShadow: 'var(--ndrs-shadow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-title)', color: 'var(--ndrs-ink)' }}>
                    Emergency Quick Access
                  </h3>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ndrs-blue)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Instant Dispatch
                  </span>
                </div>

                <div className="landing-quick-grid">
                  {quickReports.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate('/signup')}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 16,
                        backgroundColor: 'var(--ndrs-canvas)',
                        border: '1px solid var(--ndrs-border)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = item.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--ndrs-border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: item.bg,
                        color: item.color
                      }}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ndrs-ink)', marginBottom: 2 }}>
                          {item.type}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ndrs-muted)', lineHeight: 1.3 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ndrs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--ndrs-muted)' }}>
                    Immediate danger?
                  </span>
                  <a
                    href="tel:112"
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#dc2626',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none'
                    }}
                  >
                    <PhoneCall size={13} />
                    Call 112
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Helplines Bar */}
        <section style={{ backgroundColor: 'var(--ndrs-surface)', borderTop: '1px solid var(--ndrs-border)', borderBottom: '1px solid var(--ndrs-border)', padding: '18px 0' }}>
          <div className="ndrs-shell">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PhoneCall size={18} style={{ color: 'var(--ndrs-blue)' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>Ghana National Emergency Helplines</div>
                  <div style={{ fontSize: 11, color: 'var(--ndrs-muted)' }}>Toll-free 24/7 direct lines from any network</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {emergencyContacts.map((contact, idx) => (
                  <a
                    key={idx}
                    href={`tel:${contact.number}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      borderRadius: 10,
                      backgroundColor: 'var(--ndrs-canvas)',
                      border: '1px solid var(--ndrs-border)',
                      textDecoration: 'none',
                      color: 'var(--ndrs-ink)',
                      fontSize: 12,
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: contact.bg }} />
                    <span>{contact.label}:</span>
                    <span style={{ color: contact.bg, fontWeight: 900 }}>{contact.number}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section style={{ paddingTop: 'clamp(40px, 5vw, 64px)', paddingBottom: 'clamp(40px, 5vw, 64px)' }}>
          <div className="ndrs-shell">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 40px)' }}>
              <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ndrs-blue)', marginBottom: 6 }}>
                Built For Ghana
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', fontWeight: 900, fontFamily: 'var(--font-title)', marginBottom: 10 }}>
                Why Choose the NDRS Platform?
              </h2>
              <p style={{ color: 'var(--ndrs-muted)', maxWidth: 580, margin: '0 auto', fontSize: 'clamp(13px, 1.8vw, 15px)' }}>
                A unified emergency reporting and coordination network connecting citizens directly with response services.
              </p>
            </div>

            <div className="landing-feature-grid">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'clamp(18px, 2.5vw, 24px)',
                    borderRadius: 18,
                    backgroundColor: 'var(--ndrs-surface)',
                    border: '1px solid var(--ndrs-border)',
                    boxShadow: 'var(--ndrs-shadow-sm)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--ndrs-border)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: 'var(--ndrs-blue-soft)',
                        color: 'var(--ndrs-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <feature.icon size={22} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 6, backgroundColor: 'var(--ndrs-canvas)', color: 'var(--ndrs-muted)', textTransform: 'uppercase' }}>
                        {feature.tag}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--ndrs-ink)', marginBottom: 6 }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: 'var(--ndrs-muted)', fontSize: 13, lineHeight: 1.55 }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="ndrs-shell" style={{ paddingBottom: 'clamp(40px, 5vw, 64px)' }}>
          <div style={{
            background: darkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #174ea6 0%, #1e3a8a 100%)',
            borderRadius: 24,
            padding: 'clamp(24px, 4vw, 44px)',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--ndrs-shadow-lg)',
            border: darkMode ? '1px solid #334155' : 'none'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)',
              fontWeight: 900,
              marginBottom: 12,
              fontFamily: 'var(--font-title)',
              letterSpacing: '-0.01em'
            }}>
              Join Thousands of Citizens Keeping Ghana Safe
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 540,
              margin: '0 auto 24px auto',
              lineHeight: 1.55
            }}>
              Create your citizen account today for instant disaster reporting, active safety alerts, and coordinated emergency assistance.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{
                  padding: '14px 28px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                  maxWidth: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Create Free Citizen Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--ndrs-surface)',
        borderTop: '1px solid var(--ndrs-border)',
        paddingTop: 28,
        paddingBottom: 28,
        transition: 'background-color 0.25s ease, border-color 0.25s ease'
      }}>
        <div className="ndrs-shell">
          <div className="landing-footer-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: '#174ea6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <HandHelping size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15, fontFamily: 'var(--font-title)' }}>
                  NDRS Ghana
                </div>
                <div style={{ fontSize: 10, color: 'var(--ndrs-muted)' }}>
                  National Disaster Response System
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: 'var(--ndrs-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Officer Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{ background: 'none', border: 'none', color: 'var(--ndrs-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Citizen Registration
              </button>
            </div>

            <div style={{ fontSize: 11, color: 'var(--ndrs-muted)', textAlign: 'center' }}>
              © 2026 Republic of Ghana. Ministry of the Interior.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
