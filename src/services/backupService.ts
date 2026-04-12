import cron from 'node-cron';
import mongoose from 'mongoose';
import Backup from '../models/Backup.js';

export const initBackupCron = () => {
  // Every 6 hours (ID 188)
  cron.schedule('0 */6 * * *', async () => {
    console.log('Starting scheduled backup...');
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const backupData: any = {};
      
      for (const col of collections) {
        const data = await mongoose.connection.db.collection(col.name).find().toArray();
        backupData[col.name] = data;
      }

      const backup = new Backup({
        timestamp: new Date(),
        collections: collections.map(c => c.name),
        data: backupData,
        type: 'full',
        location: 'database'
      });

      await backup.save();
      console.log('Backup completed successfully');
    } catch (error) {
      console.error('Backup failed:', error);
    }
  });
};

export const restoreBackup = async (backupId: string) => {
  const backup = await Backup.findById(backupId);
  if (!backup) throw new Error('Backup not found');

  console.log(`Restoring backup from ${backup.timestamp}...`);
  
  for (const colName of backup.collections) {
    const data = backup.data[colName];
    if (data) {
      await mongoose.connection.db.collection(colName).deleteMany({});
      await mongoose.connection.db.collection(colName).insertMany(data);
    }
  }
  
  return { success: true, message: 'Restore completed' };
};
