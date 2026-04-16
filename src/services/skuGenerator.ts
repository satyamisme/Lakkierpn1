import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const skuGenerator = {
  generateSku: async (productData: any, variantAttributes: Record<string, string>, storeCode: string = 'MAIN') => {
    // Pattern: {YY}{MM}-{STORE}-{MODEL}-{STORAGE}-{COLOR}-{PRICE}
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const store = storeCode.toUpperCase().slice(0, 3);
    
    // Model abbreviation: first 4 chars of name + 2 of brand or similar
    const model = (productData.modelNumber || productData.name || 'PROD').substring(0, 5).toUpperCase();
    
    // Specific attributes if they exist
    const storage = (variantAttributes['Storage'] || variantAttributes['Capacity'] || '000').replace(/[^0-9]/g, '').slice(0, 4);
    const color = (variantAttributes['Color'] || 'XXX').substring(0, 3).toUpperCase();
    
    // Price in cents
    const priceCents = Math.floor((productData.price || 0) * 100).toString();
    
    let baseSku = `${yy}${mm}-${store}-${model}-${storage}-${color}-${priceCents}`;
    
    // If attributes are different from Storage/Color, append them
    const otherAttrs = Object.entries(variantAttributes)
      .filter(([key]) => !['Storage', 'Capacity', 'Color'].includes(key))
      .map(([_, val]) => val.substring(0, 3).toUpperCase())
      .join('-');
    
    if (otherAttrs) {
      baseSku = `${yy}${mm}-${store}-${model}-${storage}-${color}-${otherAttrs}-${priceCents}`;
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
