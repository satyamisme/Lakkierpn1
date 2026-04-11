import { Request, Response, NextFunction } from 'express';
import StoreProfile from '../models/StoreProfile.js';

export const ipWhitelistMiddleware = async (req: any, res: Response, next: NextFunction) => {
  if (process.env.DEV_MODE_SECURITY === 'true') return next();

  // IDs 181-240 are Governance, Security & HR (Sensitive)
  const sensitiveIds = Array.from({ length: 60 }, (_, i) => 181 + i);
  
  // Check if the user is trying to access a sensitive feature
  // This is a simplified check for the middleware
  const userPermissions = req.user?.permissions || [];
  const isAccessingSensitive = sensitiveIds.some(id => userPermissions.includes(id));

  if (isAccessingSensitive) {
    try {
      const store = await StoreProfile.findOne();
      if (store && store.whitelistedIPs.length > 0) {
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!store.whitelistedIPs.includes(clientIp)) {
          return res.status(403).json({ 
            error: 'IP Access Denied: This sensitive feature is restricted to shop Wi-Fi only.',
            detectedIp: clientIp
          });
        }
      }
    } catch (err) {
      console.error("Security check failed:", err);
      // In case of DB error, we might want to fail safe or fail open depending on policy
      // Here we'll allow it but log the error to avoid blocking the whole app
    }
  }

  next();
};
