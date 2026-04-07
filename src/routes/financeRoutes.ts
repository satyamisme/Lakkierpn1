import express from 'express';
import Expense from '../models/Expense.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Repair from '../models/Repair.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/expenses (requires permission 193)
router.post('/expenses', authenticate, requirePermission(193), async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, userId: (req as any).user.id });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log expense' });
  }
});

// GET /api/expenses (permission 193)
router.get('/expenses', authenticate, requirePermission(193), async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET /api/pnl (profit & loss, permission 101)
router.get('/pnl', authenticate, requirePermission(101), async (req, res) => {
  try {
    const sales = await Sale.find({ status: 'completed' });
    const expenses = await Expense.find();
    const repairs = await Repair.find({ status: 'ready' });

    let totalSales = 0;
    let totalCosts = 0;
    let totalExpenses = 0;
    let totalCommission = 0;

    // Calculate Sales and Costs
    for (const sale of sales) {
      totalSales += sale.total;
      for (const item of sale.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          totalCosts += product.cost * item.quantity;
        }
      }
    }

    // Calculate Expenses
    totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate Technician Commission (Mock: 10% of repair quote)
    totalCommission = repairs.reduce((sum, r) => sum + (r.estimatedQuote * 0.1), 0);

    const netProfit = totalSales - totalCosts - totalExpenses - totalCommission;

    res.json({
      totalSales,
      totalCosts,
      totalExpenses,
      totalCommission,
      netProfit,
      breakdown: {
        salesCount: sales.length,
        repairsCount: repairs.length,
        expensesCount: expenses.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate P&L' });
  }
});

// GET /api/cash-flow (permission 102)
router.get('/cash-flow', authenticate, requirePermission(102), async (req, res) => {
  try {
    const sales = await Sale.find({ status: 'completed' });
    
    let cashInDrawer = 0;
    let bankBalance = 0; // K-Net + Card
    let storeCredit = 0;

    sales.forEach(sale => {
      sale.payments.forEach(p => {
        if (p.method === 'cash') cashInDrawer += p.amount;
        else if (p.method === 'knet' || p.method === 'card') bankBalance += p.amount;
        else if (p.method === 'store_credit') storeCredit += p.amount;
      });
    });

    // Deduct cash expenses
    const cashExpenses = await Expense.find({ category: { $ne: 'Rent' } }); // Mock: Rent is bank, others are cash
    const totalCashExpenses = cashExpenses.reduce((sum, e) => sum + e.amount, 0);
    cashInDrawer -= totalCashExpenses;

    res.json({
      cashInDrawer,
      bankBalance,
      storeCredit,
      totalLiquidity: cashInDrawer + bankBalance
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cash flow' });
  }
});

export default router;
