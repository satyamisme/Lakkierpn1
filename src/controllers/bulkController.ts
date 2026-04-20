import { Request, Response } from 'express';
import BulkJob from '../models/BulkJob.js';
import Product from '../models/Product.js';
import PDFDocument from 'pdfkit';

export const bulkController = {
  createJob: async (req: Request, res: Response) => {
    try {
      const { type, totalItems, items, data } = req.body;
      const jobItems = items || data || [];
      const job = new BulkJob({
        type,
        totalItems: totalItems || jobItems.length,
        createdBy: (req as any).user.id,
        status: 'processing'
      });
      await job.save();
      
      // Synchronous processing (ID 18)
      if (type === 'price_update' && jobItems) {
        for (const item of jobItems) {
          const id = item.productId || item._id;
          const price = item.price || item.newPrice;
          if (id && price !== undefined) {
             await Product.findByIdAndUpdate(id, { price });
          }
          job.processedItems++;
        }
      } else if (type === 'stock_adjustment' && jobItems) {
        for (const item of jobItems) {
          const id = item.productId || item._id;
          if (id && item.adjustment !== undefined) {
             await Product.findByIdAndUpdate(id, { $inc: { stock: item.adjustment } });
          }
          job.processedItems++;
        }
      }

      job.status = 'completed';
      await job.save();
      
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

  deleteJob: async (req: Request, res: Response) => {
    try {
      const job = await BulkJob.findByIdAndDelete(req.params.id);
      if (!job) return res.status(404).json({ message: 'Bulk job not found' });
      res.json({ message: 'Job deleted successfully' });
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
  },

  bulkLabelPrint: async (req: Request, res: Response) => {
    try {
      const { productIds } = req.body;
      const products = await Product.find({ _id: { $in: productIds } });

      const doc = new PDFDocument({ size: [144, 72], margin: 5 }); // 2x1 inch labels
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=labels.pdf');
      
      doc.pipe(res);

      products.forEach((product, index) => {
        if (index > 0) doc.addPage();
        
        doc.fontSize(8).font('Helvetica-Bold').text('LAKKI PHONE ERP', { align: 'center' });
        doc.moveDown(0.2);
        doc.fontSize(6).font('Helvetica').text(product.name.substring(0, 30), { align: 'center' });
        doc.fontSize(10).font('Helvetica-Bold').text(`KD ${product.price.toFixed(3)}`, { align: 'center' });
        doc.fontSize(5).text(`SKU: ${product.sku}`, { align: 'center' });
        
        // Mock barcode area
        doc.rect(20, 45, 104, 15).stroke();
        doc.fontSize(4).text('|| ||| || |||| ||| || ||||', 20, 50, { align: 'center', width: 104 });
      });

      doc.end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  importProductCSV: async (req: Request, res: Response) => {
    try {
      const { csvData } = req.body;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim());
      const rows = lines.slice(1).filter((l: string) => l.trim().length > 0);

      const results = [];
      for (const line of rows) {
        const values = line.split(',').map((v: string) => v.trim());
        const productData: any = {};
        headers.forEach((header: string, i: number) => {
          let val: any = values[i];
          if (header === 'price' || header === 'cost') val = parseFloat(val) || 0;
          if (header === 'stock') val = parseInt(val) || 0;
          if (header === 'isImeiRequired') val = val.toLowerCase() === 'true';
          productData[header] = val;
        });

        if (productData.name && productData.sku) {
          const product = await Product.findOneAndUpdate(
            { sku: productData.sku },
            productData,
            { upsert: true, new: true }
          );
          results.push(product);
        }
      }

      res.status(200).json({ message: `Successfully processed ${results.length} products`, count: results.length });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
