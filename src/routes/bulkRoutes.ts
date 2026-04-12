import { Router } from 'express';
import { bulkController } from '../controllers/bulkController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/jobs', requirePermission(322), bulkController.createJob);
router.post('/price-update', requirePermission(322), bulkController.createJob);
router.post('/stock-adjustment', requirePermission(322), bulkController.createJob);
router.post('/customer-import', requirePermission(322), bulkController.createJob);
router.post('/product-import', requirePermission(322), bulkController.createJob);
router.post('/scanner', requirePermission(322), bulkController.createJob);
router.post('/products', requirePermission(137), bulkController.importProductCSV);
router.get('/jobs', requirePermission(322), bulkController.getAllJobs);
router.get('/jobs/:id', requirePermission(322), bulkController.getJobById);
router.delete('/jobs/:id', requirePermission(322), bulkController.deleteJob);
router.patch('/jobs/:id/progress', requirePermission(322), bulkController.updateJobProgress);
router.post('/label-print', requirePermission(322), bulkController.bulkLabelPrint);

export default router;
