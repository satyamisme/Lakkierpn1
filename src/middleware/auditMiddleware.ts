import AuditLog from "../models/AuditLog.js";

export const auditLogger = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function (body) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      const action = req.method === 'POST' ? 'create' : req.method === 'DELETE' ? 'delete' : 'update';
      const entity = req.path.split('/')[2]; // Assuming /api/ENTITY/...
      
      const log = new AuditLog({
        userId: (req as any).user?.id,
        action,
        entity,
        entityId: req.params.id || 'N/A',
        newValue: req.body,
        ip: req.ip,
      });
      
      log.save().catch(err => console.error("Audit logging failed:", err));
    }
    return originalSend.call(this, body);
  };
  
  next();
};
