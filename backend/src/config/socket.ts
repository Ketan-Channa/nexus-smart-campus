import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_smart_campus_jwt_secret_key_2026';

let io: SocketIOServer | null = null;

export const normalizeRoomKey = (str: string): string => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/[\.\-\s]/g, '');
};

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    transports: ['websocket', 'polling'],
  });

  // JWT & Handshake Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const authData = socket.handshake.auth || {};
      const queryData = socket.handshake.query || {};

      const token = authData.token || queryData.token;
      let userData: any = authData.user || null;

      if (!userData && typeof queryData.user === 'string') {
        try {
          userData = JSON.parse(queryData.user);
        } catch (e) {}
      }

      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          socket.data.user = { ...decoded, ...userData };
        } catch (err) {
          socket.data.user = userData || { role: 'Guest', email: 'guest@nexus.edu' };
        }
      } else if (userData) {
        socket.data.user = userData;
      } else {
        socket.data.user = { role: 'Guest', email: 'guest@nexus.edu' };
      }

      next();
    } catch (error: any) {
      console.error('Socket Authentication Error:', error.message);
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user || {};
    const email = user.email || user.studentEmail || user.facultyEmail || '';
    const userId = user.id || user.rollNumber || email;
    const role = user.role || 'Guest';
    const rawClass = user.className || user.class_name || user.userClass || user.inchargeClass || 'B.TECH CSE 2023 A';
    const dept = user.department || 'CSE';

    // Room Joins
    if (email) {
      socket.join(`user:${email.toLowerCase()}`);
    }
    if (userId) {
      socket.join(`user:${userId}`);
    }
    if (role) {
      socket.join(`role:${role}`);
    }
    if (dept) {
      socket.join(`department:${normalizeRoomKey(dept)}`);
    }

    if (rawClass) {
      const classKey = normalizeRoomKey(rawClass);
      socket.join(`class:${classKey}`);
      console.log(`🔌 [Socket.IO] Client connected (${socket.id}): ${user.name || email} [${role}] -> Room: class:${classKey}`);
    }

    // Direct room join request handler
    socket.on('join_room', (roomName: string) => {
      if (roomName) {
        const cleanRoom = roomName.startsWith('class:') ? `class:${normalizeRoomKey(roomName.replace('class:', ''))}` : roomName;
        socket.join(cleanRoom);
        console.log(`🔌 [Socket.IO] Client ${socket.id} joined custom room: ${cleanRoom}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.IO] Client disconnected (${socket.id}): ${reason}`);
    });
  });

  console.log('⚡ Socket.IO Realtime Server Initialized!');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO server has not been initialized!');
  }
  return io;
};

export const emitRealtimeEvent = (
  rooms: string | string[],
  eventName: string,
  payload: any
): void => {
  if (!io) {
    console.warn(`[Realtime] Event "${eventName}" omitted because Socket.IO is not initialized.`);
    return;
  }

  const targetRooms = Array.isArray(rooms) ? rooms : [rooms];
  const formattedRooms = targetRooms.map((r) =>
    r.startsWith('class:') ? `class:${normalizeRoomKey(r.replace('class:', ''))}` : r
  );

  console.log(`📡 [Realtime Dispatch] Event: "${eventName}" -> Target Rooms: [${formattedRooms.join(', ')}]`);

  formattedRooms.forEach((room) => {
    io!.to(room).emit(eventName, {
      ...payload,
      timestamp: new Date().toISOString(),
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    });
  });
};
