import jwt from "jsonwebtoken";
import User from "../models/User.js";
import FeatureToggle from "../models/FeatureToggle.js";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requirePermission = (permissionId) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(403).json({ error: "User not found" });

      // FIX: 185 - Dynamic Feature Toggles
      const toggle = await FeatureToggle.findOne({ featureId: permissionId });
      
      if (toggle) {
        if (!toggle.enabledRoles.includes(user.role)) {
          return res.status(403).json({ error: `Feature ${toggle.name} is disabled for your role.` });
        }
      } else {
        if (!user.permissions.includes(permissionId)) {
          return res.status(403).json({ error: "Forbidden: Missing permission " + permissionId });
        }
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};
