import express from 'express';
import { isLoggedIn, requireAdmin } from '../middleware/auth.middleware.js';
import {
    generateUnitAccessCodes,
    redeemUnitAccessCode,
    listUnitAccessCodes,
    deleteUnitAccessCode,
    bulkDeleteUnitAccessCodes,
    checkUnitAccess
} from '../controllers/unitAccess.controller.js';

const router = express.Router();

// Admin routes (require admin authentication)
router.post('/admin/codes', isLoggedIn, requireAdmin, generateUnitAccessCodes);
router.get('/admin/codes', isLoggedIn, requireAdmin, listUnitAccessCodes);
router.delete('/admin/codes/:id', isLoggedIn, requireAdmin, deleteUnitAccessCode);
router.delete('/admin/codes', isLoggedIn, requireAdmin, bulkDeleteUnitAccessCodes);

// User routes
router.post('/redeem', isLoggedIn, redeemUnitAccessCode);
router.get('/check/:courseId/:unitId', isLoggedIn, checkUnitAccess);

export default router;
