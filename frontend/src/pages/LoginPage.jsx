import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandHelping, Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ndrs-canvas)', color: 'var(--ndrs-ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Ghana Stripe */}
      <div style={{ height: 6, width: '100%', display: 'flex' }}>
        <div style={{ flex: 1, backgroundColor: '#ce1126' }} />
        <div style={{ flex: 1, backgroundColor: '#fcd116' }} />
        <div style={{ flex: 1, backgroundColor: '#006b3f' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 440, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--ndrs-muted)',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>

          <ThemeToggle />
        </div>

        <div style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--ndrs-surface)',
          borderRadius: 24,
          padding: 'clamp(24px, 5vw, 36px)',
          boxShadow: 'var(--ndrs-shadow)',
          border: '1px solid var(--ndrs-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: '#174ea6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(23,78,166,0.3)'
            }}>
              <HandHelping size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-title)', lineHeight: 1.1 }}>NDRS Ghana</h1>
              <span style={{ fontSize: 11, color: 'var(--ndrs-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Authentication</span>
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-title)', marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--ndrs-muted)', fontSize: 14, marginBottom: 24 }}>Sign in to access emergency reports and operations.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--ndrs-ink)' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ndrs-muted)' }} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    borderRadius: 14,
                    border: '1px solid var(--ndrs-border)',
                    backgroundColor: 'var(--ndrs-canvas)',
                    color: 'var(--ndrs-ink)',
                    outline: 'none',
                    fontSize: 15,
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--ndrs-ink)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ndrs-muted)' }} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    borderRadius: 14,
                    border: '1px solid var(--ndrs-border)',
                    backgroundColor: 'var(--ndrs-canvas)',
                    color: 'var(--ndrs-ink)',
                    outline: 'none',
                    fontSize: 15,
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, backgroundColor: 'var(--ndrs-red-soft)', color: 'var(--ndrs-red)', fontSize: 13, fontWeight: 700 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 15,
                color: 'white',
                backgroundColor: 'var(--ndrs-blue)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px var(--ndrs-glow-blue)'
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--ndrs-muted)', fontSize: 14 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ fontWeight: 800, color: 'var(--ndrs-blue)', textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
