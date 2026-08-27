import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCcw, Shield, Trash2, Settings, UserPlus } from 'lucide-react';
import { api } from '../utils/api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import SettingsModal from '../components/SettingsModal.jsx';

const blankForm = { name: '', email: '', phone: '', password: '' };

export default function SuperAdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const { darkMode } = useTheme();

  const isCompact = viewportWidth < 900;
  const isMobile = viewportWidth < 640;

  async function loadAdmins() {
    setAdmins(await api.getAdminUsers());
  }

  useEffect(() => {
    loadAdmins().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function createAdmin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createAdmin(form);
      setForm(blankForm);
      await loadAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(admin) {
    if (admin.role === 'super_admin') return;
    await (admin.status === 'suspended' ? api.activateAdmin(admin.id) : api.suspendAdmin(admin.id));
    await loadAdmins();
  }

  async function deleteAdmin(admin) {
    if (admin.role === 'super_admin') return;
    await api.deleteAdmin(admin.id);
    await loadAdmins();
  }

  return (
    <div style={{ 
      display: 'flex', minHeight: '100vh', flexDirection: isCompact ? 'column' : 'row',
      backgroundColor: 'var(--ndrs-canvas)',
      color: 'var(--ndrs-ink)'
    }}>
      {/* Ghana stripe */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4, zIndex: 1000,
        background: 'linear-gradient(90deg, #006b3f 33.3%, #fcd116 33.3% 66.6%, #ce1126 66.6%)'
      }} />
      
      {/* Sidebar */}
      <aside style={{
        width: isCompact ? '100%' : 260,
        backgroundColor: 'var(--ndrs-surface)',
        borderRight: isCompact ? 'none' : '1px solid var(--ndrs-border)',
        borderBottom: isCompact ? '1px solid var(--ndrs-border)' : 'none',
        paddingTop: isCompact ? 28 : 50, paddingBottom: isCompact ? 16 : 24, paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24,
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ndrs-green)'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 17, color: 'var(--ndrs-ink)' }}>
                Super Admin
              </div>
              <div style={{ fontSize: 11, color: 'var(--ndrs-muted)', fontWeight: 600 }}>
                User Access Center
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            aria-label="Settings"
            title="Settings & Profile"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid var(--ndrs-border)',
              backgroundColor: 'var(--ndrs-canvas)',
              color: 'var(--ndrs-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
              e.currentTarget.style.color = 'var(--ndrs-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--ndrs-border)';
              e.currentTarget.style.color = 'var(--ndrs-ink)';
            }}
          >
            <Settings size={18} />
          </button>
        </div>

        <Link 
          to="/admin"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 12, textDecoration: 'none',
            color: 'var(--ndrs-muted)', fontWeight: 700, marginBottom: 6,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ndrs-canvas)';
            e.currentTarget.style.color = 'var(--ndrs-ink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--ndrs-muted)';
          }}
        >
          <ArrowLeft size={18} /> Back to EOC
        </Link>

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 12,
            backgroundColor: 'var(--ndrs-blue-soft)', color: 'var(--ndrs-blue)',
            fontWeight: 800, border: 'none', cursor: 'default'
          }}
        >
          <Plus size={18} /> Admin Accounts
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, paddingTop: isCompact ? 24 : 50, paddingBottom: 24, paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24, minWidth: 0 }}>
        <div style={{ 
          display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'minmax(280px, 360px) minmax(0, 1fr)',
          gap: 24, alignItems: 'start', maxWidth: 1200, margin: '0 auto'
        }}>
          {/* Create Admin section */}
          <section style={{
            background: 'var(--ndrs-surface)',
            border: '1px solid var(--ndrs-border)',
            borderRadius: 20, padding: isMobile ? 20 : 28, boxShadow: 'var(--ndrs-shadow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: 'var(--ndrs-blue-soft)', color: 'var(--ndrs-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <UserPlus size={16} />
              </div>
              <h1 style={{ 
                fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 20,
                color: 'var(--ndrs-ink)', margin: 0
              }}>
                Create admin
              </h1>
            </div>

            <p style={{ 
              color: 'var(--ndrs-muted)', marginBottom: 20, fontSize: 13 
            }}>
              Add dispatchers and emergency coordinators.
            </p>

            <form onSubmit={createAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--ndrs-ink)' }}>Full Name</label>
                <input
                  placeholder="e.g. Kwame Mensah" value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                    color: 'var(--ndrs-ink)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--ndrs-ink)' }}>Email Address</label>
                <input
                  placeholder="admin@ndrs.gov.gh" type="email" value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                    color: 'var(--ndrs-ink)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--ndrs-ink)' }}>Phone Number</label>
                <input
                  placeholder="+233 24 123 4567" value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                    color: 'var(--ndrs-ink)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--ndrs-ink)' }}>Temporary Password</label>
                <input
                  placeholder="Minimum 8 characters" type="password" value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  minLength={8} required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                    color: 'var(--ndrs-ink)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 12px', borderRadius: 10,
                  backgroundColor: 'var(--ndrs-red-soft)', color: 'var(--ndrs-red)', fontSize: 13, fontWeight: 700
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 12,
                  background: 'var(--ndrs-blue)',
                  color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-title)',
                  boxShadow: '0 4px 14px var(--ndrs-glow-blue)',
                  transition: 'all 0.2s ease',
                  marginTop: 4
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.transform = 'translateY(0)';
                }}
              >
                {loading ? 'Creating...' : 'Create Admin Account'}
              </button>
            </form>
          </section>

          {/* Admin list */}
          <section style={{
            background: 'var(--ndrs-surface)',
            border: '1px solid var(--ndrs-border)',
            borderRadius: 20, padding: isMobile ? 18 : 28, boxShadow: 'var(--ndrs-shadow)',
            overflowX: 'auto'
          }}>
            <h1 style={{ 
              fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 20,
              color: 'var(--ndrs-ink)', marginBottom: 20
            }}>
              Registered Admin Accounts
            </h1>
            <table style={{ 
              width: '100%', borderCollapse: 'collapse', fontSize: 13
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ndrs-border)' }}>
                  <th style={{
                    textAlign: 'left', padding: '12px 14px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Name
                  </th>
                  <th style={{
                    textAlign: 'left', padding: '12px 14px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Email
                  </th>
                  <th style={{
                    textAlign: 'left', padding: '12px 14px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Role
                  </th>
                  <th style={{
                    textAlign: 'left', padding: '12px 14px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Status
                  </th>
                  <th style={{
                    textAlign: 'right', padding: '12px 14px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} style={{ 
                    borderBottom: '1px solid var(--ndrs-border)',
                    transition: 'background-color 0.2s ease'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ndrs-canvas)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                    <td style={{
                      padding: '14px', color: 'var(--ndrs-ink)',
                      fontWeight: 700
                    }}>
                      {admin.name}
                    </td>
                    <td style={{
                      padding: '14px', color: 'var(--ndrs-muted)'
                    }}>
                      {admin.email}
                    </td>
                    <td style={{
                      padding: '14px', color: 'var(--ndrs-muted)'
                    }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 6,
                        backgroundColor: admin.role === 'super_admin' ? 'var(--ndrs-blue-soft)' : 'var(--ndrs-canvas)',
                        color: admin.role === 'super_admin' ? 'var(--ndrs-blue)' : 'var(--ndrs-muted)',
                        fontWeight: 700, fontSize: 11, textTransform: 'uppercase'
                      }}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td style={{
                      padding: '14px'
                    }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: '999px',
                        backgroundColor: admin.status === 'suspended' ? 'var(--ndrs-red-soft)' : 'var(--ndrs-green-soft)',
                        color: admin.status === 'suspended' ? 'var(--ndrs-red)' : 'var(--ndrs-green)',
                        fontWeight: 800, fontSize: 11
                      }}>
                        {admin.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '14px', textAlign: 'right'
                    }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          title="Suspend or activate"
                          onClick={() => toggleStatus(admin)}
                          disabled={admin.role === 'super_admin'}
                          style={{
                            width: 34, height: 34, borderRadius: 8,
                            backgroundColor: 'var(--ndrs-canvas)',
                            border: '1px solid var(--ndrs-border)',
                            color: 'var(--ndrs-muted)', cursor: admin.role === 'super_admin' ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: admin.role === 'super_admin' ? 0.4 : 1
                          }}
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          title="Delete admin"
                          onClick={() => deleteAdmin(admin)}
                          disabled={admin.role === 'super_admin'}
                          style={{
                            width: 34, height: 34, borderRadius: 8,
                            backgroundColor: 'var(--ndrs-red-soft)',
                            border: '1px solid transparent',
                            color: 'var(--ndrs-red)', cursor: admin.role === 'super_admin' ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: admin.role === 'super_admin' ? 0.4 : 1
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
}
