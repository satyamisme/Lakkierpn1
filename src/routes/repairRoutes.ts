import express from 'express';
import Repair from '../models/Repair.js';
import { sendTemplate } from '../services/whatsappService.js';
import { scheduleReviewRequest } from '../services/marketingScheduler.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST / (intake) - requires 61
router.post('/', authenticate, requirePermission(61), async (req, res) => {
  try {
    const count = await Repair.countDocuments();
    const repairNumber = `REP-${(count + 1).toString().padStart(6, '0')}`;
    const repair = new Repair({ ...req.body, repairNumber });
    await repair.save();
    res.status(201).json(repair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create repair job' });
  }
});

// GET / (filter by technician if role=technician)
router.get('/', authenticate, requirePermission(61), async (req, res) => {
  try {
    const query: any = {};
    if ((req as any).user.role === 'technician') {
      query.technicianId = (req as any).user.id;
    }
    const repairs = await Repair.find(query)
      .populate('customerId')
      .populate('technicianId')
      .sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
});

// PATCH /:id (generic update for status etc)
router.patch('/:id', authenticate, requirePermission(67), async (req, res) => {
  try {
    const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('customerId');
    
    if (req.body.status === 'ready' && repair?.customerId?.phone) {
      // ID 74: WhatsApp Status Bot
      await sendTemplate(repair.customerId.phone, 'repair_ready', {
        customerName: repair.customerId.name,
        ticketId: repair.repairNumber,
        deviceModel: `${repair.deviceInfo.brand} ${repair.deviceInfo.model}`,
        amount: repair.quotedPrice.toString()
      });
    }

    if (req.body.status === 'collected' && repair) {
      // ID 254: Review Solicitor
      await scheduleReviewRequest(repair._id);
    }

    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update repair' });
  }
});

// GET /:id
router.get('/:id', authenticate, requirePermission(61), async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id)
      .populate('customerId')
      .populate('technicianId')
      .populate('partsConsumed.productId');
    if (!repair) return res.status(404).json({ error: 'Repair not found' });
    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repair details' });
  }
});

export default router;
