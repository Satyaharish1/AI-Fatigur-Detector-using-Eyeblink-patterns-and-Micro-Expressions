import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(clientOrigin) {
  const app = express();

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Cognitive fatigue detector API is running'
    });
  });

  app.use('/api/sessions', sessionRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use(errorHandler);

  return app;
}
