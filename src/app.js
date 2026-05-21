// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve public directory
app.use(express.static(path.join(__dirname, '../public')));

// Security middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving images cross-origin

// CORS configuration (allow dev origin and optional production origin env var)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(morgan('dev'));

// Rate limiting – 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Mount API routes
app.use('/api', routes);

// Global error handler (must be after routes)
app.use(errorHandler);

export default app;
