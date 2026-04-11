import { Router } from 'express';
import { warehouseController } from '../controllers/warehouseController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/tasks', requirePermission(320), warehouseController.createTask);
router.get('/tasks', requirePermission(320), warehouseController.getAllTasks);
router.get('/tasks/:id', requirePermission(320), warehouseController.getTaskById);
router.patch('/tasks/:id/status', requirePermission(320), warehouseController.updateTaskStatus);
router.post('/tasks/:id/assign', requirePermission(320), warehouseController.assignTask);

export default router;
