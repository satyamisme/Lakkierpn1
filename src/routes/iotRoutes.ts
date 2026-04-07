import express from 'express';
import IotDevice from '../models/IotDevice.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/iot/devices (requires permission 277)
router.get('/devices', authenticate, requirePermission(277), async (req, res) => {
  try {
    const devices = await IotDevice.find();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IoT devices' });
  }
});

// POST /api/iot/update-display (permission 275)
router.post('/update-display', authenticate, requirePermission(275), async (req, res) => {
  try {
    const { text, total } = req.body;
    // In a real app, this would send a message to the physical display via WebSocket
    // For now, we update the virtual device state
    await IotDevice.findOneAndUpdate(
      { type: 'Customer_Display' },
      { currentValue: { text, total }, lastHeartbeat: new Date(), status: 'online' },
      { upsert: true }
    );
    
    // Emit to socket.io for frontend simulation
    const io = (req as any).io;
    if (io) {
      io.emit('iot_display_update', { text, total });
    }
    
    res.json({ status: 'sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update display' });
  }
});

// POST /api/iot/simulate-rfid (permission 276)
router.post('/simulate-rfid', authenticate, requirePermission(276), async (req, res) => {
  try {
    const { tagId } = req.body;
    await IotDevice.findOneAndUpdate(
      { type: 'RFID_Scanner' },
      { currentValue: { tagId }, lastHeartbeat: new Date(), status: 'online' },
      { upsert: true }
    );
    
    const io = (req as any).io;
    if (io) {
      io.emit('iot_rfid_scan', { tagId });
    }
    
    res.json({ status: 'scanned', tagId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate RFID scan' });
  }
});

// POST /api/iot/printer/status (receives paperLow, battery)
router.post('/printer/status', authenticate, async (req: any, res) => {
  const { deviceId, paperLow, batteryLevel } = req.body;
  await IotDevice.findOneAndUpdate({ deviceId }, { paperLow, batteryLevel, lastHeartbeat: new Date() });
  if (req.io) req.io.emit('iot_event', { type: 'PRINTER_STATUS', deviceId, paperLow, batteryLevel });
  res.json({ success: true });
});

// POST /api/iot/door/event (receives doorId, eventType)
router.post('/door/event', authenticate, async (req: any, res) => {
  const { deviceId, eventType } = req.body; // eventType: opened/closed
  await IotDevice.findOneAndUpdate({ deviceId }, { lastDoorEvent: eventType, lastHeartbeat: new Date() });
  if (req.io) req.io.emit('iot_event', { type: 'DOOR_EVENT', deviceId, eventType });
  res.json({ success: true });
});

// GET /api/iot/health (returns all device statuses, permission 278)
router.get('/health', authenticate, requirePermission(278), async (req, res) => {
  try {
    const devices = await IotDevice.find();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IoT health' });
  }
});

export default router;
