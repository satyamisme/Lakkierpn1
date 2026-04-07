import { Router } from 'express';
import { rmaController } from '../controllers/rmaController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(335), rmaController.create);
router.get('/', requirePermission(335), rmaController.getAll);
router.get('/:id', requirePermission(335), rmaController.getById);
router.patch('/:id/status', requirePermission(335), rmaController.updateStatus);
router.delete('/:id', requirePermission(335), rmaController.delete);

export default router;
