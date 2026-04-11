import { Router } from 'express';
import { hardwareController } from '../controllers/hardwareController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(325), hardwareController.create);
router.get('/', requirePermission(325), hardwareController.getAll);
router.get('/:id', requirePermission(325), hardwareController.getById);
router.put('/:id', requirePermission(325), hardwareController.update);
router.delete('/:id', requirePermission(325), hardwareController.delete);
router.post('/:id/test', requirePermission(325), hardwareController.testDevice);

export default router;
