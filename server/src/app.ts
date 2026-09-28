import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

import authRoutes from './modules/auth/auth.routes';
import courseRoutes from './modules/courses/course.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  if (err.name === 'ApiError') {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Internal Server Error'
    });
  }
});

export default app;
