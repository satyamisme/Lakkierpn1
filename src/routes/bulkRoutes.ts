import { Router } from 'express';
import { bulkController } from '../controllers/bulkController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/jobs', requirePermission(322), bulkController.createJob);
router.get('/jobs', requirePermission(322), bulkController.getAllJobs);
router.get('/jobs/:id', requirePermission(322), bulkController.getJobById);
router.patch('/jobs/:id/progress', requirePermission(322), bulkController.updateJobProgress);
router.post('/label-print', requirePermission(322), bulkController.bulkLabelPrint);

export default router;
