import { Router } from 'express';
import { storeController } from '../controllers/storeController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(199), storeController.create);
router.get('/profile', storeController.getProfile);
router.put('/profile', requirePermission(199), storeController.updateProfile);
router.get('/', storeController.getAll);
router.get('/:id', storeController.getById);
router.put('/:id', requirePermission(199), storeController.update);
router.delete('/:id', requirePermission(199), storeController.delete);

export default router;
