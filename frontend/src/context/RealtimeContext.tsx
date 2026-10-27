import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, getSocket, disconnectSocket } from '../services/socketService';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeEvent: (eventName: string, callback: (data: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  socket: null,
  isConnected: false,
  subscribeEvent: () => () => {},
});

export const RealtimeProvider: React.FC<{ session?: any; children: React.ReactNode }> = ({ session, children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socketInst, setSocketInst] = useState<Socket | null>(null);

  useEffect(() => {
    const s = initializeSocket(session);
    setSocketInst(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    setIsConnected(s.connected);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      disconnectSocket();
    };
  }, [session]);

  const subscribeEvent = (eventName: string, callback: (data: any) => void) => {
    const s = socketInst || getSocket();
    if (!s) return () => {};

    console.log(`🎧 [Realtime Context] Subscribed listener for event: "${eventName}"`);
    s.on(eventName, callback);

    return () => {
      console.log(`🔕 [Realtime Context] Unsubscribed listener for event: "${eventName}"`);
      s.off(eventName, callback);
    };
  };

  return (
    <RealtimeContext.Provider value={{ socket: socketInst, isConnected, subscribeEvent }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);

export const useRealtimeEvent = (eventName: string, callback: (data: any) => void) => {
  const { subscribeEvent } = useRealtime();

  useEffect(() => {
    const unsubscribe = subscribeEvent(eventName, callback);
    return () => {
      unsubscribe();
    };
  }, [eventName, callback]);
};
