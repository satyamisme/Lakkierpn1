import { Router } from 'express';
import { imeiTimelineController } from '../controllers/imeiTimelineController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/:imei', requirePermission(327), imeiTimelineController.getHistory);
router.post('/event', requirePermission(327), imeiTimelineController.addEvent);

export default router;
