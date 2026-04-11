import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);

router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/verify', authController.verify2FA);
router.post('/2fa/disable', authenticate, authController.disable2FA);

export default router;
