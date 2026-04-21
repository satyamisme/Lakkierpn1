import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const skuGenerator = {
  generateSku: async (productData: any, variantAttributes: any, storeCode: string = 'MAIN') => {
    // Pattern: {BRAND}-{MODEL}-{STORAGE}-{RAM}-{SIM}{COND}-{MMYY}
    const brand = (productData.brand || 'GEN').substring(0, 3).toUpperCase();
    
    // Model identifier (first 4 chars of name)
    const model = (productData.name || 'PROD')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase() || 'PROD';
    
    const storage = variantAttributes?.storage?.replace(/[^0-9TB]/g, '') || '000';
    const ram = variantAttributes?.ram?.replace(/[^0-9]/g, '') || '00';
    
    // Logic ID 44: Map SIM and Condition to single codes
    const simCode = variantAttributes?.simType?.includes('eSIM') ? 'E' : (variantAttributes?.simType?.includes('Dual') ? 'D' : 'P');
    const condCode = productData.condition === 'Used' ? 'U' : (productData.condition === 'Refurbished' ? 'R' : 'N');
    
    const date = new Date()
      .toLocaleString('en-GB', { month: '2-digit', year: '2-digit' })
      .replace('/', '');
    
    const baseSku = `${brand}-${model}-${storage}-${ram}-${simCode}${condCode}-${date}`;
    
    // 🛡️ Collision Resolver: Add -Vn suffix
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
