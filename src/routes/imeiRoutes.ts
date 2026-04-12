import express from 'express';
import Imei from '../models/Imei.js';
import ImeiReservation from '../models/ImeiReservation.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';
import { executeWithBreaker } from '../services/circuitBreakerService.js';

const router = express.Router();

// GET /check/:imei (real-time validation for POS)
router.get('/check/:imei', authenticate, async (req, res) => {
  try {
    const { imei } = req.params;
    const imeiDoc = await Imei.findOne({ imei });
    
    if (!imeiDoc) {
      return res.json({ exists: false, available: false, error: 'IMEI not found' });
    }
    
    if (imeiDoc.status === 'sold') {
      return res.json({ exists: true, available: false, error: 'IMEI already sold' });
    }

    // Check if reserved
    const reservation = await ImeiReservation.findOne({ imei });
    if (reservation) {
      return res.json({ exists: true, available: false, error: 'IMEI is reserved' });
    }
    
    res.json({ exists: true, available: true, productId: imeiDoc.productId });
  } catch (error) {
    res.status(500).json({ error: 'IMEI check failed' });
  }
});

// POST /reserve (ID 1B: IMEI reservation)
router.post('/reserve', authenticate, async (req, res) => {
  try {
    const { imei, productId, cartSessionId } = req.body;
    
    // Check if already reserved by someone else
    const existing = await ImeiReservation.findOne({ imei });
    if (existing && existing.cartSessionId !== cartSessionId) {
      return res.status(409).json({ error: 'IMEI is already reserved by another session' });
    }
    
    // Check if in stock
    const imeiDoc = await Imei.findOne({ imei, productId, status: 'in_stock' });
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
    res.status(500).json({ error: 'Failed to reserve IMEI' });
  }
});

// POST /check (validate IMEI not sold, not blacklisted)
router.post('/check', authenticate, requirePermission(5), async (req, res) => {
  try {
    const { imei } = req.body;
    const imeiDoc = await Imei.findOne({ imei });
    
    if (!imeiDoc) {
      return res.status(404).json({ error: 'IMEI not found in system' });
    }
    
    if (imeiDoc.status === 'sold') {
      return res.status(400).json({ error: 'IMEI already sold' });
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
            throw new Error('GSMA API returned error');
          }
        });
      } catch (e) {
        console.error("IMEI Check API Error, falling back to local check");
        isBlacklisted = imei.startsWith('999');
      }
    } else {
      // Fallback for demo/dev if no key (ID 103 Fallback)
      console.warn('GSMA_API_KEY missing. Using mock blacklist logic.');
      isBlacklisted = imei.startsWith('999'); // Mock blacklist for IMEIs starting with 999
    }

    if (isBlacklisted) {
      return res.status(403).json({ error: 'IMEI is blacklisted by GSMA' });
    }
    
    res.json({ success: true, productId: imeiDoc.productId });
  } catch (error) {
    res.status(500).json({ error: 'IMEI check failed' });
  }
});

// POST /sell (mark as sold)
router.post('/sell', authenticate, requirePermission(1), async (req, res) => {
  try {
    const { imei, customerId } = req.body;
    const imeiDoc = await Imei.findOneAndUpdate(
      { imei, status: 'in_stock' },
      { status: 'sold', soldAt: new Date(), customerId },
      { new: true }
    );
    
    if (!imeiDoc) {
      return res.status(400).json({ error: 'IMEI not available for sale' });
    }
    
    res.json(imeiDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark IMEI as sold' });
  }
});

// GET /history/:imei (return all past sales) - requires permission 47
router.get('/history/:imei', authenticate, requirePermission(47), async (req, res) => {
  try {
    const { imei } = req.params;
    const history = await Imei.find({ imei }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IMEI history' });
  }
});

export default router;
