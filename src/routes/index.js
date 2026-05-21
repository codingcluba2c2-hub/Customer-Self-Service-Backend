// src/routes/index.js
import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import profileRoutes from '../modules/profile/profile.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

export default router;
