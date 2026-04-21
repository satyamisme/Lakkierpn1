import express from 'express';
import { attributeController } from '../controllers/attributeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/attributes/suggestions?field=brand
router.get('/suggestions', authenticate, attributeController.getAttributeSuggestions);

export default router;
