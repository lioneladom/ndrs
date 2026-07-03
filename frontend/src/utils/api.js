export const API_BASE = import.meta.env.VITE_API_URL || '';

export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function getToken() {
  return localStorage.getItem('ndrs_token');
}

async function request(method, path, body, isFormData = false) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json().catch(() => null);
}

export const api = {
  // Incidents
  getIncidents:  ()       => request('GET',   '/api/incidents'),
  reportIncident:(data)   => request('POST',  '/api/incidents', data, true),
  updateIncident:(id, d)  => request('PATCH', `/api/incidents/${id}`, d),
  resolveIncident:(id)    => request('POST',  `/api/incidents/${id}/resolve`),

  // Resources
  getResources:  ()       => request('GET',   '/api/resources'),
  updateResource:(id, d)  => request('PATCH', `/api/resources/${id}`, d),

  // Dispatch
  dispatch: (data)        => request('POST',  '/api/dispatch', data),

  // Admin user management
  getAdminUsers:  ()             => request('GET',    '/api/admin/users'),
  createAdmin:    (data)         => request('POST',   '/api/admin/users', data),
  updateAdmin:    (id, data)     => request('PATCH',  `/api/admin/users/${id}`, data),
  suspendAdmin:   (id)           => request('POST',   `/api/admin/users/${id}/suspend`),
  activateAdmin:  (id)           => request('POST',   `/api/admin/users/${id}/activate`),
  resetAdminPwd:  (id, newPwd)   => request('POST',   `/api/admin/users/${id}/reset-password`, { newPassword: newPwd }),
  deleteAdmin:    (id)           => request('DELETE', `/api/admin/users/${id}`),

  // Auth (handled via AuthContext, but exposed for use in components)
  changePassword: (currentPassword, newPassword) =>
    request('POST', '/api/auth/change-password', { currentPassword, newPassword }),
};

// ── Socket.io helper ─────────────────────────────────────────────────────────
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const socket = io(SOCKET_URL, { autoConnect: false });
