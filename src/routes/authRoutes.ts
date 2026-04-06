import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import StoreProfile from '../models/StoreProfile';

const router = express.Router();

// Helper function to calculate distance between two coordinates in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

router.post('/login', async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;
    const devMode = process.env.DEV_MODE_SECURITY === 'true';

    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // ID 187: Geofencing Validation
    if (process.env.DEV_MODE_SECURITY !== 'true' && user.permissions.includes(187)) {
      if (latitude === undefined || longitude === undefined) {
        return res.status(403).json({ error: 'Location required for login' });
      }

      const store = await StoreProfile.findOne(); // Assuming single store for now
      if (store) {
        const distance = getDistance(latitude, longitude, store.location.latitude, store.location.longitude);
        if (distance > store.geofenceRadius) {
          return res.status(403).json({ error: `Geofence violation: You are ${Math.round(distance)}m away from the store.` });
        }
      }
    }

    // Ensure the admin user gets the full permissions array [1-300] to "light up" the UI
    const fullPermissions = Array.from({ length: 300 }, (_, i) => i + 1);
    const permissions = user.email === 'admin@lakkiphone.com' ? [0, ...fullPermissions] : user.permissions;

    const token = jwt.sign(
      { id: user._id, role: user.role, permissions },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, permissions } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
