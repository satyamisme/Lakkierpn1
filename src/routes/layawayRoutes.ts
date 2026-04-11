import { Router } from 'express';
import { layawayController } from '../controllers/layawayController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(337), layawayController.create);
router.get('/', requirePermission(337), layawayController.getAll);
router.get('/:id', requirePermission(337), layawayController.getById);
router.post('/:id/payment', requirePermission(337), layawayController.addPayment);
router.patch('/:id/cancel', requirePermission(337), layawayController.cancel);

export default router;
