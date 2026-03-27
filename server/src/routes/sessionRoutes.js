import { Router } from 'express';
import {
  addTelemetry,
  clearAllSessions,
  createDemoSession,
  createSession,
  deleteSession,
  getSessionDetails
} from '../controllers/sessionController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', asyncHandler(createSession));
router.post('/demo', asyncHandler(createDemoSession));
router.delete('/', asyncHandler(clearAllSessions));
router.get('/:id', asyncHandler(getSessionDetails));
router.post('/:id/telemetry', asyncHandler(addTelemetry));
router.delete('/:id', asyncHandler(deleteSession));

export default router;
