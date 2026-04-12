import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';
import StoreProfile from '../models/StoreProfile.js';
import TwoFactorLog from '../models/TwoFactorLog.js';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, permissions } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        permissions: permissions || []
      });
      await user.save();
      res.status(201).json({ message: "User registered" });
    } catch (error: any) {
      res.status(500).json({ error: "Registration failed" });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password, latitude, longitude } = req.body;
      const user = await User.findOne({ email });
      
      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Geofencing Validation (ID 187)
      if (process.env.DEV_MODE_SECURITY !== 'true' && user.permissions.includes(187)) {
        if (latitude === undefined || longitude === undefined) {
          return res.status(403).json({ error: 'Location required for login' });
        }

        const store = await StoreProfile.findOne();
        if (store) {
          const R = 6371e3; // Earth's radius in meters
          const φ1 = latitude * Math.PI / 180;
          const φ2 = store.location.latitude * Math.PI / 180;
          const Δφ = (store.location.latitude - latitude) * Math.PI / 180;
          const Δλ = (store.location.longitude - longitude) * Math.PI / 180;

          const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

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
      
      res.json({ token, user: { id: user._id, name: user.name, role: user.role, permissions: user.permissions } });
    } catch (error: any) {
      res.status(500).json({ error: "Login failed" });
    }
  },

  setup2FA: async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const secret = speakeasy.generateSecret({ name: `Lakki ERP (${user.email})` });
      user.twoFactorSecret = secret.base32;
      await user.save();
      
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

      await new TwoFactorLog({
        userId: user._id,
        action: 'setup',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }).save();

      res.json({ qrCodeUrl, secret: secret.base32 });
    } catch (error: any) {
      res.status(500).json({ error: "2FA setup failed" });
    }
  },

  verify2FA: async (req: Request, res: Response) => {
    try {
      const { userId, token } = req.body;
      const user = await User.findById(userId);
      if (!user || !user.twoFactorSecret) return res.status(404).json({ error: "User or secret not found" });
      
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
      });
      
      if (!verified) {
        await new TwoFactorLog({
          userId: user._id,
          action: 'failed_attempt',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }).save();
        return res.status(401).json({ error: "Invalid 2FA token" });
      }
      
      user.isTwoFactorEnabled = true;
      await user.save();

      await new TwoFactorLog({
        userId: user._id,
        action: 'verify',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }).save();
      
      const jwtToken = jwt.sign(
        { id: user._id, permissions: user.permissions },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );
      
      res.json({ token: jwtToken, user: { id: user._id, name: user.name, role: user.role, permissions: user.permissions } });
    } catch (error: any) {
      res.status(500).json({ error: "2FA verification failed" });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      // In a more complex app, we'd blacklist the token here
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ error: "Logout failed" });
    }
  },

  getMe: async (req: any, res: Response) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  },

  disable2FA: async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.isTwoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();

      await new TwoFactorLog({
        userId: user._id,
        action: 'disable',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }).save();

      res.json({ message: "2FA disabled successfully" });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  }
};
