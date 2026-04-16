import { Router } from 'express';
import { auditController } from '../controllers/auditController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// GET /api/audit/logs
router.get('/logs', requirePermission(181), auditController.getLogs);

// GET /api/audit/logs/export
router.get('/logs/export', requirePermission(181), auditController.exportLogs);

export default router;
