import { Router } from 'express';
import { omnichannelController } from '../controllers/omnichannelController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Webhook is public (usually verified via signature in controller)
router.post('/webhook/:source', omnichannelController.handleWebhook);

router.use(authenticate);

router.post('/sync/shopify', requirePermission(324), omnichannelController.syncShopifyOrders);
router.post('/sync/woocommerce', requirePermission(324), omnichannelController.syncWooCommerceOrders);
router.post('/sync/:source/products', requirePermission(324), omnichannelController.syncProducts);
router.post('/sync/:source/inventory', requirePermission(324), omnichannelController.syncInventory);
router.get('/orders', requirePermission(324), omnichannelController.getAllOrders);

export default router;
