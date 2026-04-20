import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const skuGenerator = {
  generateSku: async (productData: any, variantAttributes: Record<string, string>, storeCode: string = 'MAIN') => {
    // Pattern: {BRAND}-{MODEL}-{ATTRS}-{PRICE}
    const store = storeCode.toUpperCase().slice(0, 3);
    
    // Brand abbreviation
    const brandPrefix = (productData.brand || 'GEN').substring(0, 3).toUpperCase();
    
    // Model abbreviation
    const model = (productData.modelNumber || productData.name || 'PROD')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase();
    
    // Specific attributes
    const attributeString = Object.entries(variantAttributes)
      .map(([_, val]) => val.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase())
      .join('-');
    
    let baseSku = `${brandPrefix}-${model}`;
    if (attributeString) {
      baseSku += `-${attributeString}`;
    }
    
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
