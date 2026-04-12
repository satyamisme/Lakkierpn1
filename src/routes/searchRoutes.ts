import express from 'express';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import Repair from '../models/Repair.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /unified (ID 319)
router.get('/unified', authenticate, async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) return res.json([]);

    const [products, sales, customers, repairs] = await Promise.all([
      Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } }
        ]
      }).limit(5).select('name sku price'),
      
      Sale.find({
        saleNumber: { $regex: query, $options: 'i' }
      }).limit(5).select('saleNumber total createdAt'),
      
      Customer.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } }
        ]
      }).limit(5).select('name phone'),
      
      Repair.find({
        ticketNumber: { $regex: query, $options: 'i' }
      }).limit(5).select('ticketNumber customerName status')
    ]);

    const results = [
      ...products.map(p => ({ type: 'product', id: p._id, title: p.name, subtitle: p.sku, link: `/inventory?sku=${p.sku}` })),
      ...sales.map(s => ({ type: 'sale', id: s._id, title: s.saleNumber, subtitle: `KD ${s.total.toFixed(3)}`, link: `/reports/sales` })),
      ...customers.map(c => ({ type: 'customer', id: c._id, title: c.name, subtitle: c.phone, link: `/crm?id=${c._id}` })),
      ...repairs.map(r => ({ type: 'repair', id: r._id, title: r.ticketNumber, subtitle: r.status, link: `/repairs` }))
    ];

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
