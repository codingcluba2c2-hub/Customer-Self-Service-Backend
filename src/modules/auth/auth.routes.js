// src/modules/auth/auth.routes.js
import express from 'express';
import * as authController from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Health check (no auth)
router.get('/health', authController.healthCheck);

// Auth endpoints
router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authController.updatePassword);

export default router;
