import './utils/cpanelEnv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { testDbConnection } from './config/db';
import { logger } from './utils/logger';
import { sendError } from './utils/apiResponse';

// 1. Preserve Passenger / cPanel assigned PORT before dotenv overrides
const passengerPort = process.env.PORT;
dotenv.config();

const app = express();

// 2. Diagnostic environment inspection for cPanel / Passenger deployments
logger.info(
  '[cPanel Env Inspection] Environment keys present:',
  Object.keys(process.env).filter(
    (k) =>
      k.startsWith('DB_') ||
      k.startsWith('ADMIN_') ||
      k.startsWith('JWT_') ||
      k === 'PORT' ||
      k === 'NODE_ENV'
  )
);

// 3. Security & Parser Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// Serve static images & uploads
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));



// 5. Health Check & Root Endpoints
app.get('/', (req: Request, res: Response, next) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    return res
      .status(200)
      .send(
        '<!DOCTYPE html><html><head><title>Restaurant Backend API</title></head><body><h1>Restaurant REST API Server is Running</h1></body></html>'
      );
  }
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'Restaurant Scalable REST API',
    timestamp: new Date().toISOString(),
  });
});

// 6. API Routes (Dual-mounted on /api and / for cPanel subpath compatibility)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 7. Fallback 404 & Error Handling
app.use((req: Request, res: Response) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
});
app.use(errorHandler);

// 8. Server Setup & Bootstrapping
const PORT = passengerPort || Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
const baseUrl =
  process.env.BASE_URL ||
  (isProd ? 'https://mow.landmaarkdeveloper.com' : `http://localhost:${PORT}`);

function bootstrap() {
  const httpServer = app.listen(PORT, () => {
    logger.info(`🚀 Restaurant Enterprise REST API Server running on port ${PORT}`);
    logger.info(`🔗 Health Check: ${baseUrl}/health`);
    logger.info(`🔗 Base API URL: ${baseUrl}/api`);
  });

  // Non-blocking database connection test
  testDbConnection().catch((err) => {
    logger.error('DB Connection Test Error:', err);
  });

  // Graceful shutdown handling
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

  return httpServer;
}

// 9. Global Crash Prevention
process.on('unhandledRejection', (reason: any) => {
  logger.error('⚠️ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('⚠️ Uncaught Exception:', err);
});

bootstrap();

export default app;
