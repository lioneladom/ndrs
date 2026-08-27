import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Shield, Users, MapPin, Bell, CheckCircle, XCircle, Clock, Flame, Droplets, HeartPulse, Car, TrendingUp, Moon, Sun, KeyRound, Settings } from 'lucide-react';
import MaplibreMap from '../components/MaplibreMap';
import IncidentAttachments from '../components/IncidentAttachments';
import TimeAgo from '../components/TimeAgo';
import SettingsModal from '../components/SettingsModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, socket } from '../utils/api';

export default function AdminDashboard() {
  const { user, logout, isSuperAdmin } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resolvingId, setResolvingId] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  const isResolved = (incident) => incident?.status?.toLowerCase() === 'resolved';

  const replaceIncident = (incident) => {
    setIncidents((prev) => prev.map((item) => item.id === incident.id ? incident : item));
    setSelectedIncident((current) => current?.id === incident.id ? incident : current);
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [incidentData, resourceData] = await Promise.all([
        api.getIncidents(),
        api.getResources()
      ]);
      if (mounted) {
        setIncidents(incidentData);
        setResources(resourceData);
      }
    }

    load().catch(console.error);
    socket.connect();
    socket.on('init_data', (data) => {
      setIncidents(data.incidents || []);
      setResources(data.resources || []);
    });
    socket.on('new_incident', (incident) => setIncidents((prev) => [incident, ...prev]));
    socket.on('incident_updated', replaceIncident);
    socket.on('incident_resolved', replaceIncident);
    socket.on('incidents_update', setIncidents);
    socket.on('resources_update', setResources);

    return () => {
      mounted = false;
      socket.off('init_data');
      socket.off('new_incident');
      socket.off('incident_updated');
      socket.off('incident_resolved');
      socket.off('incidents_update');
      socket.off('resources_update');
      socket.disconnect();
    };
  }, []);



  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleResolveIncident = async (incidentId) => {
    setResolvingId(incidentId);
    try {
      const incident = await api.resolveIncident(incidentId);
      replaceIncident(incident);
    } catch (err) {
      alert(`Failed to resolve incident: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ type: 'success', message: 'Password changed successfully.' });
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const stats = {
    active: incidents.filter(i => !isResolved(i)).length,
    critical: incidents.filter(i => i.severity === 'CRITICAL').length,
    resolved: incidents.filter(isResolved).length,
    total: incidents.length
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'FIRE': return Flame;
      case 'FLOOD': return Droplets;
      case 'MEDICAL': return HeartPulse;
      case 'ACCIDENT':
      case 'POLICE': return Car;
      default: return Bell;
    }
  };

  const getIncidentColor = (type) => {
    switch (type) {
      case 'FIRE': return { bg: '#fee2e2', color: '#d92b2b' };
      case 'FLOOD': return { bg: '#dbeafe', color: '#174ea6' };
      case 'MEDICAL': return { bg: '#d1fae5', color: '#0f9d58' };
      case 'ACCIDENT':
      case 'POLICE': return { bg: '#fef3c7', color: '#f4b400' };
      default: return { bg: '#e0e7ff', color: '#4f46e5' };
    }
  };

  const surface = darkMode ? '#0f172a' : 'white';
  const pageBg = darkMode ? '#020617' : '#f8fafc';
  const border = darkMode ? '#1e293b' : '#e2e8f0';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const text = darkMode ? '#f8fafc' : '#0f172a';
  const soft = darkMode ? '#1e293b' : '#f1f5f9';
  const cardShadow = darkMode ? '0 10px 30px rgba(0,0,0,0.28)' : 'var(--ndrs-shadow-sm)';
  const isCompact = viewportWidth < 900;
  const isNarrow = viewportWidth < 640;
  const pagePadding = isNarrow ? 16 : 32;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: pageBg, display: 'flex', flexDirection: isCompact ? 'column' : 'row' }}>
      <div style={{ height: 8, width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 40, display: 'flex' }}>
        <div style={{ flex: 1, backgroundColor: '#d92b2b' }} />
        <div style={{ flex: 1, backgroundColor: '#f4b400' }} />
        <div style={{ flex: 1, backgroundColor: '#0f9d58' }} />
      </div>

      <aside style={{
        width: isCompact ? '100%' : 256,
        backgroundColor: surface,
        borderRight: isCompact ? 'none' : `1px solid ${border}`,
        borderBottom: isCompact ? `1px solid ${border}` : 'none',
        display: 'flex',
        flexDirection: isCompact ? 'column' : 'column',
        paddingTop: isCompact ? 24 : 48,
        paddingBottom: isCompact ? 16 : 24,
        paddingLeft: pagePadding,
        paddingRight: pagePadding,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: isCompact ? 20 : 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#174ea6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <Shield size={22} />
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 18, color: text, fontFamily: 'var(--font-title)', margin: 0 }}>NDRS EOC</h1>
              <p style={{ fontSize: 12, color: muted, fontWeight: 600, margin: 0 }}>{user?.name}</p>
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
              border: `1px solid ${border}`,
              backgroundColor: soft,
              color: text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ndrs-blue)';
              e.currentTarget.style.color = 'var(--ndrs-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.color = text;
            }}
          >
            <Settings size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: isCompact ? 'row' : 'column', gap: 8, flex: 1, overflowX: isCompact ? 'auto' : 'visible', paddingBottom: isCompact ? 4 : 0 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              width: isCompact ? 'auto' : '100%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 16,
              fontWeight: 700,
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'dashboard' ? 'rgba(23,78,166,0.1)' : 'transparent',
              color: activeTab === 'dashboard' ? (darkMode ? '#60a5fa' : '#174ea6') : muted,
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!activeTab) {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }
            }}
            onMouseLeave={(e) => {
              if (!activeTab) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }
            }}
          >
            <TrendingUp size={20} />
            Dashboard
          </button>
          {isSuperAdmin && (
            <Link
              to="/admin/users"
              onClick={() => setActiveTab('users')}
              style={{
                width: '100%',
                display: 'flex',
                flexShrink: 0,
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 16,
                fontWeight: 700,
                transition: 'all 0.2s ease',
                backgroundColor: activeTab === 'users' ? 'rgba(23,78,166,0.1)' : 'transparent',
              color: activeTab === 'users' ? (darkMode ? '#60a5fa' : '#174ea6') : muted,
                textDecoration: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!activeTab) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!activeTab) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              <Users size={20} />
              Admin Users
            </Link>
          )}
          <button
            onClick={() => setActiveTab('account')}
            style={{
              width: isCompact ? 'auto' : '100%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 16,
              fontWeight: 700,
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'account' ? 'rgba(23,78,166,0.1)' : 'transparent',
              color: activeTab === 'account' ? (darkMode ? '#60a5fa' : '#174ea6') : muted,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <KeyRound size={20} />
            Account
          </button>
        </div>



        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 16,
            fontWeight: 700,
            color: muted,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: 'auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
            e.currentTarget.style.color = '#d92b2b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, paddingTop: isCompact ? 0 : 48, overflowY: 'auto', minWidth: 0 }}>
        {activeTab === 'dashboard' && (
          <div style={{ maxWidth: 1280, margin: '0 auto', paddingLeft: pagePadding, paddingRight: pagePadding, paddingTop: pagePadding, paddingBottom: pagePadding }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: text, fontFamily: 'var(--font-title)' }}>Emergency Operations Center</h1>
              <p style={{ color: muted, marginTop: 8 }}>Monitor and manage active incidents across regions</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Active Incidents', value: stats.active, icon: Bell, color: '#174ea6', bg: '#dbeafe' },
                { label: 'Critical', value: stats.critical, icon: XCircle, color: '#d92b2b', bg: '#fee2e2' },
                { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: '#0f9d58', bg: '#d1fae5' },
                { label: 'Total Reports', value: stats.total, icon: MapPin, color: '#f4b400', bg: '#fef3c7' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} style={{ padding: 24, borderRadius: 24, backgroundColor: surface, border: `1px solid ${border}`, boxShadow: cardShadow, transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</span>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: stat.bg,
                        color: stat.color
                      }}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <span style={{ fontSize: 30, fontWeight: 900, color: text }}>{stat.value}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: viewportWidth < 1100 ? '1fr' : 'minmax(0, 2fr) minmax(320px, 1fr)', gap: pagePadding }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ height: isNarrow ? 380 : 500, borderRadius: 24, overflow: 'hidden', border: `1px solid ${border}`, boxShadow: cardShadow, backgroundColor: surface }}>
                  <MaplibreMap
                    incidents={incidents}
                    resources={resources}
                    onMarkerClick={(inc) => setSelectedIncident(inc)}
                    darkMode={darkMode}
                  />
                </div>

                {selectedIncident && (
                  <div style={{ marginTop: 24, backgroundColor: surface, borderRadius: 24, padding: 32, border: `1px solid ${border}`, boxShadow: cardShadow }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexDirection: isNarrow ? 'column' : 'row', minWidth: 0 }}>
                        {(() => {
                          const Icon = getIncidentIcon(selectedIncident.type);
                          const colors = getIncidentColor(selectedIncident.type);
                          return (
                            <div style={{
                              width: 64,
                              height: 64,
                              borderRadius: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              backgroundColor: colors.bg,
                              color: colors.color
                            }}>
                              <Icon size={32} />
                            </div>
                          );
                        })()}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: text, fontFamily: 'var(--font-title)' }}>{selectedIncident.type} Incident</h2>
                            <span style={{
                              fontSize: 12,
                              padding: '6px 12px',
                              borderRadius: 999,
                              fontWeight: 700,
                              backgroundColor: selectedIncident.status === 'New'
                                ? '#fee2e2'
                                : isResolved(selectedIncident)
                                  ? '#d1fae5'
                                  : '#dbeafe',
                              color: selectedIncident.status === 'New'
                                ? '#d92b2b'
                                : isResolved(selectedIncident)
                                  ? '#0f9d58'
                                  : '#174ea6'
                            }}>
                              {selectedIncident.status}
                            </span>
                            {selectedIncident.severity && (
                              <span style={{
                                fontSize: 12,
                                padding: '6px 12px',
                                borderRadius: 999,
                                fontWeight: 700,
                                backgroundColor: selectedIncident.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                                color: selectedIncident.severity === 'CRITICAL' ? '#d92b2b' : '#92400e'
                              }}>
                                {selectedIncident.severity}
                              </span>
                            )}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: muted, fontWeight: 600 }}>
                              <Clock size={13} />
                              <TimeAgo date={selectedIncident.timestamp || selectedIncident.createdAt} />
                            </span>
                          </div>
                          <p style={{ color: muted, lineHeight: 1.6 }}>{selectedIncident.description}</p>
                          <IncidentAttachments media={selectedIncident.media} darkMode={darkMode} />
                          {!isResolved(selectedIncident) && (
                            <button
                              onClick={() => handleResolveIncident(selectedIncident.id)}
                              disabled={resolvingId === selectedIncident.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 20,
                                padding: '12px 16px',
                                borderRadius: 12,
                                border: 'none',
                                backgroundColor: '#0f9d58',
                                color: 'white',
                                fontWeight: 800,
                                cursor: resolvingId === selectedIncident.id ? 'not-allowed' : 'pointer',
                                opacity: resolvingId === selectedIncident.id ? 0.7 : 1
                              }}
                            >
                              <CheckCircle size={18} />
                              {resolvingId === selectedIncident.id ? 'Marking...' : 'Mark as Resolved'}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedIncident(null)}
                        style={{
                          padding: 8,
                          borderRadius: 12,
                          backgroundColor: soft,
                          color: muted,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = soft;
                        }}
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: text, fontFamily: 'var(--font-title)' }}>Recent Incidents</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {incidents.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: muted, backgroundColor: surface, borderRadius: 24, border: `1px solid ${border}`, boxShadow: cardShadow }}>
                      <p>No active incidents</p>
                    </div>
                  ) : (
                    incidents.slice(0, 6).map((incident) => {
                      const Icon = getIncidentIcon(incident.type);
                      const colors = getIncidentColor(incident.type);
                      return (
                        <div
                          key={incident.id}
                          onClick={() => setSelectedIncident(incident)}
                          style={{
                            padding: 20,
                            borderRadius: 16,
                            border: selectedIncident?.id === incident.id ? `1px solid ${darkMode ? '#60a5fa' : '#174ea6'}` : `1px solid ${border}`,
                            boxShadow: cardShadow,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            backgroundColor: selectedIncident?.id === incident.id ? (darkMode ? 'rgba(96,165,250,0.14)' : 'rgba(23,78,166,0.05)') : surface
                          }}
                          onMouseEnter={(e) => {
                            if (selectedIncident?.id !== incident.id) {
                              e.currentTarget.style.backgroundColor = darkMode ? '#111827' : '#f8fafc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedIncident?.id !== incident.id) {
                              e.currentTarget.style.backgroundColor = surface;
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              backgroundColor: colors.bg,
                              color: colors.color
                            }}>
                              <Icon size={24} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <h3 style={{ fontWeight: 900, color: text }}>{incident.type}</h3>
                              </div>
                              <p style={{ fontSize: 14, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{incident.description}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <Clock size={12} style={{ color: muted }} />
                                <span style={{ fontSize: 12, color: muted }}>
                                  <TimeAgo date={incident.timestamp || incident.createdAt} />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ maxWidth: 896, margin: '0 auto', paddingLeft: pagePadding, paddingRight: pagePadding, paddingTop: pagePadding, paddingBottom: pagePadding }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: text, marginBottom: 32, fontFamily: 'var(--font-title)' }}>Admin Users</h1>
            <div style={{ backgroundColor: surface, borderRadius: 24, padding: 24, border: `1px solid ${border}`, boxShadow: cardShadow }}>
              <p style={{ color: muted }}>User management interface coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div style={{ maxWidth: 720, margin: '0 auto', paddingLeft: pagePadding, paddingRight: pagePadding, paddingTop: pagePadding, paddingBottom: pagePadding }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: text, marginBottom: 8, fontFamily: 'var(--font-title)' }}>Account</h1>
            <p style={{ color: muted, marginBottom: 24 }}>Change the password for {user?.email || user?.name}.</p>

            <form
              onSubmit={handlePasswordChange}
              style={{
                backgroundColor: surface,
                borderRadius: 24,
                padding: 24,
                border: `1px solid ${border}`,
                boxShadow: cardShadow,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {[
                { key: 'currentPassword', label: 'Current password' },
                { key: 'newPassword', label: 'New password' },
                { key: 'confirmPassword', label: 'Confirm new password' }
              ].map((field) => (
                <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 8, color: text, fontWeight: 800 }}>
                  <span style={{ fontSize: 14 }}>{field.label}</span>
                  <input
                    type="password"
                    value={passwordForm[field.key]}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    minLength={field.key === 'currentPassword' ? undefined : 4}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      backgroundColor: darkMode ? '#020617' : '#f8fafc',
                      color: text,
                      outline: 'none'
                    }}
                  />
                </label>
              ))}

              {passwordStatus.message && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  backgroundColor: passwordStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
                  color: passwordStatus.type === 'success' ? '#0f9d58' : '#d92b2b',
                  fontWeight: 800
                }}>
                  {passwordStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: '#174ea6',
                  color: 'white',
                  fontWeight: 800,
                  cursor: changingPassword ? 'not-allowed' : 'pointer',
                  opacity: changingPassword ? 0.7 : 1
                }}
              >
                <KeyRound size={18} />
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
}
