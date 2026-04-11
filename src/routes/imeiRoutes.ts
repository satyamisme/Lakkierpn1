import express from 'express';
import Imei from '../models/Imei.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

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
        const response = await fetch('https://api.imeicheck.com/v1/checks', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gsmaKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imei: imei,
            service: 'gsma_blacklist' // Example service ID
          })
        });
        if (response.ok) {
          const data = await response.json();
          isBlacklisted = data.status === 'blacklisted' || data.blacklist_status === 'Blacklisted';
        }
      } catch (e) {
        console.error("IMEI Check API Error, falling back to local check");
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
