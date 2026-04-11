import { Router } from 'express';
import { giftCardController } from '../controllers/giftCardController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission(336), giftCardController.create);
router.get('/', requirePermission(336), giftCardController.getAll);
router.get('/:id', requirePermission(336), giftCardController.getById);
router.post('/:code/redeem', requirePermission(336), giftCardController.redeem);
router.patch('/:id/void', requirePermission(336), giftCardController.void);

export default router;
