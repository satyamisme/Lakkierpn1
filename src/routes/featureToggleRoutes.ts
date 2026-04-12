import express from 'express';
import FeatureToggle from '../models/FeatureToggle.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET / (Super Admin only - ID 185)
router.get('/', authenticate, requirePermission(185), async (req, res) => {
  try {
    const toggles = await FeatureToggle.find().sort({ featureId: 1 });
    res.json(toggles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feature toggles' });
  }
});

// PUT /:featureId (Super Admin only)
router.put('/:featureId', authenticate, requirePermission(185), async (req, res) => {
  try {
    const { enabledRoles } = req.body;
    const toggle = await FeatureToggle.findOneAndUpdate(
      { featureId: req.params.featureId },
      { enabledRoles },
      { new: true, upsert: true }
    );
    res.json(toggle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update feature toggle' });
  }
});

export default router;
