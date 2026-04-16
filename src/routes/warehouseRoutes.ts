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

// Picking & Packing (ID 124)
router.get('/picking', requirePermission(320), warehouseController.getPickingLists);
router.post('/picking/:id/complete', requirePermission(320), warehouseController.completePicking);
router.get('/packing', requirePermission(320), warehouseController.getPackingLists);
router.post('/packing/:id/complete', requirePermission(320), warehouseController.completePacking);

export default router;
