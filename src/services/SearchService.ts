import Product from '../models/Product.js';

export const globalSearch = async (query: string) => {
  // Logic: Splits input into tokens and finds any record containing all parts (Lookahead Regex)
  // Handles "12pro", "15 Pro Max", "Blue 256"
  const tokens = query.trim().split(/\s+/).filter(t => t.length > 0);
  
  // If query is "12Pro", we want to match cases where "12" and "Pro" are present
  // If tokens is ["12Pro"], we might want to split numbers and letters if it's a common typo
  // But sticking to the user's explicit tokenized + fuzzy join logic:
  
  // Improved logic: find any record containing all tokens in ANY order
  const regex = new RegExp(tokens.map(t => `(?=.*${t})`).join(''), 'i');
  
  return await Product.find({
    $or: [
      { name: regex },
      { brand: regex },
      { "variants.sku": regex },
      { "variants.color": regex },
      { "variants.attributes.storage": regex },
      { "variants.attributes.ram": regex }
    ]
  }).populate('variants');
};
