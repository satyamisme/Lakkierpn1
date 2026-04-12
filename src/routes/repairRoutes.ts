import express from 'express';
import Repair from '../models/Repair.js';
import { sendTemplate } from '../services/whatsappService.js';
import { scheduleReviewRequest } from '../services/marketingScheduler.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST / (intake) - requires 61
router.post('/', authenticate, requirePermission(61), async (req, res) => {
  try {
    const ticketId = 'RP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const repair = new Repair({ ...req.body, ticketId });
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
    const repairs = await Repair.find(query).sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
});

// PATCH /:id/status - requires 67
router.patch('/:id/status', authenticate, requirePermission(67), async (req, res) => {
  try {
    const { status } = req.body;
    const repair = await Repair.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (status === 'ready' && repair?.customerPhone) {
      // ID 74: WhatsApp Status Bot
      await sendTemplate(repair.customerPhone, 'repair_ready', {
        customerName: repair.customerName,
        ticketId: repair.ticketId,
        deviceModel: repair.phoneModel,
        amount: repair.estimatedQuote.toString()
      });
    }

    if (status === 'picked_up' && repair) {
      // ID 254: Review Solicitor
      await scheduleReviewRequest(repair._id);
    }

    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH /:id/qc - requires 71
router.patch('/:id/qc', authenticate, requirePermission(71), async (req, res) => {
  try {
    const { qcChecklist } = req.body;
    // checklist can be array or object, let's normalize
    const checklistData = Array.isArray(qcChecklist) ? qcChecklist : Object.values(qcChecklist);
    
    const repair = await Repair.findByIdAndUpdate(req.params.id, { 
      qcChecklist: checklistData, 
      status: 'ready',
      completedAt: new Date()
    }, { new: true });
    
    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: 'QC failed' });
  }
});

// POST /:id/whatsapp (triggers status alert, ID 74)
router.post('/:id/whatsapp', authenticate, requirePermission(74), async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair || !repair.customerPhone) return res.status(404).json({ error: 'Repair not found or no phone' });
    
    // ID 74: WhatsApp Status Bot
    await sendTemplate(repair.customerPhone, 'repair_ready', {
      customerName: repair.customerName,
      ticketId: repair.ticketId,
      deviceModel: repair.phoneModel,
      amount: repair.estimatedQuote.toString()
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'WhatsApp alert failed' });
  }
});

export default router;
