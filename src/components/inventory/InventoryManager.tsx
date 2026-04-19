import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Filter, Loader2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Gate } from '../PermissionGuard';
import { StockTable } from './StockTable';
import { calculateInventoryValue, calculateProjectedProfit } from '../../utils/stockLogic';
import { GlobalAddProductModal } from '../GlobalAddProductModal';
import { toast } from 'sonner';
import axios from 'axios';

/**
 * ID 31: Inventory Matrix Organism
 * Main dashboard for stock management and low-stock alarms (ID 34).
 */
export const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products/search?q='); // Fetch all products for now
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? All its variants will also be removed.")) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setItems(items.filter(i => i._id !== id));
      toast.success("Product removed from matrix.");
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  const inventoryValue = useMemo(() => calculateInventoryValue(items), [items]);
  const projectedProfit = useMemo(() => calculateProjectedProfit(items), [items]);
  const lowStockCount = useMemo(() => items.filter(i => i.stock < 5).length, [items]);

  const categories = ['All', 'Phones', 'Parts', 'Accessories'];

  return (
    <Gate id={31}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                <Package className="w-8 h-8" />
              </div>
              Inventory <span className="text-indigo-600 dark:text-indigo-400">Matrix</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2 ml-1">
              ID 31: Stock Management & Low-Stock Alarms (ID 34)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search by Name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-xs font-bold uppercase tracking-widest w-full md:w-80 shadow-sm"
              />
            </div>
            <button className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Value (ID 29)</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{inventoryValue.toFixed(3)} KD</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Projected Profit</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{projectedProfit.toFixed(3)} KD</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Stock Alarms (ID 34)</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{lowStockCount} Items</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 w-fit">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Indexing Inventory Matrix...</p>
          </div>
        ) : (
          <StockTable 
            items={filteredItems} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <GlobalAddProductModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={fetchInventory}
          initialData={editingItem}
        />
      </div>
    </Gate>
  );
};
