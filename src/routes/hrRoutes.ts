import express from 'express';
import Attendance from '../models/Attendance.js';
import Commission from '../models/Commission.js';
import Sale from '../models/Sale.js';
import Repair from '../models/Repair.js';
import User from '../models/User.js';
import PayrollAdjustment from '../models/PayrollAdjustment.js';
import { calculateOvertime } from '../services/overtimeCalculator.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/attendance/clock-in (requires permission 188)
router.post('/attendance/clock-in', authenticate, requirePermission(188), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already clocked in
    const existing = await Attendance.findOne({ userId: (req as any).user.id, date: today });
    if (existing) return res.status(400).json({ error: 'Already clocked in today' });

    const attendance = new Attendance({
      userId: (req as any).user.id,
      clockIn: new Date(),
      location: { latitude, longitude },
      date: today
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Clock-in failed' });
  }
});

// POST /api/attendance/clock-out (permission 188)
router.post('/attendance/clock-out', authenticate, requirePermission(188), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ userId: (req as any).user.id, date: today, clockOut: { $exists: false } });
    if (!attendance) return res.status(400).json({ error: 'No active clock-in found for today' });

    const clockOut = new Date();
    const overtimeHours = calculateOvertime(attendance.clockIn, clockOut);

    attendance.clockOut = clockOut;
    attendance.overtimeHours = overtimeHours;
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Clock-out failed' });
  }
});

// GET /api/payroll (permission 197)
router.get('/payroll', authenticate, requirePermission(197), async (req, res) => {
  try {
    const users = await User.find();
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

    const payrollData = await Promise.all(users.map(async (user) => {
      const commissions = await Commission.find({ userId: user._id, paid: false });
      const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);
      
      const adjustments = await PayrollAdjustment.find({ userId: user._id, payPeriod: currentPeriod });
      const totalAdjustments = adjustments.reduce((sum, a) => a.type === 'bonus' ? sum + a.amount : sum - a.amount, 0);

      const attendance = await Attendance.find({ userId: user._id, date: { $regex: `^${currentPeriod}` } });
      const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
      const overtimePay = totalOvertime * 5; // Mock overtime rate: 5 KD/hr

      const baseSalary = 250; // Mock base salary in KD
      const penalties = 0; // Mock penalties

      return {
        userId: user._id,
        name: user.name,
        baseSalary,
        totalCommission,
        totalAdjustments,
        overtimePay,
        penalties,
        totalPayable: baseSalary + totalCommission + totalAdjustments + overtimePay - penalties
      };
    }));
    res.json(payrollData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

// GET /api/performance (permission 329 - Bug #12)
router.get('/performance', authenticate, requirePermission(329), async (req, res) => {
  try {
    const users = await User.find();
    const performanceData = await Promise.all(users.map(async (user) => {
      const sales = await Sale.find({ userId: user._id, status: 'completed' });
      const repairs = await Repair.find({ technicianId: user._id });
      
      const salesCount = sales.length;
      const totalSalesValue = sales.reduce((sum, s) => sum + s.total, 0);
      const avgTicketValue = salesCount > 0 ? totalSalesValue / salesCount : 0;
      
      const completedRepairs = repairs.filter(r => r.status === 'ready' || r.status === 'delivered').length;
      const repairCompletionRate = repairs.length > 0 ? (completedRepairs / repairs.length) * 100 : 0;

      return {
        userId: user._id,
        name: user.name,
        salesCount,
        avgTicketValue,
        repairCompletionRate,
        totalSalesValue
      };
    }));
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
});

export default router;
