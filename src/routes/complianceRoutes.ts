import { Router } from 'express';
import { complianceController } from '../controllers/complianceController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/logs', requirePermission(331), complianceController.createLog);
router.get('/logs', requirePermission(331), complianceController.getLogs);
router.get('/logs/:id', requirePermission(331), complianceController.getLogById);
router.post('/zreport', requirePermission(333), complianceController.generateZReport);
router.get('/tax-export', requirePermission(332), complianceController.exportTaxReport);

export default router;
