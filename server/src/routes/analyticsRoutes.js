import { Router } from 'express';
import { getAdminInsights, getOverview } from '../controllers/analyticsController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/overview', asyncHandler(getOverview));
router.get('/admin/insights', requireAuth, requireAdmin, asyncHandler(getAdminInsights));

export default router;
