import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const skuGenerator = {
  generateSku: async (base: any, attr: any, _storeCode?: string) => {
    const b = (base.brand || 'GEN').substring(0, 3).toUpperCase();
    
    // Model identifier (first 3 alphanumeric chars of name)
    const m = (base.name || 'MOD')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase() || 'XXX';
    
    // Hardware DNA Extraction
    const s = attr.storage?.replace(/[^0-9]/g, '') || '000';
    const r = attr.ram?.replace(/[^0-9]/g, '') || '00';
    
    // Connectivity & Condition Codes (D=Dual, E=eSIM, P=Physical | N=New, U=Used)
    const sim = attr.simType?.includes('Dual') ? 'D' : (attr.simType?.includes('eSIM') ? 'E' : 'P');
    const cond = base.condition === 'Used' ? 'U' : 'N';
    
    const date = new Date()
      .toLocaleString('en-GB', { month: '2-digit', year: '2-digit' })
      .replace('/', '');
    
    // Pattern: BRAND-MODEL-STORAGE-RAM-SIM+COND-DATE
    const baseSku = `${b}-${m}-${s}-${r}-${sim}${cond}-${date}`;
    
    // 🛡️ COLLISION RESOLVER: Prevents E11000 errors
    let uniqueSku = baseSku;
    let counter = 1;
    let exists = await Variant.findOne({ sku: uniqueSku });
    
    while (exists) {
      uniqueSku = `${baseSku}-V${counter}`;
      counter++;
      exists = await Variant.findOne({ sku: uniqueSku });
    }
    
    return uniqueSku;
  },

  validateSku: async (sku: string) => {
    const exists = await Variant.findOne({ sku });
    return !exists;
  }
};
