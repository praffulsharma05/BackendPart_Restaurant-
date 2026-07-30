import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { testDbConnection } from './config/db';
import { initSocketIO } from './websocket/socket.server';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Global Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check Endpoint
app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'Restaurant Scalable REST API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRouter);

// Centralized Error Handler
app.use(errorHandler);

// Initialize Socket.IO
initSocketIO(httpServer);

const PORT = Number(process.env.PORT) || 5000;

/**
 *
 */
async function bootstrap() {
  await testDbConnection();

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Restaurant Enterprise REST API Server running on port ${PORT}`);
    logger.info(`📡 Socket.IO Real-time Engine initialized`);
    logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
    logger.info(`🔗 Base API URL: http://localhost:${PORT}/api`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
});

// Graceful shutdown on nodemon restart & process exit
/**
 *
 * @param signal
 */
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Closing HTTP server...`);
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  });
};

process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

