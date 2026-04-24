import { Router } from 'express';
import { commissionController } from '../controllers/commissionController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/rules', requirePermission(330), commissionController.createRule);
router.get('/rules', requirePermission(330), commissionController.getRules);
router.put('/rules/:id', requirePermission(330), commissionController.updateRule);
router.delete('/rules/:id', requirePermission(330), commissionController.deleteRule);

router.get('/transactions', requirePermission(329), commissionController.getTransactions);
router.post('/calculate', requirePermission(330), commissionController.calculateCommission);
router.patch('/transactions/:id/pay', requirePermission(330), commissionController.payCommission);
router.get('/leaderboard', requirePermission(188), commissionController.getLeaderboard);

export default router;
