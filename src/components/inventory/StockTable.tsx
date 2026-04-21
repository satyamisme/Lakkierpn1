import React from 'react';
import { Package, Hash, Tag, DollarSign, TrendingUp, Trash2 } from 'lucide-react';
import { StockStatusBadge } from '../atoms/StockStatusBadge';

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  costPrice: number;
}

interface StockTableProps {
  items: InventoryItem[];
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

/**
 * ID 31: Stock Table Molecule
 * High-density table showing: Item Name, SKU, Category, Current Stock, and Cost Price (ID 29).
 */
export const StockTable: React.FC<StockTableProps> = ({ items, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU / Category</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stock</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost Price (ID 29)</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Selling Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No inventory items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Hash className="w-3 h-3" /> {item.sku}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                        <Tag className="w-3 h-3" /> {item.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-black text-gray-900 dark:text-white">{item.stock} <span className="text-[10px] font-normal text-gray-500">pcs</span></span>
                      <StockStatusBadge stock={item.stock} />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-black text-amber-600 dark:text-amber-400">
                      <DollarSign className="w-4 h-4" /> {item.costPrice.toFixed(3)} KD
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400">
                      <TrendingUp className="w-4 h-4" /> {item.price.toFixed(3)} KD
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit?.(item)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit Product"
                      >
                        <Tag size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete?.(item._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
