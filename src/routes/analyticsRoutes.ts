import express from 'express';
import { getSalesHeatmap, getInventoryForecast, getRepairPredictive, getAnalyticsSummary, getProductAffinity } from '../services/analyticsEngine.js';
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

// GET /api/analytics/summary (General Overview)
router.get('/summary', authenticate, async (req, res) => {
  try {
    const data = await getAnalyticsSummary();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Summary failed' });
  }
});

// GET /api/analytics/affinity (permission 294)
router.get('/affinity', authenticate, requirePermission(294), async (req, res) => {
  try {
    const data = await getProductAffinity();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Affinity analysis failed' });
  }
});

export default router;
