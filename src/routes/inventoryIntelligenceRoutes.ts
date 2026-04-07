import { Router } from 'express';
import { inventoryIntelligenceController } from '../controllers/inventoryIntelligenceController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/forecast/:productId', requirePermission(328), inventoryIntelligenceController.getForecast);
router.post('/forecast/generate', requirePermission(328), inventoryIntelligenceController.generateForecast);
router.get('/optimization', requirePermission(328), inventoryIntelligenceController.getStockOptimization);

export default router;
