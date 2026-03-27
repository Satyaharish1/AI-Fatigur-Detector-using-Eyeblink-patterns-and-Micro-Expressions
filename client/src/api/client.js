const API_URL = 'http://localhost:5000/api';
import { getToken } from './auth';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  getOverview: () => request('/analytics/overview'),
  createDemoSession: () =>
    request('/sessions/demo', {
      method: 'POST'
    }),
  clearAllSessions: () =>
    request('/sessions', {
      method: 'DELETE'
    }),
  deleteSession: (sessionId) =>
    request(`/sessions/${sessionId}`, {
      method: 'DELETE'
    }),
  createSession: (payload) =>
    request('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getProfile: () => request('/auth/me'),
  sendTelemetry: (sessionId, payload) =>
    request(`/sessions/${sessionId}/telemetry`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  saveMonitorPdf: (payload) =>
    request('/reports/monitor-pdf', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
