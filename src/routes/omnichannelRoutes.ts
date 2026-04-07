import { Router } from 'express';
import { omnichannelController } from '../controllers/omnichannelController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

// Webhook is public (usually verified via signature in controller)
router.post('/webhook/:source', omnichannelController.handleWebhook);

router.use(authenticate);

router.post('/orders', requirePermission(324), omnichannelController.createOrder);
router.get('/orders', requirePermission(324), omnichannelController.getAllOrders);
router.get('/orders/:id', requirePermission(324), omnichannelController.getOrderById);
router.patch('/orders/:id/status', requirePermission(324), omnichannelController.updateOrderStatus);

export default router;
