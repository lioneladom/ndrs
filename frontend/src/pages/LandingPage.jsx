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
  CheckCircle2,
  ShieldAlert,
  Wind
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

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
      desc: 'Receive real-time push notifications & emergency advisories from NADMO and regional response units.',
      tag: 'Real-Time'
    },
    {
      icon: MapPin,
      title: 'Live Location GPS',
      desc: 'Report incidents with accurate GPS tagging for rapid first-responder dispatch to your exact position.',
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
      desc: 'Access emergency action protocols, evacuation routes, and safety checklists even in offline modes.',
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
      {/* Ghana National Colors Stripe */}
      <div style={{ height: 6, width: '100%', display: 'flex', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ flex: 1, backgroundColor: '#ce1126' }} />
        <div style={{ flex: 1, backgroundColor: '#fcd116' }} />
        <div style={{ flex: 1, backgroundColor: '#006b3f' }} />
      </div>

      {/* Modern Header */}
      <header style={{
        backgroundColor: 'var(--ndrs-surface-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ndrs-border)',
        position: 'sticky',
        top: 6,
        zIndex: 40,
        transition: 'all 0.25s ease'
      }}>
        <div className="ndrs-shell landing-header" style={{ paddingTop: 14, paddingBottom: 14 }}>
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: '#174ea6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(23,78,166,0.35)',
              flexShrink: 0
            }}>
              <HandHelping size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, lineHeight: 1.1, fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>
                NDRS Ghana
              </div>
              <div style={{ fontSize: 11, color: 'var(--ndrs-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Emergency System
              </div>
            </div>
          </div>

          {/* Actions & Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />

            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--ndrs-ink)',
                border: '1px solid var(--ndrs-border)',
                background: 'var(--ndrs-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: 40,
                display: 'inline-flex',
                alignItems: 'center'
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
                padding: '8px 18px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                color: 'white',
                backgroundColor: 'var(--ndrs-blue)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px var(--ndrs-glow-blue)',
                height: 40,
                display: 'inline-flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px var(--ndrs-glow-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px var(--ndrs-glow-blue)';
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
        <section className="ndrs-shell" style={{ paddingTop: 'clamp(32px, 6vw, 64px)', paddingBottom: 'clamp(40px, 6vw, 72px)' }}>
          <div className="landing-hero-grid">
            {/* Left Column: Hero Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* Live Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                backgroundColor: 'var(--ndrs-blue-soft)',
                color: 'var(--ndrs-blue)',
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 20,
                border: '1px solid var(--ndrs-border)'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#10b981', animation: 'pulse 2s infinite' }} />
                <span>Republic of Ghana • National EOC Live</span>
              </div>

              {/* Main Headline */}
              <h1 style={{
                fontSize: 'clamp(2.1rem, 6vw, 3.75rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                marginBottom: 20,
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

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(15px, 2vw, 18px)',
                color: 'var(--ndrs-muted)',
                lineHeight: 1.6,
                marginBottom: 28,
                maxWidth: 540
              }}>
                Report emergencies in seconds, coordinate first-responders with GPS tracking, and receive verified disaster alerts across all 16 regions of Ghana.
              </p>

              {/* Call to Actions */}
              <div className="landing-actions" style={{ width: '100%', marginBottom: 32 }}>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  style={{
                    padding: '16px 28px',
                    borderRadius: 16,
                    fontWeight: 800,
                    fontSize: 16,
                    color: 'white',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 8px 24px rgba(220,38,38,0.3)',
                    flex: '1 1 auto',
                    maxWidth: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(220,38,38,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.3)';
                  }}
                >
                  <span>Report an Incident</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '16px 24px',
                    borderRadius: 16,
                    fontWeight: 700,
                    fontSize: 16,
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
                    maxWidth: '100%'
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
                  <Shield size={18} style={{ color: 'var(--ndrs-blue)' }} />
                  <span>Authority Portal</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', color: 'var(--ndrs-muted)', fontSize: 13 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  NADMO Certified
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  24/7 Dispatch EOC
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  Free for all Citizens
                </span>
              </div>
            </div>

            {/* Right Column: Quick Incident Type Cards */}
            <div>
              <div style={{
                backgroundColor: 'var(--ndrs-surface)',
                borderRadius: 24,
                padding: 'clamp(16px, 4vw, 24px)',
                border: '1px solid var(--ndrs-border)',
                boxShadow: 'var(--ndrs-shadow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-title)', color: 'var(--ndrs-ink)' }}>
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
                        padding: '18px 16px',
                        borderRadius: 18,
                        backgroundColor: 'var(--ndrs-canvas)',
                        border: '1px solid var(--ndrs-border)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = item.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--ndrs-shadow-sm)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--ndrs-border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: item.bg,
                        color: item.color
                      }}>
                        <item.icon size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ndrs-ink)', marginBottom: 2 }}>
                          {item.type}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ndrs-muted)', lineHeight: 1.3 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--ndrs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--ndrs-muted)' }}>
                    Immediate danger? Call 112 directly
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

        {/* Quick Emergency Helplines Bar */}
        <section style={{ backgroundColor: 'var(--ndrs-surface)', borderTop: '1px solid var(--ndrs-border)', borderBottom: '1px solid var(--ndrs-border)', padding: '24px 0' }}>
          <div className="ndrs-shell">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PhoneCall size={20} style={{ color: 'var(--ndrs-blue)' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Ghana National Emergency Helplines</div>
                  <div style={{ fontSize: 12, color: 'var(--ndrs-muted)' }}>Toll-free 24/7 direct lines from any network</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {emergencyContacts.map((contact, idx) => (
                  <a
                    key={idx}
                    href={`tel:${contact.number}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      borderRadius: 12,
                      backgroundColor: 'var(--ndrs-canvas)',
                      border: '1px solid var(--ndrs-border)',
                      textDecoration: 'none',
                      color: 'var(--ndrs-ink)',
                      fontSize: 13,
                      fontWeight: 700,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = contact.bg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ndrs-border)';
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: contact.bg }} />
                    <span>{contact.label}:</span>
                    <span style={{ color: contact.bg, fontWeight: 900 }}>{contact.number}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why NDRS / Features Section */}
        <section style={{ paddingTop: 'clamp(48px, 6vw, 80px)', paddingBottom: 'clamp(48px, 6vw, 80px)' }}>
          <div className="ndrs-shell">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
              <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ndrs-blue)', marginBottom: 8 }}>
                Built For Ghana
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, fontFamily: 'var(--font-title)', marginBottom: 12 }}>
                Why Choose the NDRS Platform?
              </h2>
              <p style={{ color: 'var(--ndrs-muted)', maxWidth: 600, margin: '0 auto', fontSize: 'clamp(14px, 2vw, 16px)' }}>
                A unified emergency reporting and coordination network connecting citizens directly with response services.
              </p>
            </div>

            <div className="landing-feature-grid">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'clamp(20px, 3vw, 28px)',
                    borderRadius: 20,
                    backgroundColor: 'var(--ndrs-surface)',
                    border: '1px solid var(--ndrs-border)',
                    boxShadow: 'var(--ndrs-shadow-sm)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--ndrs-shadow)';
                    e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--ndrs-shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--ndrs-border)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: 'var(--ndrs-blue-soft)',
                        color: 'var(--ndrs-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <feature.icon size={24} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, backgroundColor: 'var(--ndrs-canvas)', color: 'var(--ndrs-muted)', textTransform: 'uppercase' }}>
                        {feature.tag}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: 18, color: 'var(--ndrs-ink)', marginBottom: 8 }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: 'var(--ndrs-muted)', fontSize: 14, lineHeight: 1.6 }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="ndrs-shell" style={{ paddingBottom: 'clamp(48px, 6vw, 80px)' }}>
          <div style={{
            background: darkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #174ea6 0%, #1e3a8a 100%)',
            borderRadius: 28,
            padding: 'clamp(28px, 5vw, 56px)',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--ndrs-shadow-lg)',
            border: darkMode ? '1px solid #334155' : 'none'
          }}>
            {/* Subtle background blur accent */}
            <div style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 209, 22, 0.15)',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }} />

            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 900,
              marginBottom: 16,
              fontFamily: 'var(--font-title)',
              letterSpacing: '-0.01em'
            }}>
              Join Thousands of Citizens Keeping Ghana Safe
            </h2>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 17px)',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 580,
              margin: '0 auto 32px auto',
              lineHeight: 1.6
            }}>
              Create your citizen account today for instant disaster reporting, active safety alerts, and coordinated emergency assistance.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{
                  padding: '16px 36px',
                  borderRadius: 16,
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#ffffff';
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
        paddingTop: 36,
        paddingBottom: 36,
        transition: 'all 0.25s ease'
      }}>
        <div className="ndrs-shell">
          <div className="landing-footer-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: '#174ea6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <HandHelping size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, fontFamily: 'var(--font-title)' }}>
                  NDRS Ghana
                </div>
                <div style={{ fontSize: 11, color: 'var(--ndrs-muted)' }}>
                  National Disaster Response System
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: 'var(--ndrs-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Officer Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{ background: 'none', border: 'none', color: 'var(--ndrs-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Citizen Registration
              </button>
              <ThemeToggle showLabel />
            </div>

            <div style={{ fontSize: 12, color: 'var(--ndrs-muted)', textAlign: 'center' }}>
              © 2026 Republic of Ghana. Ministry of the Interior & NADMO.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
