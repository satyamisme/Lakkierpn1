import { Router } from 'express';
import { bulkController } from '../controllers/bulkController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/jobs', requirePermission(322), bulkController.createJob);
router.get('/jobs', requirePermission(322), bulkController.getAllJobs);
router.get('/jobs/:id', requirePermission(322), bulkController.getJobById);
router.patch('/jobs/:id/progress', requirePermission(322), bulkController.updateJobProgress);

export default router;
