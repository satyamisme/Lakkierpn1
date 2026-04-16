import express from 'express';
import { inventoryController } from '../controllers/inventoryController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /low-stock (ID 125)
router.get('/low-stock', authenticate, requirePermission(125), inventoryController.getLowStock);

// POST /transfers (request, requires 122)
router.post('/transfers', authenticate, requirePermission(122), inventoryController.createTransfer);

// PATCH /transfers/:id/status (requires 123/124)
router.patch('/transfers/:id/status', authenticate, requirePermission(123), inventoryController.updateTransferStatus);

// GET /transfers (requires 124)
router.get('/transfers', authenticate, requirePermission(124), inventoryController.getTransferList);

// GET /global-stock (ID 121)
router.get('/global-stock', authenticate, requirePermission(121), inventoryController.getGlobalStock);

// GET /node-distribution (ID 192)
router.get('/node-distribution', authenticate, requirePermission(192), inventoryController.getNodeDistribution);

// POST /adjust (ID 132)
router.post('/adjust', authenticate, requirePermission(132), inventoryController.adjustStock);

// POST /batch-intake (ID 129)
router.post('/batch-intake', authenticate, requirePermission(122), inventoryController.batchIntake);

// GET /valuation (ID 141)
router.get('/valuation', authenticate, requirePermission(141), inventoryController.getFifoValuation);

// POST /bulk-reorder (ID 192)
router.post('/bulk-reorder', authenticate, requirePermission(192), inventoryController.bulkReorder);

// Cycle Count (ID 318)
router.post('/cycle-count/start', authenticate, requirePermission(318), inventoryController.startCycleCount);
router.post('/cycle-count/submit', authenticate, requirePermission(318), inventoryController.submitCycleCount);
router.get('/cycle-count/pending', authenticate, requirePermission(318), inventoryController.getPendingCycleCounts);
router.get('/cycle-count/discrepancy/:sessionId', authenticate, requirePermission(318), inventoryController.getCycleCountDiscrepancy);
router.post('/cycle-count/resolve', authenticate, requirePermission(318), inventoryController.resolveCycleCount);

// GET /available-imeis
router.get('/available-imeis', authenticate, inventoryController.getAvailableImeis);

// Purchase Orders
router.get('/po', authenticate, requirePermission(122), inventoryController.getPurchaseOrders);
router.patch('/po/:id/status', authenticate, requirePermission(122), inventoryController.updatePurchaseOrderStatus);

// Bin Locations
router.get('/bins', authenticate, requirePermission(156), inventoryController.getBinLocations);
router.post('/bins', authenticate, requirePermission(156), inventoryController.createBinLocation);
router.patch('/bins/:id', authenticate, requirePermission(156), inventoryController.updateBinLocation);

export default router;
