import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog.js';

export const auditController = {
  getLogs: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50, entity, action, userId } = req.query;
      const query: any = {};
      if (entity) query.entity = entity;
      if (action) query.action = action;
      if (userId) query.userId = userId;

      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('userId', 'name email');

      const total = await AuditLog.countDocuments(query);

      res.json({
        logs,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  exportLogs: async (req: Request, res: Response) => {
    try {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).populate('userId', 'name email');
      
      let csv = 'Timestamp,User,Action,Entity,EntityID,IP,NewValue\n';
      logs.forEach(log => {
        const user = (log.userId as any)?.name || 'Unknown';
        const newValue = JSON.stringify(log.newValue).replace(/"/g, '""');
        csv += `${log.timestamp.toISOString()},"${user}",${log.action},${log.entity},${log.entityId},${log.ip},"${newValue}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
