import React, { useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Search, ShoppingCart, Smartphone, Package, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gate } from '../../PermissionGuard';
import { ImeiModal } from '../../ImeiModal';
import { PaymentMatrix } from './PaymentMatrix';
import { PaymentData } from '../../../utils/BalanceLogic';
import { useMemo } from 'react';
import { ThermalReceipt } from '../../print/ThermalReceipt';
import { A4Invoice } from '../../print/A4Invoice';
import { printThermalReceipt, printA4Invoice } from '../../../utils/documentService';
import { Printer, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  isPhone: boolean;
}

export const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<{ product: Product; imei?: string }[]>([]);
  
  const categories = ['All', 'Phones', 'Parts', 'Accessories'];
  
  // Modal States
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState<{ items: any[], payments: PaymentData, total: number, orderId: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
  }, [products, activeCategory]);

  const handleProcessSale = async (payments: PaymentData) => {
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const saleData = {
      items: cart.map(item => ({ 
        name: item.product.name, 
        sku: item.product.sku, 
        price: item.product.price, 
        imei: item.imei 
      })),
      payments,
      total: cartTotal,
      orderId
    };
    
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        setLastSale(saleData);
        setCart([]);
        setIsPaymentModalOpen(false);
        setIsSuccessModalOpen(true);
        toast.success("Sale completed successfully");
        // Refresh products to show updated stock
        fetchProducts(searchTerm);
      } else {
        const error = await response.json();
        toast.error(error.error || "Sale failed");
      }
    } catch (error) {
      console.error("Sale processing error:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const fetchProducts = async (query = '') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/search?q=${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch products');
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddToCart = (product: Product) => {
    if (product.isPhone) {
      setSelectedProduct(product);
      setIsImeiModalOpen(true);
    } else {
      setCart(prev => [...prev, { product }]);
    }
  };

  const confirmImei = (imei: string) => {
    if (selectedProduct) {
      setCart(prev => [...prev, { product: selectedProduct, imei }]);
      setSelectedProduct(null);
    }
  };

  // Virtualization Settings
  const COLUMN_COUNT = 4;
  const ROW_HEIGHT = 280;
  const GUTTER = 24;

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    const product = filteredProducts[index];

    if (!product) return null;

    return (
      <div style={{
        ...style,
        left: style.left + GUTTER / 2,
        top: style.top + GUTTER / 2,
        width: style.width - GUTTER,
        height: style.height - GUTTER,
      }}>
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between group"
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-xl ${product.isPhone ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
                {product.isPhone ? <Smartphone className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{product.sku}</span>
                {product.stock === 0 ? (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Out of Stock</span>
                ) : product.stock < 5 ? (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Low Stock</span>
                ) : (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-[8px] font-black uppercase tracking-widest rounded-lg">In Stock</span>
                )}
              </div>
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{product.name}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">{product.category}</p>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest">Price</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{product.price.toFixed(3)} <span className="text-[10px] font-normal text-gray-500">KD</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest">Stock</p>
                <p className={`text-xs font-black ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{product.stock} pcs</p>
              </div>
            </div>

            <button 
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              className="w-full bg-gray-900 dark:bg-gray-800 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-gray-800"
            >
              <ShoppingCart className="w-3 h-3" />
              Add to Cart
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <Gate id={1}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center gap-6 flex-1 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Elastic Search (ID 3): Name, SKU, or IMEI..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl flex items-center gap-3 border border-indigo-100 dark:border-indigo-900/50">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="text-xs">
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Cart Items</p>
                <p className="text-indigo-900 dark:text-indigo-300 font-black">{cart.length} Products</p>
              </div>
            </div>

            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={cart.length === 0}
              className="bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-gray-800"
            >
              Checkout
              <span className="bg-white/20 dark:bg-white/10 px-2 py-0.5 rounded-lg text-[10px]">{cartTotal.toFixed(3)} KD</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-3xl p-4 min-h-[600px] relative overflow-hidden transition-colors">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">Indexing Products...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/50 flex flex-col items-center gap-4 max-w-md text-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search Error</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
                <button onClick={() => fetchProducts(searchTerm)} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors">Retry Search</button>
              </div>
            </div>
          )}

          <Grid
            columnCount={COLUMN_COUNT}
            columnWidth={1200 / COLUMN_COUNT} // Assuming 1200px container
            height={600}
            rowCount={Math.ceil(filteredProducts.length / COLUMN_COUNT)}
            rowHeight={ROW_HEIGHT}
            width={1200}
            className="scrollbar-hide"
          >
            {Cell}
          </Grid>
          
          {filteredProducts.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-bold uppercase tracking-widest opacity-50">No Products Found</p>
            </div>
          )}
        </div>

        <ImeiModal 
          isOpen={isImeiModalOpen}
          onClose={() => setIsImeiModalOpen(false)}
          onConfirm={confirmImei}
          productName={selectedProduct?.name || ''}
        />

        <PaymentMatrix 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          totalAmount={cartTotal}
          onProcessSale={handleProcessSale}
        />

        {/* Success Modal with Print Options (ID 21, 25) */}
        <AnimatePresence>
          {isSuccessModalOpen && lastSale && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
              />
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100"
              >
                <div className="p-12 text-center space-y-8">
                  <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Sale Successful!</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest mt-2">Order #{lastSale.orderId} has been processed</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Gate id={21}>
                      <button 
                        onClick={() => printThermalReceipt(lastSale.orderId)}
                        className="flex flex-col items-center gap-4 p-8 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                      >
                        <Printer className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        <div className="text-center">
                          <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Thermal Receipt</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">80mm Bilingual (ID 21)</p>
                        </div>
                      </button>
                    </Gate>

                    <Gate id={25}>
                      <button 
                        onClick={() => printA4Invoice(lastSale.orderId)}
                        className="flex flex-col items-center gap-4 p-8 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                      >
                        <FileText className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        <div className="text-center">
                          <p className="text-sm font-black text-gray-900 uppercase tracking-widest">A4 Invoice</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Professional B2B (ID 25)</p>
                        </div>
                      </button>
                    </Gate>
                  </div>

                  <button 
                    onClick={() => setIsSuccessModalOpen(false)}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
                  >
                    Return to Terminal
                  </button>
                </div>

                {/* Hidden Print Templates */}
                <div className="hidden">
                  <div id="thermal-receipt">
                    <ThermalReceipt 
                      id="thermal-receipt-component"
                      orderId={lastSale.orderId}
                      date={new Date().toLocaleString()}
                      items={lastSale.items}
                      payments={lastSale.payments}
                      total={lastSale.total}
                    />
                  </div>
                  <div id="a4-invoice">
                    <A4Invoice 
                      id="a4-invoice-component"
                      orderId={lastSale.orderId}
                      date={new Date().toLocaleDateString()}
                      items={lastSale.items}
                      payments={lastSale.payments}
                      total={lastSale.total}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Gate>
  );
};
