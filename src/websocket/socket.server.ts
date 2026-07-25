import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Socket client connected: ${socket.id}`);

    // Join specific rooms
    socket.on('join:room', (room: string) => {
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room '${room}'`);
    });

    // Join customer order room for live tracking
    socket.on('join:order', (orderId: string) => {
      const room = `order_${orderId}`;
      socket.join(room);
      logger.info(`Socket ${socket.id} listening to live tracking for Order #${orderId}`);
    });

    // Kitchen staff room
    socket.on('join:kitchen', () => {
      socket.join('kitchen');
      logger.info(`Socket ${socket.id} joined Kitchen room`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
}
