const BACKEND_PORT = (import.meta as any).env?.VITE_BACKEND_PORT || '5000';

export const API_BASE = `http://localhost:${BACKEND_PORT}/api`;
export const SOCKET_URL = `http://localhost:${BACKEND_PORT}`;

export const getApiBase = async (): Promise<string> => {
  // Quick health check on 5000 vs 5001
  try {
    const res5000 = await fetch('http://localhost:5000/api/health', { method: 'HEAD', mode: 'cors' }).catch(() => null);
    if (res5000 && res5000.ok) {
      return 'http://localhost:5000/api';
    }
    const res5001 = await fetch('http://localhost:5001/api/health', { method: 'HEAD', mode: 'cors' }).catch(() => null);
    if (res5001 && res5001.ok) {
      return 'http://localhost:5001/api';
    }
  } catch (e) {
    // fallback default
  }
  return `http://localhost:${BACKEND_PORT}/api`;
};
