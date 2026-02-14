import express from 'express';
import { getStats, getTaskDistribution, getPerformance, getActivityTimeline } from '../controllers/analyticsController.js';
import { protect, checkOrgAccess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(checkOrgAccess);

router.get('/stats', getStats);
router.get('/distribution', getTaskDistribution);
router.get('/performance', getPerformance);
router.get('/activity', getActivityTimeline);

export default router;