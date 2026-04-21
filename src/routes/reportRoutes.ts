import express from 'express';
import Sale from '../models/Sale.js';
import Repair from '../models/Repair.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import PDFDocument from 'pdfkit';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /z-report (ID 190) – aggregates sales, payments, expenses for current day
router.get('/z-report', authenticate, requirePermission(190), async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const sales = await Sale.find({ createdAt: { $gte: startOfDay }, status: 'completed' });
    const repairs = await Repair.find({ completedAt: { $gte: startOfDay }, status: 'ready' });
    
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalRepairs = repairs.reduce((sum, r) => sum + r.estimatedQuote, 0);
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Z-Report.pdf');
    
    doc.pipe(res);
    doc.fontSize(25).text('LAKKI PHONE ERP - Z-REPORT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Total Sales: ${totalSales.toFixed(3)} KD`);
    doc.text(`Total Repairs: ${totalRepairs.toFixed(3)} KD`);
    doc.moveDown();
    doc.text(`Grand Total: ${(totalSales + totalRepairs).toFixed(3)} KD`);
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Z-Report' });
  }
});

// GET /anomalies (ID 244) – flags suspicious sales
router.get('/anomalies', authenticate, requirePermission(244), async (req, res) => {
  try {
    const suspiciousSales = await Sale.find({ total: { $lt: 1 } }); // Price < 1 KD
    res.json(suspiciousSales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

// GET /api/tax/vat-export (permission 194) – query params: startDate, endDate
router.get('/tax/vat-export', authenticate, requirePermission(194), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { status: 'completed' };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const sales = await Sale.find(query).populate('customerId');
    
    let csv = 'Sale ID,Date,Subtotal,VAT Amount (5%),Total,Customer VAT Number\n';
    sales.forEach(sale => {
      const vat = sale.total * 0.05;
      const subtotal = sale.total - vat;
      csv += `${sale._id},${sale.createdAt.toISOString()},${subtotal.toFixed(3)},${vat.toFixed(3)},${sale.total.toFixed(3)},${(sale.customerId as any)?.vatNumber || 'N/A'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=VAT_Export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export VAT CSV' });
  }
});

// GET /stats (ID 192) – JSON stats for Cockpit
router.get('/stats', authenticate, requirePermission(192), async (req, res) => {
  try {
    const totalSales = await Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);

    const totalRepairs = await Repair.aggregate([
      { $match: { status: 'ready' } },
      { $group: { _id: null, total: { $sum: '$estimatedQuote' }, count: { $sum: 1 } } }
    ]);

    const revenue = (totalSales[0]?.total || 0) + (totalRepairs[0]?.total || 0);
    const units = (totalSales[0]?.count || 0);

    // SLA Risks (Modified as per Total Alignment Protocol)
    const slaRiskDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h as per audit
    const slaRisksCount = await Repair.countDocuments({ 
      status: { $in: ['fixing', 'parts_ordered'] }, 
      createdAt: { $lt: slaRiskDate } 
    });

    // Target Progress (Mock logic: Revenue vs 10,000 KD monthly target)
    const target = 10000;
    const progress = Math.min(100, (revenue / target) * 100);

    res.json({
      revenue,
      units,
      targetProgress: parseFloat(progress.toFixed(1)),
      slaRisks: slaRisksCount,
      breakdown: {
        repairRisks: slaRisksCount,
        poRisks: 0 // Resetting as per audit priority
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
