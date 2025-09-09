import { Router } from 'express';
import { isLoggedIn, requireAdmin } from '../middleware/auth.middleware.js';
import { getMySchedule, upsertMySchedule, adminListSchedules, adminSetStatus } from '../controllers/liveSchedule.controller.js';

const router = Router();

// User routes
router.get('/me', isLoggedIn, getMySchedule);
router.put('/me', isLoggedIn, upsertMySchedule);

// Admin routes
router.get('/', isLoggedIn, requireAdmin, adminListSchedules);
router.patch('/:id/status', isLoggedIn, requireAdmin, adminSetStatus);

export default router;


