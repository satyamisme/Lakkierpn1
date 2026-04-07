import { Router } from 'express';
import { customerGroupController } from '../controllers/customerGroupController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(340), customerGroupController.create);
router.get('/', requirePermission(340), customerGroupController.getAll);
router.get('/:id', requirePermission(340), customerGroupController.getById);
router.put('/:id', requirePermission(340), customerGroupController.update);
router.delete('/:id', requirePermission(340), customerGroupController.delete);
router.post('/:id/customers', requirePermission(340), customerGroupController.addCustomer);

export default router;
