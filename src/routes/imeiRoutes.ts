import express from 'express';
import Imei from '../models/Imei.js';
import ImeiReservation from '../models/ImeiReservation.js';
import { serialController } from '../controllers/serialController.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';
import { executeWithBreaker } from '../services/circuitBreakerService.js';

const router = express.Router();

router.use(authenticate);

// GET / (List all serials/IMEIs) - ID 192 (Inventory Management)
router.get('/', requirePermission(121), serialController.getAll);

// PUT /:id (Update serial/IMEI) 
router.put('/:id', requirePermission(122), serialController.update);

// DELETE /:id (Soft delete serial/IMEI)
router.delete('/:id', requirePermission(122), serialController.delete);

// POST /validate (Validate formatted IMEI/Serial)
router.post('/validate', requirePermission(122), serialController.validate);

// GET /check/:imei (real-time validation for POS)
router.get('/check/:imei', async (req, res) => {
  try {
    const { imei } = req.params;
    const imeiDoc = await Imei.findOne({ identifier: imei, deletedAt: null });
    
    if (!imeiDoc) {
      return res.json({ exists: false, available: false, error: 'IMEI not found' });
    }
    
    if (imeiDoc.status !== 'in_stock') {
      return res.json({ exists: true, available: false, error: `IMEI status is ${imeiDoc.status}` });
    }
    
    // Check if reserved
    const reservation = await ImeiReservation.findOne({ imei });
    if (reservation) {
      return res.json({ exists: true, available: false, error: 'IMEI is reserved by another registry session' });
    }
    
    res.json({ exists: true, available: true, productId: imeiDoc.productId });
  } catch (error) {
    res.status(500).json({ error: 'IMEI analytical check failed' });
  }
});

// POST /reserve (ID 1B: IMEI reservation)
router.post('/reserve', async (req, res) => {
  try {
    const { imei, productId, cartSessionId } = req.body;
    
    // Check if already reserved by someone else
    const existing = await ImeiReservation.findOne({ imei });
    if (existing && existing.cartSessionId !== cartSessionId) {
      return res.status(409).json({ error: 'IMEI is already reserved by another session' });
    }
    
    // Check if in stock
    const imeiDoc = await Imei.findOne({ identifier: imei, productId, status: 'in_stock', deletedAt: null });
    if (!imeiDoc) {
      return res.status(400).json({ error: 'IMEI not available in stock' });
    }

    const reservation = await ImeiReservation.findOneAndUpdate(
      { imei },
      { productId, cartSessionId, createdAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reserve IMEI vector' });
  }
});

// POST /check (validate IMEI not sold, not blacklisted)
router.post('/check', requirePermission(5), async (req, res) => {
  try {
    const { imei } = req.body;
    const imeiDoc = await Imei.findOne({ identifier: imei, deletedAt: null });
    
    if (!imeiDoc) {
      return res.status(404).json({ error: 'IMEI identifier not found in registry' });
    }
    
    if (imeiDoc.status === 'sold') {
      return res.status(400).json({ error: 'IMEI already marked as sold' });
    }
    
    // ID 103: IMEI Verification API (GSMA Blacklist)
    let isBlacklisted = false;
    const gsmaKey = process.env.GSMA_API_KEY;

    if (gsmaKey) {
      try {
        await executeWithBreaker('GSMA_API', async () => {
          const response = await fetch('https://api.imeicheck.com/v1/checks', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${gsmaKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              imei: imei,
              service: 'gsma_blacklist'
            })
          });
          if (response.ok) {
            const data = await response.json();
            isBlacklisted = data.status === 'blacklisted' || data.blacklist_status === 'Blacklisted';
          } else {
            throw new Error('GSMA API returned logical error');
          }
        });
      } catch (e) {
        console.error("IMEI Check API Vector Error");
        return res.status(503).json({ error: 'External verification service offline' });
      }
    } else {
      console.warn('GSMA_API_KEY missing. Verification vector bypassed.');
    }

    if (isBlacklisted) {
      return res.status(403).json({ error: 'IMEI blacklisted by GSMA authority' });
    }
    
    res.json({ success: true, productId: imeiDoc.productId });
  } catch (error) {
    res.status(500).json({ error: 'IMEI integrity check failed' });
  }
});

// POST /sell (mark as sold)
router.post('/sell', requirePermission(1), async (req, res) => {
  try {
    const { imei, customerId } = req.body;
    const imeiDoc = await Imei.findOneAndUpdate(
      { identifier: imei, status: 'in_stock', deletedAt: null },
      { status: 'sold', soldAt: new Date(), customerId },
      { new: true }
    );
    
    if (!imeiDoc) {
      return res.status(400).json({ error: 'IMEI identifier not available for transaction' });
    }
    
    res.json(imeiDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to commit IMEI sale' });
  }
});

// GET /history/:imei (return all past sales) - requires permission 47
router.get('/history/:imei', requirePermission(47), async (req, res) => {
  try {
    const { imei } = req.params;
    const history = await Imei.find({ identifier: imei }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve telemetry history' });
  }
});

export default router;
