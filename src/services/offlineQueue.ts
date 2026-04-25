import { openDB } from 'idb';
import api from '../api/client';

const DB_NAME = 'LakkiOfflineDB';
const STORE_NAME = 'offlineSales';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveSale = async (saleData: any) => {
  const db = await initDB();
  return db.add(STORE_NAME, { ...saleData, createdAt: new Date() });
};

export const getPendingSales = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deleteSale = async (id: number) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};

export const syncPendingSales = async () => {
  if (!navigator.onLine) return;
  
  const sales = await getPendingSales();
  if (sales.length === 0) return;

  for (const sale of sales) {
    try {
      const response = await api.post('/sales', sale);
      
      if (response.status === 200 || response.status === 201) {
        await deleteSale(sale.id);
      } else {
        console.error(`Failed to sync sale ${sale.id}:`, response.data);
        window.dispatchEvent(new CustomEvent('offline-sync-conflict', { detail: { sale, error: response.data } }));
      }
    } catch (error: any) {
      console.error(`Error syncing sale ${sale.id}:`, error);
      if (error.response) {
        window.dispatchEvent(new CustomEvent('offline-sync-conflict', { detail: { sale, error: error.response.data } }));
      }
    }
  }
};
