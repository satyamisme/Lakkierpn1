import { Router } from 'express';
import { supplierPortalController } from '../controllers/supplierPortalController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/orders', requirePermission(321), supplierPortalController.getOrders);
router.patch('/orders/:id/status', requirePermission(344), supplierPortalController.updateOrderStatus);
router.get('/inventory-alerts', requirePermission(321), supplierPortalController.getInventoryAlerts);

export default router;
