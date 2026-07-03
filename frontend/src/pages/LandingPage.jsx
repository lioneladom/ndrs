import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HandHelping, Flame, Droplets, HeartPulse, Car, Shield, Users, Bell, CheckCircle, ArrowRight, MapPin } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Bell, title: 'Instant Alerts', desc: 'Receive real-time emergency notifications from local authorities.' },
    { icon: MapPin, title: 'Live Location', desc: 'Report incidents with automatic location tagging for rapid response.' },
    { icon: Shield, title: 'Verified Response', desc: 'Connect directly with NADMO, fire, police, and ambulance services.' },
    { icon: HeartPulse, title: 'Safety Resources', desc: 'Access preparedness guides and emergency checklists.' },
  ];

  const quickReports = [
    { type: 'Fire', icon: Flame, color: '#d92b2b' },
    { type: 'Flood', icon: Droplets, color: '#174ea6' },
    { type: 'Medical', icon: HeartPulse, color: '#0f9d58' },
    { type: 'Accident', icon: Car, color: '#f4b400' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Ghana Stripe */}
      <div style={{ height: 8, width: '100%', display: 'flex' }}>
        <div style={{ flex: 1, backgroundColor: '#d92b2b' }} />
        <div style={{ flex: 1, backgroundColor: '#f4b400' }} />
        <div style={{ flex: 1, backgroundColor: '#0f9d58' }} />
      </div>

      {/* Header */}
      <header className="landing-header ndrs-shell" style={{ paddingTop: 24, paddingBottom: 24, alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#174ea6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <HandHelping size={22} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 24, color: '#0f172a', fontFamily: 'var(--font-title)' }}>NDRS Ghana</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '10px 20px', borderRadius: 12, fontWeight: 600, color: '#174ea6', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(23,78,166,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{ padding: '10px 20px', borderRadius: 12, fontWeight: 700, color: 'white', backgroundColor: '#174ea6', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e40af';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(23,78,166,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#174ea6';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="ndrs-shell" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="landing-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 1fr)', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, backgroundColor: 'rgba(23,78,166,0.1)', color: '#174ea6', fontWeight: 700, fontSize: 14, marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#34a853', animation: 'pulse 2s infinite' }} />
              National Disaster Response System
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 3.5rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginBottom: 24, fontFamily: 'var(--font-title)' }}>
              Keeping Ghana
              <br />
              <span style={{ color: '#174ea6' }}>Safe and Prepared</span>
            </h1>
            <p style={{ fontSize: 18, color: '#64748b', marginBottom: 32, maxWidth: 512 }}>
              Report emergencies instantly, track response teams in real-time, and stay informed with critical safety alerts for all 16 regions of Ghana.
            </p>
            <div className="landing-actions" style={{ flexDirection: 'row', gap: 16 }}>
              <button
                onClick={() => navigate('/signup')}
                style={{ padding: '16px 32px', borderRadius: 16, fontWeight: 700, color: 'white', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(220,38,38,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Get Started Now
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{ padding: '16px 32px', borderRadius: 16, fontWeight: 700, color: '#0f172a', backgroundColor: 'white', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#174ea6';
                  e.currentTarget.style.color = '#174ea6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }}
              >
                For Authorities
              </button>
            </div>
          </div>

          {/* Quick Report Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 16 }}>
            {quickReports.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: 24, borderRadius: 24, backgroundColor: 'white', border: '1px solid #e2e8f0', boxShadow: 'var(--ndrs-shadow-sm)', transition: 'all 0.2s ease', cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--ndrs-shadow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--ndrs-shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: `${item.color}15`, color: item.color
                  }}
                >
                  <item.icon size={28} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>{item.type}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ backgroundColor: 'white', paddingTop: 64, paddingBottom: 96, borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="ndrs-shell">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 16, fontFamily: 'var(--font-title)' }}>Why NDRS?</h2>
            <p style={{ color: '#64748b', maxWidth: 672, margin: '0 auto' }}>
              A unified platform built for the safety of all Ghanaians
            </p>
          </div>

          <div className="landing-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 24 }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ padding: 32, borderRadius: 24, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = 'rgba(23,78,166,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(23,78,166,0.1)', color: '#174ea6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
                }}>
                  <feature.icon size={24} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 20, color: '#0f172a', marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ color: '#64748b' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="ndrs-shell" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: 24,
          padding: 'clamp(28px, 6vw, 48px)',
          textAlign: 'center',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.25rem)', fontWeight: 900, color: 'white', marginBottom: 16, fontFamily: 'var(--font-title)' }}>
            Join thousands of Ghanaians making communities safer
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32, maxWidth: 672, margin: '0 auto 32px auto' }}>
            Sign up today and be part of Ghana's national emergency response network.
          </p>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '16px 40px',
              borderRadius: 16,
              fontWeight: 700,
              color: 'white',
              backgroundColor: '#dc2626',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(220,38,38,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: 'white', paddingTop: 48, paddingBottom: 48 }}>
        <div className="ndrs-shell">
          <div className="landing-footer-row" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#174ea6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HandHelping size={20} />
              </div>
              <span style={{ fontWeight: 900, fontSize: 20, fontFamily: 'var(--font-title)' }}>NDRS Ghana</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              © 2026 National Disaster Response System. Republic of Ghana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
