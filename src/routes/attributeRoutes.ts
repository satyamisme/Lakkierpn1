import express from 'express';
import { attributeController } from '../controllers/attributeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/attributes/suggest?field=brand
router.get('/suggest', authenticate, attributeController.getSuggestions);

export default router;
