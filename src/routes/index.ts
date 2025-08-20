import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import userRoutes from './user.routes.js';
import attendeeRoutes from './attendee.routes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/users', userRoutes);
router.use('/attendee', attendeeRoutes);

export default router;
