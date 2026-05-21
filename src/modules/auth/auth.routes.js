// src/modules/auth/auth.routes.js
import express from 'express';
import { register, login, getMe, logout, refreshToken, healthCheck } from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Health check (no auth)
router.get('/health', healthCheck);

// Auth endpoints
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);

export default router;
