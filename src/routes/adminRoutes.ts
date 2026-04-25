import { Router } from 'express';
import { seedController } from '../controllers/seedController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// In a real production app, this would be highly protected or removed
router.post('/seed', authenticate, seedController.seedAll);

export default router;
