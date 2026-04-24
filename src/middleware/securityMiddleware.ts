import { Request, Response, NextFunction } from 'express';
import StoreProfile from '../models/StoreProfile.js';
import Store from '../models/Store.js';

export const ipWhitelistMiddleware = async (req: any, res: Response, next: NextFunction) => {
  if (process.env.DEV_MODE_SECURITY === 'true') return next();

  // IDs 181-240 are Governance, Security & HR (Sensitive)
  const sensitiveIds = Array.from({ length: 60 }, (_, i) => 181 + i);
  
  const userPermissions = req.user?.permissions || [];
  const isSuperAdmin = req.user?.role === 'superadmin' || userPermissions.includes(0);
  const isAccessingSensitive = sensitiveIds.some(id => userPermissions.includes(id));

  if (isAccessingSensitive && !isSuperAdmin) {
    try {
      let whitelistedIPs: string[] = [];
      const storeId = req.user?.storeId;

      if (storeId) {
        const store = await Store.findById(storeId);
        if (store) whitelistedIPs = store.whitelistedIPs || [];
      } else {
        const globalProfile = await StoreProfile.findOne();
        if (globalProfile) whitelistedIPs = globalProfile.whitelistedIPs || [];
      }

      if (whitelistedIPs.length > 0) {
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!whitelistedIPs.includes(clientIp)) {
          return res.status(403).json({ 
            error: 'IP Access Denied: This sensitive feature is restricted to shop Wi-Fi only.',
            detectedIp: clientIp
          });
        }
      }
    } catch (err) {
      console.error("Security check failed:", err);
    }
  }

  next();
};
