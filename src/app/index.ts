import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { morganStream } from '../config/logger';
import { sendError } from '../utils/response';
import routes from '../routes';
import { Error } from '../types';
import { logger } from '../config/logger';

// Create Express app
const app = express();

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: morganStream })); // HTTP request logging

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  sendError(
    res,
    'Not Found',
    [{ field: 'url', message: `Route ${req.originalUrl} not found` }],
    404
  );
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  logger.error('Unhandled error:', err);

  const errors: Error[] = [
    {
      field: 'server',
      message:
        process.env.ENVIRONMENT === 'production'
          ? 'An unexpected error occurred'
          : err.message || 'Unknown error',
    },
  ];

  sendError(res, 'Server Error', errors, 500);
});

export default app;
