import { Router } from 'express';
import { customerPortalController } from '../controllers/customerPortalController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/orders', requirePermission(326), customerPortalController.getOrders);
router.get('/repair-status', requirePermission(326), customerPortalController.getRepairStatus);
router.get('/loyalty-points', requirePermission(326), customerPortalController.getLoyaltyPoints);

export default router;
