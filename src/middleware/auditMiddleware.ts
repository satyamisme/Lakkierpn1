import AuditLog from "../models/AuditLog.js";

export const auditLogger = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function (body) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      const action = req.method === 'POST' ? 'create' : req.method === 'DELETE' ? 'delete' : 'update';
      
      // Map path to entity (ID 195)
      const pathPart = req.path.split('/')[1] === 'api' ? req.path.split('/')[2] : req.path.split('/')[1];
      const entityMap: Record<string, 'sale' | 'repair' | 'product' | 'user'> = {
        'sales': 'sale',
        'repairs': 'repair',
        'products': 'product',
        'users': 'user'
      };
      
      const entity = entityMap[pathPart];
      
      if (entity) {
        const log = new AuditLog({
          userId: (req as any).user?.id,
          action,
          entity,
          entityId: req.params.id || (JSON.parse(body)?._id) || 'N/A',
          newValue: req.body,
          ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        });
        
        log.save().catch(err => console.error("Audit logging failed:", err));
      }
    }
    return originalSend.call(this, body);
  };
  
  next();
};
