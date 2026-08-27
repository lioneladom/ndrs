import React, { useState, useEffect } from 'react';
import { LogOut, Home, FileText, Map, BookOpen, Bell, MapPin, Flame, Droplets, HeartPulse, Car, X, Upload, Loader2, CheckCircle2, Camera, User, Moon, Sun, AlertTriangle, Wind, Zap, ShieldAlert, Mountain, HandHelping, Clock, Settings, Menu } from 'lucide-react';
import MaplibreMap from '../components/MaplibreMap';
import IncidentAttachments from '../components/IncidentAttachments';
import TimeAgo from '../components/TimeAgo';
import SettingsModal from '../components/SettingsModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api, socket } from '../utils/api';
import { prepareReportMedia } from '../utils/media';

export default function CitizenApp() {
  const { user, logout } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSeverity, setReportSeverity] = useState('Medium');
  const [reportLocation, setReportLocation] = useState(null);
  const [reportMedia, setReportMedia] = useState([]);
  const [reporting, setReporting] = useState(false);
  const [preparingMedia, setPreparingMedia] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const { darkMode } = useTheme();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isResolved = (incident) => incident?.status?.toLowerCase() === 'resolved';
  const isMobile = viewportWidth < 640;
  const pagePadding = isMobile ? 16 : 24;
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
    socket.on('resource_updated', (resource) => {
      setResources((prev) => prev.map((item) => item.id === resource.id ? resource : item));
    });

    return () => {
      mounted = false;
      socket.off('init_data');
      socket.off('new_incident');
      socket.off('incident_updated');
      socket.off('incident_resolved');
      socket.off('incidents_update');
      socket.off('resources_update');
      socket.off('resource_updated');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings', isAction: true },
  ];

  const quickReports = [
    { type: 'FIRE', icon: Flame, label: 'Fire', color: '#d92b2b', bg: '#fee2e2' },
    { type: 'FLOOD', icon: Droplets, label: 'Flood', color: '#174ea6', bg: '#dbeafe' },
    { type: 'MEDICAL', icon: HeartPulse, label: 'Medical', color: '#0f9d58', bg: '#d1fae5' },
    { type: 'ACCIDENT', icon: Car, label: 'Accident', color: '#f4b400', bg: '#fef3c7' },
    { type: 'POLICE', icon: MapPin, label: 'Crime', color: '#6366f1', bg: '#e0e7ff' },
    { type: 'EARTHQUAKE', icon: AlertTriangle, label: 'Earthquake', color: '#92400e', bg: '#fef3c7' },
    { type: 'LANDSLIDE', icon: MapPin, label: 'Landslide', color: '#7c2d12', bg: '#fff7ed' },
    { type: 'STORM', icon: Wind, label: 'Storm', color: '#0f172a', bg: '#f1f5f9' },
    { type: 'POWER', icon: Zap, label: 'Power Outage', color: '#eab308', bg: '#fefce8' },
  ];

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportType || !reportLocation) {
      alert('Please fill in all required fields and ensure location is captured');
      return;
    }
    
    setReporting(true);
    try {
      const formData = new FormData();
      formData.append('type', reportType);
      formData.append('severity', reportSeverity);
      formData.append('description', reportDescription);
      formData.append('location', JSON.stringify(reportLocation));
      formData.append('reporterName', user?.name || 'Anonymous');
      
      reportMedia.forEach(file => {
        formData.append('media', file);
      });

      await api.reportIncident(formData);
      setShowReportForm(false);
      setReportType('');
      setReportDescription('');
      setReportSeverity('Medium');
      setReportLocation(null);
      setReportMedia([]);
      setLocationError(null);
      alert('Report submitted successfully!');
    } catch (err) {
      alert(`Failed to submit report: ${err.message}`);
    } finally {
      setReporting(false);
    }
  };

  const captureLocation = () => {
    setLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    const onSuccess = (position) => {
      const loc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setTempLocation(loc);
      setShowLocationConfirm(true);
      setLocating(false);
    };

    const onError = (error) => {
      // If high-accuracy (GPS) failed, retry with low accuracy (network/cell)
      if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (fallbackError) => {
            let message;
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                message = 'Location permission denied. Please enable it in your browser/phone settings: Settings → Apps → Browser → Permissions → Location.';
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                message = 'Location unavailable. Please check that Location Services are enabled on your phone.';
                break;
              default:
                message = 'Could not get your location. Please try again or check your phone\'s location settings.';
            }
            setLocationError(message);
            setLocating(false);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
        return;
      }
      let message;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location permission denied. Please enable it in your browser/phone settings: Settings → Apps → Browser → Permissions → Location.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location unavailable. Please ensure Location Services are enabled on your phone.';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out. Moving to a location with better signal may help.';
          break;
        default:
          message = 'Could not get your location. Please try again.';
      }
      setLocationError(message);
      setLocating(false);
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const confirmLocation = () => {
    setReportLocation(tempLocation);
    setShowLocationConfirm(false);
  };

  const appendMediaFiles = async (files, replace = false) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    setPreparingMedia(true);
    try {
      const prepared = await prepareReportMedia(selectedFiles);
      setReportMedia((prev) => replace ? prepared : [...prev, ...prepared]);
    } finally {
      setPreparingMedia(false);
    }
  };

  const handleMediaChange = async (e) => {
    await appendMediaFiles(e.target.files, true);
    e.target.value = '';
  };

  const removeMedia = (index) => {
    setReportMedia(reportMedia.filter((_, i) => i !== index));
  };

  // Trigger the hidden camera input (opens native camera app on mobile)
  const capturePhoto = () => {
    document.getElementById('camera-capture').click();
  };

  const handleCameraCapture = async (e) => {
    await appendMediaFiles(e.target.files);
    e.target.value = '';
  };

  const getIncidentIconStyle = (incident) => {
    switch (incident.type) {
      case 'FIRE': return { bg: '#fee2e2', color: '#d92b2b' };
      case 'FLOOD': return { bg: '#dbeafe', color: '#174ea6' };
      case 'MEDICAL': return { bg: '#d1fae5', color: '#0f9d58' };
      case 'ACCIDENT': return { bg: '#fef3c7', color: '#f4b400' };
      case 'POLICE': return { bg: '#e0e7ff', color: '#6366f1' };
      case 'EARTHQUAKE': return { bg: '#fef3c7', color: '#92400e' };
      case 'LANDSLIDE': return { bg: '#fff7ed', color: '#7c2d12' };
      case 'STORM': return { bg: '#f1f5f9', color: '#0f172a' };
      case 'POWER': return { bg: '#fefce8', color: '#eab308' };
      default: return { bg: '#fef3c7', color: '#f4b400' };
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="responsive-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 1.875rem)', fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Welcome back, {user?.name}!</h1>
                <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: 8 }}>Stay safe and informed in your area</p>
              </div>
            </div>

            <div className="responsive-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Quick Report</h2>
              <button
                onClick={() => setShowReportForm(true)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 16,
                  background: '#dc2626',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.2)';
                  e.currentTarget.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)';
                  e.currentTarget.style.background = '#dc2626';
                }}
              >
                <MapPin size={18} /> New Report
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: 16
            }}>
              {quickReports.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.type}
                    onClick={() => {
                      setReportType(report.type);
                      setShowReportForm(true);
                    }}
                    style={{
                      padding: 20,
                      borderRadius: 20,
                      background: darkMode ? '#0f172a' : 'white',
                      border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.2s ease',
                      boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: report.bg,
                      color: report.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={28} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>{report.label}</span>
                  </button>
                );
              })}
            </div>

            {incidents.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Active Reports Nearby</h2>
                  <button
                    onClick={() => setActiveTab('map')}
                    style={{ color: darkMode ? '#60a5fa' : '#2563eb', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    View Map
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {incidents.slice(0, 3).map(incident => {
                    const style = getIncidentIconStyle(incident);
                    return (
                      <div
                        key={incident.id}
                        onClick={() => {
                          setSelectedIncident(incident);
                          setActiveTab('map');
                        }}
                        style={{
                          padding: 20,
                          borderRadius: 16,
                          background: darkMode ? '#0f172a' : 'white',
                          border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 16,
                          transition: 'all 0.2s ease',
                          boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                      >
                        <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 16,
                              backgroundColor: style.bg,
                              color: style.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {incident.type === 'FIRE' && <Flame size={24} />}
                              {incident.type === 'FLOOD' && <Droplets size={24} />}
                              {incident.type === 'MEDICAL' && <HeartPulse size={24} />}
                              {incident.type === 'ACCIDENT' && <Car size={24} />}
                              {incident.type === 'POLICE' && <ShieldAlert size={24} />}
                              {incident.type === 'EARTHQUAKE' && <AlertTriangle size={24} />}
                              {incident.type === 'LANDSLIDE' && <Mountain size={24} />}
                              {incident.type === 'STORM' && <Wind size={24} />}
                              {incident.type === 'POWER' && <Zap size={24} />}
                            </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>{incident.type} Report</h3>
                            <span style={{
                              fontSize: 12,
                              padding: '4px 8px',
                              borderRadius: 999,
                              fontWeight: 700,
                              backgroundColor: incident.status === 'New' ? '#fee2e2' : '#dbeafe',
                              color: incident.status === 'New' ? '#dc2626' : '#2563eb',
                            }}>
                              {incident.status}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b', marginLeft: 'auto' }}>
                              <Clock size={12} />
                              <TimeAgo date={incident.timestamp || incident.createdAt} />
                            </span>
                          </div>
                          <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: 14, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {incident.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'map':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: isMobile ? 'calc(100vh - 210px)' : 'calc(100vh - 200px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Live Map</h1>
            </div>
            <div style={{
              height: isMobile ? 360 : 500,
              borderRadius: 24,
              overflow: 'hidden',
              border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
              boxShadow: darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}>
              <MaplibreMap
                darkMode={darkMode}
                incidents={incidents}
                resources={resources}
                onMarkerClick={(inc) => setSelectedIncident(inc)}
              />
            </div>
            {selectedIncident && (
              <div style={{
                background: darkMode ? '#0f172a' : 'white',
                borderRadius: 24,
                padding: 24,
                border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                boxShadow: darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}>
                <div className="responsive-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div className="responsive-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, minWidth: 0 }}>
                    <div style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      backgroundColor: getIncidentIconStyle(selectedIncident).bg,
                      color: getIncidentIconStyle(selectedIncident).color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {selectedIncident.type === 'FIRE' && <Flame size={28} />}
                      {selectedIncident.type === 'FLOOD' && <Droplets size={28} />}
                      {selectedIncident.type === 'MEDICAL' && <HeartPulse size={28} />}
                      {selectedIncident.type === 'ACCIDENT' && <Car size={28} />}
                      {selectedIncident.type === 'POLICE' && <ShieldAlert size={28} />}
                      {selectedIncident.type === 'EARTHQUAKE' && <AlertTriangle size={28} />}
                      {selectedIncident.type === 'LANDSLIDE' && <Mountain size={28} />}
                      {selectedIncident.type === 'STORM' && <Wind size={28} />}
                      {selectedIncident.type === 'POWER' && <Zap size={28} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{ fontSize: 24, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>{selectedIncident.type} Report</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                        <span style={{
                          fontSize: 14,
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontWeight: 700,
                          backgroundColor: selectedIncident.status === 'New' ? '#fee2e2' : isResolved(selectedIncident) ? '#d1fae5' : '#dbeafe',
                          color: selectedIncident.status === 'New' ? '#dc2626' : isResolved(selectedIncident) ? '#0f9d58' : '#2563eb',
                        }}>
                          {selectedIncident.status}
                        </span>
                        {selectedIncident.severity && (
                          <span style={{
                            fontSize: 14,
                            padding: '6px 12px',
                            borderRadius: 999,
                            fontWeight: 700,
                            backgroundColor: selectedIncident.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                            color: selectedIncident.severity === 'CRITICAL' ? '#dc2626' : '#b45309',
                          }}>
                            {selectedIncident.severity}
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
                          <Clock size={13} />
                          <TimeAgo date={selectedIncident.timestamp || selectedIncident.createdAt} />
                        </span>
                      </div>
                      <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: 12, lineHeight: 1.6 }}>{selectedIncident.description}</p>
                      
                      <IncidentAttachments media={selectedIncident.media} darkMode={darkMode} />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    style={{
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
                      color: darkMode ? '#94a3b8' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#1e293b' : '#f1f5f9';
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'reports':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="responsive-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>All Reports</h1>
              <button
                onClick={() => setShowReportForm(true)}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 700,
                  padding: '12px 20px',
                  borderRadius: 16,
                  boxShadow: darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)';
                  e.currentTarget.style.background = '#2563eb';
                }}
              >
                New Report
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {incidents.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 64, paddingBottom: 64, color: darkMode ? '#94a3b8' : '#64748b' }}>
                  <p style={{ fontSize: 18 }}>No reports yet</p>
                </div>
              ) : (
                incidents.map(incident => {
                  const isCritical = incident.severity === 'CRITICAL';
                  const style = getIncidentIconStyle(incident);
                  return (
                    <div
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      style={{
                        padding: 24,
                        borderRadius: 24,
                        background: darkMode ? '#0f172a' : 'white',
                        border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                        boxShadow: darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = darkMode ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          backgroundColor: style.bg,
                          color: style.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {incident.type === 'FIRE' && <Flame size={24} />}
                          {incident.type === 'FLOOD' && <Droplets size={24} />}
                          {incident.type === 'MEDICAL' && <HeartPulse size={24} />}
                          {incident.type === 'ACCIDENT' && <Car size={24} />}
                          {incident.type === 'POLICE' && <ShieldAlert size={24} />}
                          {incident.type === 'EARTHQUAKE' && <AlertTriangle size={24} />}
                          {incident.type === 'LANDSLIDE' && <Mountain size={24} />}
                          {incident.type === 'STORM' && <Wind size={24} />}
                          {incident.type === 'POWER' && <Zap size={24} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>{incident.type} Report</h3>
                            {incident.severity && (
                              <span style={{
                                fontSize: 12,
                                padding: '6px 12px',
                                borderRadius: 999,
                                fontWeight: 700,
                                backgroundColor: isCritical ? '#fee2e2' : '#fef3c7',
                                color: isCritical ? '#dc2626' : '#b45309',
                              }}>
                                {incident.severity}
                              </span>
                            )}
                            <span style={{
                              fontSize: 12,
                              padding: '6px 12px',
                              borderRadius: 999,
                              fontWeight: 700,
                              backgroundColor: incident.status === 'New' ? '#fee2e2' : '#dbeafe',
                              color: incident.status === 'New' ? '#dc2626' : '#2563eb',
                            }}>
                              {incident.status}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b', marginLeft: 'auto' }}>
                              <Clock size={12} />
                              <TimeAgo date={incident.timestamp || incident.createdAt} />
                            </span>
                          </div>
                          <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: 8, lineHeight: 1.6 }}>{incident.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'resources':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Safety Resources</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {[
                {
                  id: 'flood',
                  title: 'Flood Preparedness',
                  icon: Droplets,
                  color: '#2563eb',
                  bg: '#dbeafe',
                  content: 'Move to higher ground, avoid flood waters, and stay tuned to local authorities.',
                  detailed: [
                    'Stay informed - Listen to local radio/TV for updates',
                    'Move to higher ground immediately if advised',
                    'Avoid walking or driving through flood waters',
                    'Turn off utilities at main switches if instructed',
                    'Have an emergency kit ready',
                  ]
                },
                {
                  id: 'fire',
                  title: 'Fire Safety',
                  icon: Flame,
                  color: '#dc2626',
                  bg: '#fee2e2',
                  content: 'Stop, drop and roll. Have an escape plan and know emergency exits.',
                  detailed: [
                    'Install and maintain smoke alarms',
                    'Have a home escape plan',
                    'Practice the escape plan twice a year',
                    'Never leave cooking unattended',
                    'Keep flammable objects away from heat',
                  ]
                },
                {
                  id: 'firstaid',
                  title: 'First Aid Basics',
                  icon: HeartPulse,
                  color: '#16a34a',
                  bg: '#d1fae5',
                  content: 'Check airway, breathing, and circulation. Control bleeding and seek help.',
                  detailed: [
                    'Check airway - ensure it is clear',
                    'Check breathing - look, listen and feel',
                    'Check circulation - check pulse',
                    'Control severe bleeding - apply firm pressure',
                    'Call emergency services immediately',
                  ]
                },
                {
                  id: 'contacts',
                  title: 'Emergency Contacts',
                  icon: MapPin,
                  color: '#f59e0b',
                  bg: '#fef3c7',
                  content: 'Call local emergency services immediately if you are in danger.',
                  detailed: [
                    'Police: 191',
                    'Fire: 192',
                    'Ambulance: 193',
                    'National Disaster Management Organization (NADMO): 190',
                    'Keep a printed copy of emergency contacts',
                  ]
                }
              ].map((res, i) => {
                const Icon = res.icon;
                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResource(res)}
                    style={{
                      padding: 32,
                      borderRadius: 24,
                      background: darkMode ? '#0f172a' : 'white',
                      border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      backgroundColor: res.bg,
                      color: res.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      <Icon size={28} />
                    </div>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', marginBottom: 12, fontFamily: 'var(--font-title)' }}>{res.title}</h3>
                    <p style={{ color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>{res.content}</p>
                  </div>
                );
              })}
            </div>

            {selectedResource && (
              <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }} onClick={() => setSelectedResource(null)}>
                <div className="ndrs-modal" style={{
                  backgroundColor: darkMode ? '#0f172a' : 'white',
                  borderRadius: 24,
                  padding: isMobile ? 20 : 32,
                  maxWidth: 600,
                  width: '100%',
                  boxShadow: darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
                }} onClick={(e) => e.stopPropagation()}>
                  <div className="responsive-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                    <div className="responsive-row" style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: selectedResource.bg,
                        color: selectedResource.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <selectedResource.icon size={28} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>{selectedResource.title}</h2>
                        <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{selectedResource.content}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedResource(null)}
                      style={{
                        padding: 8,
                        borderRadius: 12,
                        backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
                        color: darkMode ? '#94a3b8' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#1e293b' : '#f1f5f9';
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedResource.detailed.map((item, index) => (
                      <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, backgroundColor: darkMode ? '#1e293b' : '#f8fafc', borderRadius: 12 }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: selectedResource.bg, color: selectedResource.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 12 }}>
                          {index + 1}
                        </span>
                        <p style={{ color: darkMode ? '#cbd5e1' : '#334155', lineHeight: 1.6, margin: 0 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'alerts':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Emergency Alerts</h1>
            {incidents.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 64, paddingBottom: 64, color: darkMode ? '#94a3b8' : '#64748b' }}>
                <p style={{ fontSize: 18 }}>No active alerts</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {incidents.map(incident => {
                  const isCritical = incident.severity === 'CRITICAL';
                  const getIcon = () => {
                    switch (incident.type) {
                      case 'FIRE': return Flame;
                      case 'FLOOD': return Droplets;
                      case 'MEDICAL': return HeartPulse;
                      case 'ACCIDENT': return Car;
                      case 'POLICE': return ShieldAlert;
                      case 'EARTHQUAKE': return AlertTriangle;
                      case 'LANDSLIDE': return Mountain;
                      case 'STORM': return Wind;
                      case 'POWER': return Zap;
                      default: return Bell;
                    }
                  };
                  const Icon = getIcon();
                  return (
                    <div
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      style={{
                        padding: 24,
                        borderRadius: 24,
                        border: `1px solid ${darkMode ? '#1e293b' : (isCritical ? 'rgba(220,38,38,0.3)' : '#e2e8f0')}`,
                        boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
                        background: darkMode ? (isCritical ? 'rgba(220,38,38,0.1)' : '#0f172a') : (isCritical ? '#fee2e2' : 'white'),
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = darkMode ? '0 10px 15px -3px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          backgroundColor: isCritical ? '#dc2626' : getIncidentIconStyle(incident).bg,
                          color: isCritical ? 'white' : getIncidentIconStyle(incident).color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h3 style={{
                              fontSize: 20,
                              fontWeight: 900,
                              color: darkMode ? (isCritical ? '#fecaca' : '#f8fafc') : (isCritical ? '#dc2626' : '#0f172a'),
                              fontFamily: 'var(--font-title)',
                            }}>
                              {incident.type} Alert
                            </h3>
                            <span style={{
                              fontSize: 12,
                              padding: '6px 12px',
                              borderRadius: 999,
                              fontWeight: 700,
                              backgroundColor: isCritical ? '#dc2626' : '#fef3c7',
                              color: isCritical ? 'white' : '#92400e',
                            }}>
                              {incident.severity}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: darkMode ? '#94a3b8' : '#64748b', marginLeft: 'auto' }}>
                              <Clock size={12} />
                              <TimeAgo date={incident.timestamp || incident.createdAt} />
                            </span>
                          </div>
                          <p style={{ color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>{incident.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#020617' : '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        zIndex: 1000,
        background: 'linear-gradient(90deg, #dc2626 33.3%, #f59e0b 33.3% 66.6%, #16a34a 66.6%)',
      }} />

      <header style={{
        backgroundColor: darkMode ? '#0f172a' : 'white',
        borderBottom: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
        paddingLeft: isMobile ? pagePadding : (sidebarOpen ? 240 + pagePadding : 80 + pagePadding),
        paddingRight: pagePadding,
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: 6,
        boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'padding-left 0.3s ease',
      }}>
        <div style={{
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
        }}>
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: darkMode ? '#1e293b' : '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: darkMode ? '#38bdf8' : '#2563eb',
                border: `1px solid ${darkMode ? '#334155' : '#dbeafe'}`
              }}>
                <HandHelping size={24} />
              </div>
              <span style={{ fontWeight: 900, fontSize: 24, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>NDRS Ghana</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              display: isMobile ? 'none' : 'block',
              fontWeight: 700,
              fontSize: 14,
              color: darkMode ? '#f8fafc' : '#0f172a'
            }}>
              {user?.name}
            </span>
          </div>
        </div>
      </header>

      <main style={{
        flex: 1,
        width: '100%',
        paddingLeft: isMobile ? 0 : (sidebarOpen ? 240 : 80),
        paddingTop: 32,
        paddingBottom: 100,
        transition: 'padding-left 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', paddingLeft: pagePadding, paddingRight: pagePadding }}>
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav style={{
        display: isMobile ? 'flex' : 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: darkMode ? '#0f172a' : 'white',
        borderTop: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 12,
        paddingBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction) {
                  setShowSettingsModal(true);
                } else {
                  setActiveTab(item.id);
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px clamp(6px, 2vw, 16px)',
                borderRadius: 16,
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                color: isActive ? (darkMode ? '#60a5fa' : '#2563eb') : (darkMode ? '#94a3b8' : '#64748b'),
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = darkMode ? '#1e293b' : '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={24} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'inherit' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={{
          position: 'fixed',
          top: 6,
          left: 0,
          bottom: 0,
          width: sidebarOpen ? 240 : 80,
          backgroundColor: darkMode ? '#0f172a' : 'white',
          borderRight: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          zIndex: 50,
          boxShadow: darkMode ? '4px 0 10px rgba(0,0,0,0.2)' : '4px 0 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-end' : 'center', borderBottom: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`, minHeight: 76 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: darkMode ? '#94a3b8' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
                borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#1e293b' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isAction) {
                      setShowSettingsModal(true);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    gap: 12,
                    padding: sidebarOpen ? '12px 16px' : '14px 0',
                    borderRadius: 12,
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                    color: isActive ? (darkMode ? '#60a5fa' : '#2563eb') : (darkMode ? '#94a3b8' : '#64748b'),
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = darkMode ? '#1e293b' : '#f1f5f9';
                      e.currentTarget.style.color = darkMode ? '#f8fafc' : '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = darkMode ? '#94a3b8' : '#64748b';
                    }
                  }}
                >
                  <Icon size={22} style={{ flexShrink: 0 }} />
                  {sidebarOpen && <span style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div className="ndrs-modal" style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            borderRadius: 24,
            padding: isMobile ? 20 : 32,
            maxWidth: 512,
            width: '100%',
            border: darkMode ? '1px solid #334155' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Report Emergency</h2>
              <button
                onClick={() => {
                  setShowReportForm(false);
                  setReportType('');
                  setReportDescription('');
                  setReportSeverity('Medium');
                  setReportLocation(null);
                  setReportMedia([]);
                  setLocationError(null);
                }}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#475569' : '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#f1f5f9';
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: 8 }}>Type *</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    border: '1px solid var(--ndrs-border)',
                    backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    fontSize: 16,
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#174ea6';
                    e.target.style.boxShadow = '0 0 0 4px rgba(23,78,166,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--ndrs-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select type...</option>
                  <option value="FIRE">Fire</option>
                  <option value="FLOOD">Flood</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="ACCIDENT">Accident</option>
                  <option value="POLICE">Crime</option>
                  <option value="EARTHQUAKE">Earthquake</option>
                  <option value="LANDSLIDE">Landslide</option>
                  <option value="STORM">Storm</option>
                  <option value="POWER">Power Outage</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: 8 }}>Severity</label>
                <select
                  value={reportSeverity}
                  onChange={(e) => setReportSeverity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    fontSize: 16,
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#174ea6';
                    e.target.style.boxShadow = '0 0 0 4px rgba(23,78,166,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: 8 }}>Description</label>
                <textarea
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    fontSize: 16,
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s ease',
                    resize: 'vertical',
                  }}
                  placeholder="Describe the emergency..."
                  onFocus={(e) => {
                    e.target.style.borderColor = '#174ea6';
                    e.target.style.boxShadow = '0 0 0 4px rgba(23,78,166,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: 8 }}>Location *</label>
                {!reportLocation ? (
                  <button
                    type="button"
                    onClick={captureLocation}
                    disabled={locating}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 16,
                      border: '1px solid #e2e8f0',
                      backgroundColor: locating ? '#f1f5f9' : '#f8fafc',
                      color: '#0f172a',
                      fontSize: 16,
                      cursor: locating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!locating) {
                        e.currentTarget.style.borderColor = '#174ea6';
                        e.currentTarget.style.backgroundColor = '#dbeafe';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!locating) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                  >
                    {locating ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
                    {locating ? 'Capturing Location...' : 'Capture My Location'}
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 16,
                    border: '1px solid #0f9d58',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={20} />
                      <span>Location Captured</span>
                    </div>
                    <button
                      type="button"
                      onClick={captureLocation}
                      disabled={locating}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: 'none',
                        backgroundColor: '#065f46',
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: locating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Retake
                    </button>
                  </div>
                )}
                {locationError && (
                  <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{locationError}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: 8 }}>Photos/Videos</label>
                <div className="responsive-row" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: '#0f172a',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Camera size={20} />
                    Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload').click()}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Upload size={20} />
                    Upload
                  </button>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  style={{ display: 'none' }}
                />
                {/* Native camera input — opens camera app on mobile */}
                <input
                  id="camera-capture"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  style={{ display: 'none' }}
                />
                {reportMedia.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Array.from(reportMedia).map((file, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: '#f1f5f9',
                      }}>
                        {file.type.startsWith('image') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {preparingMedia && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, color: darkMode ? '#94a3b8' : '#64748b', fontSize: 13, fontWeight: 700 }}>
                    <Loader2 className="animate-spin" size={16} />
                    Optimizing media...
                  </p>
                )}
              </div>

              <div className="responsive-row" style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowReportForm(false);
                    setReportType('');
                    setReportDescription('');
                    setReportSeverity('Medium');
                    setReportLocation(null);
                    setReportMedia([]);
                    setLocationError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 16,
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontWeight: 700,
                    backgroundColor: darkMode ? '#0f172a' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#1e293b' : '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#0f172a' : 'white';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting || preparingMedia}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: '#dc2626',
                    color: 'white',
                    fontWeight: 700,
                    border: 'none',
                    cursor: reporting || preparingMedia ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--ndrs-shadow)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!reporting && !preparingMedia) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!reporting && !preparingMedia) {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {(reporting || preparingMedia) ? <Loader2 className="animate-spin" size={20} /> : null}
                  {preparingMedia ? 'Optimizing...' : reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Confirmation Modal */}
      {showLocationConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
          }}>
            <MaplibreMap
              center={[tempLocation.lat, tempLocation.lng]}
              zoom={16}
              incidents={incidents}
              selectedLocation={tempLocation}
              onLocationSelect={(loc) => setTempLocation(loc)}
              darkMode={darkMode}
            />
          </div>
          <div style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            padding: '24px 20px',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>Confirm Location</h2>
              <button
                onClick={() => {
                  setShowLocationConfirm(false);
                  setTempLocation(null);
                }}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 20 }}>
              Drag the marker to adjust the exact location of the emergency.
            </p>
            <button
              onClick={confirmLocation}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 16,
                background: '#dc2626',
                color: 'white',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--ndrs-shadow)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}

      {/* Selected Incident Modal */}
      {selectedIncident && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }} onClick={() => setSelectedIncident(null)}>
          <div className="ndrs-modal" style={{
            backgroundColor: darkMode ? '#1e293b' : 'white',
            borderRadius: 24,
            padding: isMobile ? 20 : 32,
            maxWidth: 600,
            width: '100%',
          }} onClick={(e) => e.stopPropagation()}>
            <div className="responsive-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div className="responsive-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, minWidth: 0 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: getIncidentIconStyle(selectedIncident).bg,
                  color: getIncidentIconStyle(selectedIncident).color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedIncident.type === 'FIRE' && <Flame size={28} />}
                  {selectedIncident.type === 'FLOOD' && <Droplets size={28} />}
                  {selectedIncident.type === 'MEDICAL' && <HeartPulse size={28} />}
                  {selectedIncident.type === 'ACCIDENT' && <Car size={28} />}
                  {selectedIncident.type === 'POLICE' && <ShieldAlert size={28} />}
                  {selectedIncident.type === 'EARTHQUAKE' && <AlertTriangle size={28} />}
                  {selectedIncident.type === 'LANDSLIDE' && <Mountain size={28} />}
                  {selectedIncident.type === 'STORM' && <Wind size={28} />}
                  {selectedIncident.type === 'POWER' && <Zap size={28} />}
                  {!['FIRE', 'FLOOD', 'MEDICAL', 'ACCIDENT', 'POLICE', 'EARTHQUAKE', 'LANDSLIDE', 'STORM', 'POWER'].includes(selectedIncident.type) && <Bell size={28} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: 'var(--font-title)' }}>{selectedIncident.type} Report</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <span style={{
                      fontSize: 14,
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontWeight: 700,
                      backgroundColor: selectedIncident.status === 'New' ? '#fee2e2' : isResolved(selectedIncident) ? '#d1fae5' : '#dbeafe',
                      color: selectedIncident.status === 'New' ? '#dc2626' : isResolved(selectedIncident) ? '#0f9d58' : '#2563eb',
                    }}>
                      {selectedIncident.status}
                    </span>
                    {selectedIncident.severity && (
                      <span style={{
                        fontSize: 14,
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontWeight: 700,
                        backgroundColor: selectedIncident.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                        color: selectedIncident.severity === 'CRITICAL' ? '#dc2626' : '#b45309',
                      }}>
                        {selectedIncident.severity}
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
                      <Clock size={13} />
                      <TimeAgo date={selectedIncident.timestamp || selectedIncident.createdAt} />
                    </span>
                  </div>
                  <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: 12, lineHeight: 1.6 }}>{selectedIncident.description}</p>
                  
                  <IncidentAttachments media={selectedIncident.media} darkMode={darkMode} />
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#475569' : '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#f1f5f9';
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
}
