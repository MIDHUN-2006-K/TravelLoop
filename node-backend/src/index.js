import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import cityRoutes from './routes/cities.js';
import activityRoutes from './routes/activities.js';
import expenseRoutes from './routes/expenses.js';
import packingRoutes from './routes/packing.js';
import notesRoutes from './routes/notes.js';
import sharingRoutes from './routes/sharing.js';
import savedRoutes from './routes/saved.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Core routes
app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);
app.use('/cities', cityRoutes);
app.use('/activities', activityRoutes);

// Feature sub-routes (mergeParams: true in routers lets them access :tripId)
app.use('/trips/:tripId/expenses', expenseRoutes);
app.use('/trips/:tripId/packing', packingRoutes);
app.use('/trips/:tripId/notes', notesRoutes);

// Sharing & saved destinations
app.use('/sharing', sharingRoutes);
app.use('/shared', sharingRoutes);
app.use('/saved-destinations', savedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message || 'Validation error',
      error: err.details || err
    });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
