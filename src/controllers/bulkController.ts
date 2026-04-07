import { Request, Response } from 'express';
import BulkJob from '../models/BulkJob';

export const bulkController = {
  createJob: async (req: Request, res: Response) => {
    try {
      const { type, totalItems } = req.body;
      const job = new BulkJob({
        type,
        totalItems,
        createdBy: (req as any).user.id
      });
      await job.save();
      
      // Logic to start bulk processing would go here
      // This would typically involve a worker process or a queue
      
      res.status(201).json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllJobs: async (req: Request, res: Response) => {
    try {
      const jobs = await BulkJob.find().populate('createdBy', 'name');
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getJobById: async (req: Request, res: Response) => {
    try {
      const job = await BulkJob.findById(req.params.id).populate('createdBy', 'name');
      if (!job) return res.status(404).json({ message: 'Bulk job not found' });
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  updateJobProgress: async (req: Request, res: Response) => {
    try {
      const { processedItems, status, error } = req.body;
      const job = await BulkJob.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Bulk job not found' });

      if (processedItems !== undefined) job.processedItems = processedItems;
      if (status) job.status = status;
      if (error) job.processingErrors.push(error);

      await job.save();
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
