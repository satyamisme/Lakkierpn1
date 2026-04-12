import AuditLog from '../models/AuditLog.js';

export const logAction = async (userId: string, action: string, entity: string, entityId: string, details: any, ip?: string) => {
  try {
    const log = new AuditLog({
      userId,
      action,
      entity,
      entityId,
      newValue: details,
      ip: ip || 'system'
    });
    await log.save();
  } catch (error) {
    console.error('Manual audit logging failed:', error);
  }
};
