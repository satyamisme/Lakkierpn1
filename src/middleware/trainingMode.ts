import { Request, Response, NextFunction } from 'express';

/**
 * ID 227: Training Mode Middleware
 * Checks if user is in training mode and redirects to mock handlers.
 */
export const trainingModeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user?.isTrainingMode && req.method !== 'GET') {
    // For non-GET requests in training mode, simulate success without modifying DB
    console.log(`[TRAINING MODE] Mocking ${req.method} ${req.originalUrl}`);
    return res.status(200).json({ 
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      isMock: true,
      message: 'Training mode: Operation simulated successfully.'
    });
  }
  
  next();
};
