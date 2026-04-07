import express from 'express';
import { getSalesHeatmap, getInventoryForecast, getRepairPredictive } from '../services/analyticsEngine.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/analytics/heatmap (requires permission 294)
router.get('/heatmap', authenticate, requirePermission(294), async (req, res) => {
  try {
    const data = await getSalesHeatmap();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Heatmap failed' });
  }
});

// GET /api/analytics/forecast (permission 295)
router.get('/forecast', authenticate, requirePermission(295), async (req, res) => {
  try {
    const data = await getInventoryForecast();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Forecast failed' });
  }
});

// GET /api/analytics/predictive (permission 296)
router.get('/predictive', authenticate, requirePermission(296), async (req, res) => {
  try {
    const data = await getRepairPredictive();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Predictive failed' });
  }
});

export default router;
