import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const skuGenerator = {
  generateSku: async (productData: any, variantAttributes: any, storeCode: string = 'MAIN') => {
    // Pattern: {BRAND}-{MODEL}-{STORAGE}-{RAM}-{COLOR}-{MMYY}
    const brand = (productData.brand || 'UNK').substring(0, 3).toUpperCase();
    
    // Model name (first 3 chars)
    const model = (productData.name || 'MOD')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase() || 'MOD';
    
    const storage = variantAttributes?.storage?.replace('GB', '') || '000';
    const ram = variantAttributes?.ram?.replace('GB', '') || '00';
    const color = variantAttributes?.color?.substring(0, 2).toUpperCase() || 'XX';
    
    const date = new Date()
      .toLocaleString('en-GB', { month: '2-digit', year: '2-digit' })
      .replace('/', '');
    
    const baseSku = `${brand}-${model}-${storage}-${ram}-${color}-${date}`;
    
    // Uniqueness check
    let uniqueSku = baseSku;
    let counter = 1;
    let exists = await Variant.findOne({ sku: uniqueSku });
    
    while (exists) {
      counter++;
      uniqueSku = `${baseSku}-V${counter}`;
      exists = await Variant.findOne({ sku: uniqueSku });
    }
    
    return uniqueSku;
  },

  validateSku: async (sku: string) => {
    const exists = await Variant.findOne({ sku });
    return !exists;
  }
};
