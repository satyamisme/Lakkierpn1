import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const skuGenerator = {
  generateSku: async (productData: any, variantAttributes: any, storeCode: string = 'MAIN') => {
    // Pattern: {BRAND}-{MODEL}-{STORAGE}-{CONDITION}-{MMYY}
    const brand = productData.brand?.substring(0, 3).toUpperCase() || 'UNK';
    
    // Model name (last word or name)
    const model = (productData.name || 'MOD')
      .split(' ')
      .pop()
      ?.replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase() || 'MOD';
    
    const storage = variantAttributes?.storage || '000';
    const condition = productData.condition === 'Used' ? 'U' : 'N';
    
    const date = new Date()
      .toLocaleString('en-GB', { month: '2-digit', year: '2-digit' })
      .replace('/', '');
    
    const baseSku = `${brand}-${model}-${storage}-${condition}-${date}`;
    
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
