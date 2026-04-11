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

// POST /adjust (ID 132)
router.post('/adjust', authenticate, requirePermission(132), inventoryController.adjustStock);

// GET /valuation (ID 141)
router.get('/valuation', authenticate, requirePermission(141), inventoryController.getFifoValuation);

export default router;
