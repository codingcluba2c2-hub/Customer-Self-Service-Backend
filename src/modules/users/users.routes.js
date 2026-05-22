import express from 'express';
import { protect, restrictTo } from '../../middleware/auth.js';
import * as usersController from './users.controller.js';

const router = express.Router();

// All routes require authentication and Tenant Admin access
router.use(protect);
// Allow ops-admin to also manage users if needed, but per prompt "Tenant Admin manages employees"
router.use(restrictTo('tenant-admin', 'ops-admin'));

router.get('/analytics', usersController.getAnalytics);
router.get('/', usersController.getUsers);
router.post('/', usersController.createUser);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.put('/:id/suspend', usersController.suspendUser);
router.put('/:id/activate', usersController.activateUser);

export default router;
