import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCcw, Shield, Trash2 } from 'lucide-react';
import { api } from '../utils/api.js';

const blankForm = { name: '', email: '', phone: '', password: '' };

export default function SuperAdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
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
      backgroundColor: 'var(--ndrs-canvas)' 
    }}>
      {/* Ghana stripe */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4, zIndex: 1000,
        background: 'linear-gradient(90deg, #006b3f 33.3%, #fcd116 33.3% 66.6%, #ce1126 66.6%)'
      }} />
      
      {/* Sidebar */}
      <aside style={{
        width: isCompact ? '100%' : 260, backgroundColor: '#fff',
        borderRight: isCompact ? 'none' : '1px solid var(--ndrs-border)',
        borderBottom: isCompact ? '1px solid var(--ndrs-border)' : 'none',
        paddingTop: isCompact ? 28 : 50, paddingBottom: isCompact ? 16 : 24, paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24,
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ndrs-green)'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 18 }}>
              Super Admin
            </div>
          </div>
        </div>

        <Link 
          to="/admin"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 12, textDecoration: 'none',
            color: 'var(--ndrs-muted)', fontWeight: 700, marginBottom: 4,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
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
          <Plus size={18} /> Admin Users
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
            background: '#fff', border: '1px solid var(--ndrs-border)',
            borderRadius: 20, padding: isMobile ? 20 : 32, boxShadow: 'var(--ndrs-shadow-sm)'
          }}>
            <h1 style={{ 
              fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 24,
              marginBottom: 6
            }}>
              Create admin
            </h1>
            <p style={{ 
              color: 'var(--ndrs-muted)', marginBottom: 24, fontSize: 14 
            }}>
              Add dispatchers and emergency coordinators.
            </p>

            <form onSubmit={createAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <input
                placeholder="Full name" value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14,
                  border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                  fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-blue)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <input
                placeholder="Email" type="email" value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14,
                  border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                  fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-blue)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <input
                placeholder="Phone" value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14,
                  border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                  fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-blue)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <input
                placeholder="Temporary password" type="password" value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                minLength={8} required
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14,
                  border: '1px solid var(--ndrs-border)', backgroundColor: 'var(--ndrs-canvas)',
                  fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-blue)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--ndrs-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {error && (
                <div style={{
                  color: 'var(--ndrs-red)', fontSize: 13, fontWeight: 700
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 14,
                  background: loading ? 'rgba(30, 58, 138, 0.7)' : 'linear-gradient(135deg, var(--ndrs-blue), var(--ndrs-blue-700))',
                  color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-title)',
                  boxShadow: loading ? 'none' : '0 10px 22px rgba(30, 58, 138, 0.24)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.transform = 'translateY(0)';
                }}
              >
                {loading ? 'Creating...' : 'Create admin'}
              </button>
            </form>
          </section>

          {/* Admin list */}
          <section style={{
            background: '#fff', border: '1px solid var(--ndrs-border)',
            borderRadius: 20, padding: isMobile ? 20 : 32, boxShadow: 'var(--ndrs-shadow-sm)',
            overflowX: 'auto'
          }}>
            <h1 style={{ 
              fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 24,
              marginBottom: 24
            }}>
              Admin accounts
            </h1>
            <table style={{ 
              width: '100%', borderCollapse: 'collapse', fontSize: 14
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ndrs-border)' }}>
                  <th style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 1,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Name
                  </th>
                  <th style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 1,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Email
                  </th>
                  <th style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 1,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Role
                  </th>
                  <th style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 1,
                    color: 'var(--ndrs-muted)', textTransform: 'uppercase'
                  }}>
                    Status
                  </th>
                  <th style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: 11, fontWeight: 800, letterSpacing: 1,
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
                      padding: '14px 16px', color: 'var(--ndrs-ink)',
                      fontWeight: 600
                    }}>
                      {admin.name}
                    </td>
                    <td style={{
                      padding: '14px 16px', color: 'var(--ndrs-muted)'
                    }}>
                      {admin.email}
                    </td>
                    <td style={{
                      padding: '14px 16px', color: 'var(--ndrs-muted)'
                    }}>
                      {admin.role}
                    </td>
                    <td style={{
                      padding: '14px 16px'
                    }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '999px',
                        backgroundColor: admin.status === 'suspended' ? 'var(--ndrs-red-soft)' : 'var(--ndrs-green-soft)',
                        color: admin.status === 'suspended' ? 'var(--ndrs-red)' : 'var(--ndrs-green)',
                        fontWeight: 800, fontSize: 12
                      }}>
                        {admin.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '14px 16px'
                    }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          title="Suspend or activate"
                          onClick={() => toggleStatus(admin)}
                          disabled={admin.role === 'super_admin'}
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: 'var(--ndrs-canvas)',
                            border: '1px solid var(--ndrs-border)',
                            color: 'var(--ndrs-muted)', cursor: admin.role === 'super_admin' ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <RotateCcw size={15} />
                        </button>
                        <button
                          title="Delete admin"
                          onClick={() => deleteAdmin(admin)}
                          disabled={admin.role === 'super_admin'}
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: 'var(--ndrs-red-soft)',
                            border: '1px solid transparent',
                            color: 'var(--ndrs-red)', cursor: admin.role === 'super_admin' ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={15} />
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
    </div>
  );
}
