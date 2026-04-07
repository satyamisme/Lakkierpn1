import { Router } from 'express';
import { qualityControlController } from '../controllers/qualityControlController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(334), qualityControlController.create);
router.get('/', requirePermission(334), qualityControlController.getAll);
router.get('/:id', requirePermission(334), qualityControlController.getById);
router.put('/:id', requirePermission(334), qualityControlController.update);
router.delete('/:id', requirePermission(334), qualityControlController.delete);

export default router;
