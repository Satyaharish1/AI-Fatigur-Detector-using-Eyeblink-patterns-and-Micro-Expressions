import { Router } from 'express';
import { saveMonitorPdf } from '../controllers/reportController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/monitor-pdf', asyncHandler(saveMonitorPdf));

export default router;
