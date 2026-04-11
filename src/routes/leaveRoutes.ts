import { Router } from 'express';
import { leaveController } from '../controllers/leaveController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(207), leaveController.create);
router.get('/', requirePermission(207), leaveController.getAll);
router.put('/:id/approve', requirePermission(207), leaveController.approve);

export default router;
