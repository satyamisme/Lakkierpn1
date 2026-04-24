import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/search', requirePermission(17), customerController.search);
router.post('/', requirePermission(17), customerController.create);
router.get('/', requirePermission(17), customerController.getAll);
router.get('/:id/summary', requirePermission(17), customerController.getCustomerSummary);
router.get('/:id', requirePermission(17), customerController.getById);
router.put('/:id', requirePermission(17), customerController.update);
router.delete('/:id', requirePermission(231), customerController.delete);

export default router;
