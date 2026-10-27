
const env = (import.meta as any).env;

const BACKEND_PORT = env?.VITE_BACKEND_PORT || '5000';

const DEFAULT_LOCAL_API = `http://localhost:${BACKEND_PORT}/api`;
const DEFAULT_LOCAL_SOCKET = `http://localhost:${BACKEND_PORT}`;

export const API_BASE: string =
  env?.VITE_API_URL || DEFAULT_LOCAL_API;

export const SOCKET_URL: string =
  env?.VITE_SOCKET_URL || DEFAULT_LOCAL_SOCKET;

export const getApiBase = async (): Promise<string> => {
  // Use the configured API URL on Vercel or any non-local deployment.
  if (env?.VITE_API_URL) {
    return env.VITE_API_URL;
  }

  // Check local backend ports during local development.
  try {
    for (const port of ['5000', '5001']) {
      const url = `http://localhost:${port}/api/health`;
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
      }).catch(() => null);

      if (response?.ok) {
        return `http://localhost:${port}/api`;
      }
    }
  } catch {
    // Fall back to the configured local API.
  }

  return DEFAULT_LOCAL_API;
};
