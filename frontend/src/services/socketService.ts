
import { io, Socket } from 'socket.io-client';

const env = (import.meta as any).env;
const SOCKET_URL: string =
  env?.VITE_SOCKET_URL || 'https://nexus-smart-campus-backend.onrender.com';

let socket: Socket | null = null;

export const initializeSocket = (userSession: any): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const token =
    localStorage.getItem('nexus_token') ||
    sessionStorage.getItem('nexus_token') ||
    '';

  const user = userSession || null;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    auth: {
      token,
      user,
    },
    query: {
      token,
      user: JSON.stringify(user || {}),
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log(
      '[Socket.IO Client] Connected to NEXUS Realtime Engine:',
      socket?.id
    );
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO Client] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO Client] Disconnected:', reason);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
