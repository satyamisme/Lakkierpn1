import { Router } from 'express';
import { marketingController } from '../controllers/marketingController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(338), marketingController.create);
router.get('/', requirePermission(338), marketingController.getAll);
router.get('/:id', requirePermission(338), marketingController.getById);
router.put('/:id', requirePermission(338), marketingController.update);
router.delete('/:id', requirePermission(338), marketingController.delete);
router.post('/:id/send', requirePermission(338), marketingController.sendCampaign);

export default router;
