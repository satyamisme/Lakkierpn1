import express from 'express';
import ShiftHandover from '../models/ShiftHandover.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/shift/handover (requires permission 226)
router.post('/handover', authenticate, requirePermission(226), async (req, res) => {
  try {
    const handover = new ShiftHandover({
      ...req.body,
      fromUserId: (req as any).user.id,
      createdAt: new Date()
    });
    await handover.save();
    res.status(201).json(handover);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log shift handover' });
  }
});

// GET /api/shift/history (permission 226)
router.get('/history', authenticate, requirePermission(226), async (req, res) => {
  try {
    const history = await ShiftHandover.find()
      .populate('fromUserId', 'name')
      .populate('toUserId', 'name')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shift history' });
  }
});

export default router;
