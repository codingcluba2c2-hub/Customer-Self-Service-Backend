import express from 'express';
import { protect } from '../../middleware/auth.js';
import { getProfile, updateProfile, uploadAvatar, uploadAvatarMiddleware } from './profile.controller.js';
import { updateProfileValidation } from './profile.validation.js';
import { validateRequest } from '../../middleware/validateRequest.js';

const router = express.Router();

router.use(protect); // All profile routes require authentication

router.get('/me', getProfile);
router.post('/me/avatar', uploadAvatarMiddleware, uploadAvatar);
router.put('/me', uploadAvatarMiddleware, updateProfileValidation, validateRequest, updateProfile);

export default router;
