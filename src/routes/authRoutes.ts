import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User';
import StoreProfile from '../models/StoreProfile';

const router = express.Router();

const DEFAULT_PERMISSIONS: Record<string, number[]> = {
  superadmin: Array.from({ length: 315 }, (_, i) => i + 1),
  manager: [1, 3, 12, 13, 16, 31, 42, 61, 63, 67, 71, 74, 103, 121, 122, 123, 124, 125, 128, 141, 181, 182, 183, 190, 191, 244],
  cashier: [1, 3, 12, 13, 16, 31, 42],
  technician: [61, 63, 67, 71, 74, 103],
  inventory: [121, 122, 123, 124, 125, 128],
  auditor: [181, 182, 183, 190, 191, 244],
};

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

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const permissions = DEFAULT_PERMISSIONS[role] || [];
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      permissions,
    });
    
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // ID 187: Geofencing Validation
    if (process.env.DEV_MODE_SECURITY !== 'true' && user.permissions.includes(187)) {
      if (latitude === undefined || longitude === undefined) {
        return res.status(403).json({ error: 'Location required for login' });
      }

      const store = await StoreProfile.findOne();
      if (store) {
        const distance = getDistance(latitude, longitude, store.location.latitude, store.location.longitude);
        if (distance > store.geofenceRadius) {
          return res.status(403).json({ error: `Geofence violation: You are ${Math.round(distance)}m away from the store.` });
        }
      }
    }

    if (user.isTwoFactorEnabled) {
      return res.json({ requires2FA: true, userId: user._id });
    }
    
    const token = jwt.sign(
      { id: user._id, permissions: user.permissions },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );
    
    res.json({ token, user: { id: user._id, name: user.name, permissions: user.permissions } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post('/2fa/setup', async (req, res) => {
  try {
    const { userId } = req.body;
    const secret = speakeasy.generateSecret({ name: "Lakki Phone ERP" });
    await User.findByIdAndUpdate(userId, { twoFactorSecret: secret.base32 });
    
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ error: "2FA setup failed" });
  }
});

router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: "base32",
      token,
    });
    
    if (!verified) {
      return res.status(401).json({ error: "Invalid 2FA token" });
    }
    
    await User.findByIdAndUpdate(userId, { isTwoFactorEnabled: true });
    
    const jwtToken = jwt.sign(
      { id: user._id, permissions: user.permissions },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );
    
    res.json({ token: jwtToken, user: { id: user._id, name: user.name, permissions: user.permissions } });
  } catch (error) {
    res.status(500).json({ error: "2FA verification failed" });
  }
});

export default router;
