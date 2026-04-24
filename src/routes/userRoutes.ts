import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.put('/profile', userController.updateProfile);
router.post('/', requirePermission(195), userController.create);
router.get('/', requirePermission(195), userController.getAll);
router.get('/:id', requirePermission(195), userController.getById);
router.put('/:id', requirePermission(195), userController.update);
router.delete('/:id', requirePermission(195), userController.delete);
router.post('/:id/reset-password', requirePermission(195), userController.resetPassword);

export default router;
