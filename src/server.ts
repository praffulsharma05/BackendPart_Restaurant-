import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { testDbConnection } from './config/db';
import { logger } from './utils/logger';
import { sendError } from './utils/apiResponse';

dotenv.config();

const app = express();

// CORS — allow all origins
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// HTTP Request Logger Middleware
app.use(requestLogger);

// Root Endpoint (Required for cPanel / Phusion Passenger health check)
app.get('/', (_req: Request, res: Response, next) => {
  if (_req.headers.accept && _req.headers.accept.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<!DOCTYPE html><html><head><title>Restaurant Backend API</title></head><body><h1>Restaurant REST API Server is Running</h1></body></html>');
    return;
  }
  next();
});

// Health Check Endpoint
app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'Restaurant Scalable REST API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (Mounted on both /api and / for cPanel subpath compatibility)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback 404 Handler for undefined API routes
app.use((req: Request, res: Response) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Centralized Error Handler
app.use(errorHandler);



const PORT = process.env.PORT ? (isNaN(Number(process.env.PORT)) ? process.env.PORT : Number(process.env.PORT)) : 5000;

/**
 *
 */
function bootstrap() {
  const httpServer = app.listen(PORT, () => {
    logger.info(`🚀 Restaurant Enterprise REST API Server running on port ${PORT}`);
    logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
    logger.info(`🔗 Base API URL: http://localhost:${PORT}/`);
  });

  // Non-blocking database connection test
  testDbConnection().catch((err) => {
    logger.error('DB Connection Test Error:', err);
  });

  // Graceful shutdown on nodemon restart & process exit
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

bootstrap();

export default app;
