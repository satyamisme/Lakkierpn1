import Product from '../models/Product.js';
import Variant from '../models/Variant.js';

export const globalSearch = async (query: string) => {
  const tokens = query.trim().split(/\s+/).filter(t => t.length > 0);
  if (tokens.length === 0) return [];
  
  // Logic ID 3: Elastic Tokenization - Distributed Attribute Search
  // We use aggregation to join products and variants, ensuring that for EVERY token in the user's query,
  // there is a match in either the product name/brand or one of its variants' attributes.
  
  const pipeline: any[] = [
    {
      $lookup: {
        from: 'variants', // Ensure this matches the actual collection name for variants
        localField: '_id',
        foreignField: 'productId',
        as: 'variants'
      }
    },
    {
      $match: {
        $and: tokens.map(token => {
          const tRegex = token.split('').join('.*');
          return {
            $or: [
              { name: { $regex: tRegex, $options: 'i' } },
              { brand: { $regex: tRegex, $options: 'i' } },
              { sku: { $regex: tRegex, $options: 'i' } },
              { "variants.sku": { $regex: tRegex, $options: 'i' } },
              { "variants.attributes.color": { $regex: tRegex, $options: 'i' } },
              { "variants.attributes.storage": { $regex: tRegex, $options: 'i' } },
              { "variants.attributes.ram": { $regex: tRegex, $options: 'i' } },
              { "variants.attributes.condition": { $regex: tRegex, $options: 'i' } }
            ]
          };
        })
      }
    },
    {
      $match: {
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
      }
    }
  ];

  const results = await Product.aggregate(pipeline);
  return results;
};
