import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create-intent', authenticate, paymentController.createPaymentIntent);

export default router;
