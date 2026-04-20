import express from 'express';
import { securityController } from '../controllers/securityController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All security routes require authentication
router.use(authenticate);

router.get('/terminal-pin', securityController.getTerminalPin);
router.post('/terminal-pin', securityController.updateTerminalPin);

export default router;
