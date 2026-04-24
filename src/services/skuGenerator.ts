import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const skuGenerator = {
  generateSku: async (base: any, attr: any, _storeCode?: string) => {
    const b = (base.brand || 'GEN').substring(0, 3).toUpperCase();
    const m = (base.name || 'MOD').substring(0, 3).toUpperCase();
    const s = attr.storage?.replace(/\D/g, '') || '000';
    const c = attr.color?.substring(0, 2).toUpperCase() || 'XX';
    const sim = attr.simType?.includes('Dual') ? 'D' : attr.simType?.includes('eSIM') ? 'E' : 'P';
    const cond = base.condition?.substring(0, 1).toUpperCase() || 'N';
    
    const mmYY = new Date().toLocaleString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '');
    const entropy = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    let baseSku = `${b}-${m}-${s}-${c}-${sim}${cond}-${mmYY}-${entropy}`;
    let uniqueSku = baseSku; 
    let counter = 1;
    
    // Recursive Safety Resolver to stop E11000 crashes
    while (await Variant.findOne({ sku: uniqueSku })) {
      uniqueSku = `${baseSku}-V${counter}`;
      counter++;
    }
    return uniqueSku;
  },

  validateSku: async (sku: string) => {
    const exists = await Variant.findOne({ sku });
    return !exists;
  }
};
