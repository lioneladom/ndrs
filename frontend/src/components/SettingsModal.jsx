import React, { useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Moon, Sun, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roleLabel = 
    user?.role === 'super_admin' ? 'Super Administrator' :
    user?.role === 'admin' ? 'EOC Officer' : 'Citizen Reporter';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const handleSignOut = () => {
    onClose();
    logout();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: 'var(--ndrs-surface)',
          borderRadius: 24,
          border: '1px solid var(--ndrs-border)',
          boxShadow: 'var(--ndrs-shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--ndrs-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--ndrs-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'var(--ndrs-blue-soft)',
              color: 'var(--ndrs-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-title)', margin: 0, color: 'var(--ndrs-ink)' }}>
                Account Settings
              </h2>
              <span style={{ fontSize: 11, color: 'var(--ndrs-muted)', fontWeight: 600 }}>
                Preferences & Profile
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: '1px solid var(--ndrs-border)',
              backgroundColor: 'var(--ndrs-canvas)',
              color: 'var(--ndrs-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ndrs-ink)';
              e.currentTarget.style.borderColor = 'var(--ndrs-ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ndrs-muted)';
              e.currentTarget.style.borderColor = 'var(--ndrs-border)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Profile Card */}
          <div style={{
            padding: 16,
            borderRadius: 18,
            backgroundColor: 'var(--ndrs-canvas)',
            border: '1px solid var(--ndrs-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: '#174ea6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 18,
              boxShadow: '0 4px 12px rgba(23,78,166,0.3)',
              flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ndrs-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'NDRS User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor: 'var(--ndrs-blue-soft)',
                  color: 'var(--ndrs-blue)',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  <Shield size={11} />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '12px 14px',
            borderRadius: 16,
            backgroundColor: 'var(--ndrs-canvas)',
            border: '1px solid var(--ndrs-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ndrs-muted)', fontWeight: 600 }}>
                <Mail size={15} />
                Email
              </span>
              <span style={{ fontWeight: 700, color: 'var(--ndrs-ink)' }}>
                {user?.email || 'N/A'}
              </span>
            </div>

            {user?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderTop: '1px solid var(--ndrs-border)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ndrs-muted)', fontWeight: 600 }}>
                  <Phone size={15} />
                  Phone
                </span>
                <span style={{ fontWeight: 700, color: 'var(--ndrs-ink)' }}>
                  {user.phone}
                </span>
              </div>
            )}
          </div>

          {/* Appearance / Theme Toggle */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ndrs-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Display Theme
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 16,
              backgroundColor: 'var(--ndrs-canvas)',
              border: '1px solid var(--ndrs-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: darkMode ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.15)',
                  color: darkMode ? '#fbbf24' : '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ndrs-ink)' }}>
                    {darkMode ? 'Dark Theme' : 'Light Theme'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ndrs-muted)' }}>
                    {darkMode ? 'High contrast slate mode' : 'Clean daytime brightness'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--ndrs-border)',
                  backgroundColor: 'var(--ndrs-surface)',
                  color: 'var(--ndrs-ink)',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ndrs-border)';
                }}
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                <span>Switch to {darkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <div style={{ paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '13px 18px',
                borderRadius: 14,
                backgroundColor: 'var(--ndrs-red-soft)',
                color: 'var(--ndrs-red)',
                border: '1px solid rgba(220,38,38,0.2)',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ndrs-red)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ndrs-red-soft)';
                e.currentTarget.style.color = 'var(--ndrs-red)';
              }}
            >
              <LogOut size={17} />
              <span>Sign Out of NDRS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
