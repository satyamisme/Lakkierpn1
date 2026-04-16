import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Store, 
  Pause, 
  RefreshCcw, 
  Wifi, 
  WifiOff, 
  Tag, 
  Percent, 
  Calculator,
  Loader2,
  CheckCircle2,
  Upload,
  FileText,
  Lock,
  History,
  Printer,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { ImeiModal } from "../components/pos/molecules/ImeiModal";
import { LoyaltyPayment } from "../components/pos/organisms/LoyaltyPayment";
import { Gate } from "../components/PermissionGuard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ThermalReceipt } from '../components/print/ThermalReceipt';
import { A4Invoice } from '../components/print/A4Invoice';
import { printThermalReceipt, printA4Invoice } from '../utils/documentService';
import { HeldCartsModal } from '../components/pos/molecules/HeldCartsModal';
import { BulkImportModal } from '../components/BulkImportModal';

import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
  brand?: string;
  isConfigurable?: boolean;
  variants?: any[];
}

interface CartItem {
  product: any; // Can be Product or Variant
  quantity: number;
  imei?: string;
  discount: number; // Line-item discount
  isVariant?: boolean;
  parentProduct?: Product;
}

interface POSProps {
  onAddProductClick: () => void;
}

export const POS: React.FC<POSProps> = ({ onAddProductClick }) => {
  const { hasPermission } = useAuth();
  const { addToQueue, isOnline, queueLength } = useOfflineQueue();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'knet' | 'store_credit'>('cash');
  const [isWholesale, setIsWholesale] = useState(false);
  const [splitPayments, setSplitPayments] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('All');
  const [lastSale, setLastSale] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);

  useEffect(() => {
    const lockTimer = setInterval(() => {
      if (Date.now() - lastActivity > 120000) { // 2 minutes
        setIsLocked(true);
      }
    }, 10000);

    const resetTimer = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      clearInterval(lockTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [lastActivity]);

  const handleUnlock = () => {
    setIsLocked(false);
    setLastActivity(Date.now());
  };

  useEffect(() => {
    fetchProducts();
    const resumeHeldSession = async () => {
      const sessionId = localStorage.getItem("held_session_id");
      if (sessionId) {
        try {
          const response = await axios.get(`/api/sales/hold/${sessionId}`);
          if (response.status === 200) {
            const sale = response.data;
            const cartItems = await Promise.all(sale.items.map(async (item: any) => {
              const pRes = await axios.get(`/api/products/${item.productId}`);
              const product = pRes.data;
              return {
                product,
                quantity: item.quantity,
                imei: item.imei,
                discount: 0
              };
            }));
            setCart(cartItems);
            localStorage.removeItem("held_session_id");
            toast.success("Resumed held session from cloud.");
          }
        } catch (error) {
          console.error("Resume error:", error);
        }
      }
      
      const heldCart = localStorage.getItem("held_cart");
      if (heldCart) {
        setCart(JSON.parse(heldCart));
        localStorage.removeItem("held_cart");
      }
    };
    resumeHeldSession();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/products');
      if (response.status === 200) {
        const data = response.data;
        const productsList = Array.isArray(data) ? data : (data.products || []);
        
        const productsWithImages = productsList.map((p: any) => ({
          ...p,
          image: p.image || `https://picsum.photos/seed/${p.sku}/400/400`
        }));
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to sync product matrix.");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const addToCart = (item: any, isVariant: boolean = false, parentProduct?: Product) => {
    if (item.stock <= 0) {
      toast.error("Out of stock!");
      return;
    }

    const trackingMethod = isVariant ? item.trackingMethod : 'none';
    const requiresImei = trackingMethod === 'imei' || trackingMethod === 'serial';

    if (requiresImei) {
      setPendingProduct({ ...item, isVariant, parentProduct });
      setIsImeiModalOpen(true);
    } else {
      const existing = cart.find(ci => ci.product._id === item._id);
      if (existing) {
        setCart(cart.map(ci => 
          ci.product._id === item._id 
            ? { ...ci, quantity: ci.quantity + 1 } 
            : ci
        ));
      } else {
        setCart([...cart, { 
          product: item, 
          quantity: 1, 
          discount: 0, 
          isVariant, 
          parentProduct 
        }]);
      }
      toast.success(`${item.name || (parentProduct?.name + ' ' + Object.values(item.attributes).join('/'))} added to cart`);
    }
    
    if (isVariant) {
      setSelectedProductForVariants(null);
    }
  };

  const handleImeiConfirm = (imei: string) => {
    if (pendingProduct) {
      setCart([...cart, { 
        product: pendingProduct, 
        quantity: 1, 
        imei, 
        discount: 0,
        isVariant: pendingProduct.isVariant,
        parentProduct: pendingProduct.parentProduct
      }]);
      setPendingProduct(null);
      toast.success("Item added with Serial/IMEI");
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    const newQty = item.quantity + delta;
    
    if (newQty <= 0) {
      newCart.splice(index, 1);
    } else if (newQty <= item.product.stock) {
      item.quantity = newQty;
    } else {
      toast.error("Insufficient stock!");
      return;
    }
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + ((item.product.price || 0) * (item.quantity || 0)), 0);
  const wholesaleDiscount = isWholesale ? subtotal * 0.2 : 0;
  const lineDiscounts = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
  const total = Math.max(0, subtotal - lineDiscounts - (globalDiscount || 0) - wholesaleDiscount);

  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    
    const totalSplit = Object.values(splitPayments).reduce((sum, val) => sum + val, 0);
    if (Object.keys(splitPayments).length > 0 && Math.abs(totalSplit - total) > 0.001) {
      toast.error(`Payment mismatch: Total paid (${totalSplit.toFixed(3)}) must equal sale total (${total.toFixed(3)})`);
      return;
    }

    setIsProcessing(true);
    
    const payments = Object.keys(splitPayments).length > 0 
      ? Object.entries(splitPayments)
          .filter(([_, amount]) => amount > 0)
          .map(([method, amount]) => ({ 
            method: method.toLowerCase().replace(' ', '_'), 
            amount 
          }))
      : [{ method: paymentMethod, amount: total }];

    const saleData = {
      items: cart.map(item => ({
        productId: item.isVariant ? item.parentProduct?._id : item.product._id,
        variantId: item.isVariant ? item.product._id : undefined,
        quantity: item.quantity,
        price: item.product.price,
        imei: item.imei
      })),
      payments,
      subtotal,
      discount: lineDiscounts + globalDiscount + wholesaleDiscount,
      total,
      status: 'completed'
    };

    if (!isOnline) {
      addToQueue(saleData);
      setCart([]);
      setGlobalDiscount(0);
      setIsProcessing(false);
      toast.info("Offline: Sale queued for sync.");
      return;
    }

    try {
      const response = await axios.post('/api/sales', saleData);

      if (response.status === 201) {
        const sale = response.data;
        setLastSale({
          items: cart.map(item => ({
            name: item.isVariant ? `${item.parentProduct?.name} (${Object.values(item.product.attributes).join('/')})` : item.product.name,
            sku: item.product.sku,
            price: item.product.price,
            imei: item.imei
          })),
          payments: splitPayments,
          total,
          orderId: sale.saleNumber || sale._id
        });
        setCart([]);
        setGlobalDiscount(0);
        setIsSuccessModalOpen(true);
        fetchProducts();
        toast.success("Sale completed successfully!");
      }
    } catch (error: any) {
      console.error("Sale error:", error);
      if (error.response) {
        toast.error(error.response.data.error || "Sale failed");
      } else {
        addToQueue(saleData);
        setCart([]);
        toast.info("Network error: Sale queued for sync.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHoldCart = async () => {
    if (cart.length === 0) return;
    
    const sessionId = Math.random().toString(36).substring(7);
    const saleData = {
      items: cart.map(item => ({
        productId: item.isVariant ? item.parentProduct?._id : item.product._id,
        variantId: item.isVariant ? item.product._id : undefined,
        quantity: item.quantity,
        price: item.product.price,
        imei: item.imei
      })),
      payments: [],
      subtotal,
      discount: lineDiscounts + globalDiscount,
      total,
      status: 'held',
      sessionId
    };

    try {
      const response = await axios.post('/api/sales', saleData);

      if (response.status === 201) {
        localStorage.setItem("held_session_id", sessionId);
        setCart([]);
        toast.success("Cart held in cloud.");
      }
    } catch (error) {
      console.error("Hold error:", error);
      localStorage.setItem("held_cart", JSON.stringify(cart));
      setCart([]);
      toast.success("Cart held locally (offline).");
    }
  };

  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  const handleSplitPayment = (method: string, amount: number) => {
    setSplitPayments(prev => ({ ...prev, [method]: amount }));
  };

  const totalSplit = Object.values(splitPayments).reduce((sum, val) => sum + val, 0);
  const remainingSplit = total - totalSplit;

  return (
    <Gate id={1}>
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12"
          >
            <div className="bg-primary/10 p-10 rounded-full mb-12 animate-pulse">
              <Lock size={80} className="text-primary" />
            </div>
            <h2 className="text-6xl font-serif italic mb-4">Terminal Locked</h2>
            <p className="text-muted-foreground font-black uppercase tracking-[0.4em] mb-16">Security Protocol ID 325 Active</p>
            
            <div className="w-full max-w-sm space-y-6">
              <div className="p-8 bg-surface border border-border rounded-[2.5rem] text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Enter Manager PIN to Resume</p>
                <div className="flex justify-center gap-4 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-border" />
                  ))}
                </div>
                <button 
                  onClick={handleUnlock}
                  className="w-full bg-primary text-primary-foreground py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  Unlock Terminal
                </button>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                Switch User
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12 pb-20 h-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Point of Sale</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">High-velocity transaction matrix (ID 1)</p>
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => setIsHeldCartsModalOpen(true)}
              className="px-8 py-4 bg-surface-container-lowest border border-border rounded-2xl shadow-sm flex items-center gap-3 hover:bg-muted transition-all"
            >
              <History size={20} className="text-primary" />
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Resume Session</p>
                <p className="text-sm font-black uppercase tracking-tighter">Held Carts</p>
              </div>
            </button>
            <div className="px-8 py-4 bg-surface-container-lowest border border-border rounded-2xl shadow-sm flex items-center gap-4">
              {isOnline ? (
                <div className="flex items-center gap-3 text-green-500">
                  <Wifi size={20} className="animate-pulse" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Network Status</p>
                    <p className="text-sm font-black uppercase tracking-tighter">Live Sync</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-red-500">
                  <WifiOff size={20} />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Offline Queue</p>
                    <p className="text-sm font-black uppercase tracking-tighter">{queueLength} Pending</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 h-[calc(100vh-320px)]">
          {/* Product Selection (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-10">
            <div className="flex flex-col gap-8 bg-surface-container-lowest border border-border p-10 rounded-[4rem] shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-8 relative z-10">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={24} />
                  <input 
                    type="text" 
                    placeholder="Search Matrix (Name, SKU, IMEI)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface border border-border pl-16 pr-8 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-inner"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Gate id={137}>
                    <button 
                      onClick={() => setIsBulkModalOpen(true)}
                      className="bg-surface-container border border-border px-6 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-surface-container-high transition-all shadow-sm"
                    >
                      <Upload size={20} /> Bulk Import
                    </button>
                  </Gate>
                  <Gate id={122}>
                    <button 
                      onClick={onAddProductClick}
                      className="bg-primary text-primary-foreground px-10 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/40"
                    >
                      <Plus size={20} /> Register Asset
                    </button>
                  </Gate>
                  <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-3xl border border-border">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-4 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-surface text-primary shadow-xl ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Store size={24} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-4 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-surface text-primary shadow-xl ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Tag size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar relative z-10">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                      activeCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-surface border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
            </div>

            <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full opacity-10">
                  <Loader2 className="w-20 h-20 animate-spin text-primary mb-6" />
                  <p className="text-[12px] font-black uppercase tracking-[0.5em]">Syncing Matrix...</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6" : "flex flex-col gap-4"}>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (product.isConfigurable && product.variants && product.variants.length > 0) {
                          setSelectedProductForVariants(product);
                        } else {
                          addToCart(product);
                        }
                      }}
                      className={`bg-surface-container-lowest border border-border cursor-pointer hover:border-primary transition-all group relative overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-xl ${
                        viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-8'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="aspect-square mb-6 bg-muted rounded-[2rem] relative overflow-hidden shadow-inner">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all flex items-center justify-center">
                              {product.isConfigurable ? <ChevronRight size={32} className="text-white opacity-0 group-hover:opacity-100 transition-all" /> : <Plus size={32} className="text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />}
                            </div>
                          </div>
                          <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-2">{product.category}</div>
                          <h3 className="text-sm font-black uppercase tracking-tighter mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                          <div className="flex items-end justify-between mt-auto">
                            <div className="text-xl font-black text-primary font-mono tracking-tighter">
                              {product.isConfigurable ? 'From ' : ''}{product.price.toFixed(3)} <span className="text-[10px]">KD</span>
                            </div>
                            <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${product.stock < 5 ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                              {product.stock}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-24 h-24 bg-muted rounded-[2rem] overflow-hidden flex-shrink-0 shadow-inner">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-1">{product.category}</div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{product.name}</h3>
                            <p className="text-[10px] font-mono text-muted-foreground font-black uppercase tracking-widest opacity-60">SKU: {product.sku}</p>
                          </div>
                          <div className="text-right px-8">
                            <div className="text-3xl font-black text-primary font-mono tracking-tighter">{product.price.toFixed(3)} KD</div>
                            <div className={`text-[10px] font-black uppercase tracking-widest mt-2 ${product.stock < 5 ? 'text-red-500' : 'text-muted-foreground opacity-60'}`}>
                              {product.stock} In Stock
                            </div>
                          </div>
                          <div className="p-6 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                            {product.isConfigurable ? <ChevronRight size={32} /> : <Plus size={32} />}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Sidebar (4 cols) */}
          <div className="xl:col-span-4 flex flex-col bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl overflow-hidden relative">
            <div className="p-10 border-b border-border bg-muted/10 flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-4xl font-serif italic tracking-tight flex items-center gap-4">
                  <ShoppingCart size={32} className="text-primary" />
                  Cart
                </h2>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-3 opacity-60">{cart.length} Nodes Allocated</p>
              </div>
              <button 
                onClick={() => setCart([])} 
                className="p-5 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-[1.5rem] transition-all active:scale-90 shadow-sm"
              >
                <Trash2 size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar relative z-10">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full opacity-10"
                  >
                    <ShoppingCart size={120} className="mb-10" />
                    <p className="text-[12px] font-black uppercase tracking-[0.6em]">Matrix Empty</p>
                  </motion.div>
                ) : (
                  cart.map((item, index) => (
                    <motion.div 
                      key={`${item.product._id}-${index}`}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="p-8 bg-surface border border-border rounded-[2.5rem] space-y-6 group hover:border-primary/50 transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                          <h4 className="text-sm font-black uppercase tracking-tighter leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {item.isVariant ? `${item.parentProduct?.name} (${Object.values(item.product.attributes).join('/')})` : item.product.name}
                          </h4>
                          <p className="text-[9px] font-mono text-muted-foreground font-bold mt-1">{item.product.sku}</p>
                        </div>
                        <span className="text-xl font-black font-mono text-primary tracking-tighter">{(item.product.price * item.quantity).toFixed(3)}</span>
                      </div>
                      {item.imei && (
                        <div className="px-5 py-2 bg-indigo-500/5 text-indigo-600 rounded-xl text-[10px] font-mono font-black border border-indigo-500/10 uppercase tracking-widest">
                          Serial: {item.imei}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center bg-muted/30 border border-border rounded-2xl overflow-hidden shadow-inner">
                          <button onClick={() => updateQuantity(index, -1)} className="p-4 hover:bg-surface transition-colors text-muted-foreground"><Minus size={16} /></button>
                          <span className="px-8 text-sm font-black font-mono">{item.quantity}</span>
                          <button onClick={() => updateQuantity(index, 1)} className="p-4 hover:bg-surface transition-colors text-muted-foreground"><Plus size={16} /></button>
                        </div>
                        <Gate id={13}>
                          <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline">
                            <Percent size={14} /> Discount
                          </button>
                        </Gate>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="p-10 border-t border-border bg-muted/10 space-y-8 relative z-10">
              <LoyaltyPayment 
                totalAmount={total} 
                onRedeem={(discount) => setGlobalDiscount(prev => prev + discount)} 
              />
              
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                  <span>Subtotal Matrix</span>
                  <span className="font-mono">{subtotal.toFixed(3)} KD</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-red-500">
                  <span>Efficiency Savings</span>
                  <span className="font-mono">-{ (lineDiscounts + globalDiscount + wholesaleDiscount).toFixed(3) } KD</span>
                </div>
                <div className="flex justify-between items-end pt-8 border-t border-border">
                  <span className="text-5xl font-serif italic tracking-tighter">Total</span>
                  <div className="text-right">
                    <span className="text-6xl font-black text-primary font-mono tracking-tighter leading-none">{total.toFixed(3)}</span>
                    <span className="text-[12px] font-black text-primary ml-2 uppercase tracking-[0.4em]">KD</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={handleHoldCart}
                  className="flex items-center justify-center gap-2 py-6 border border-border rounded-[2rem] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-surface transition-all active:scale-95 shadow-sm"
                >
                  <Pause size={16} /> Hold
                </button>
                <button 
                  onClick={async () => {
                    if (cart.length === 0) return;
                    try {
                      const quoteData = {
                        items: cart.map(item => ({
                          productId: item.isVariant ? item.parentProduct?._id : item.product._id,
                          variantId: item.isVariant ? item.product._id : undefined,
                          quantity: item.quantity,
                          price: item.product.price,
                          imei: item.imei
                        })),
                        subtotal,
                        discount: lineDiscounts + globalDiscount + wholesaleDiscount,
                        total
                      };
                      const res = await axios.post('/api/quotes', quoteData);
                      toast.success(`Quote #${res.data.quoteNumber} created!`);
                    } catch (e) {
                      toast.error("Failed to create quote");
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-6 border border-border rounded-[2rem] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-surface transition-all active:scale-95 shadow-sm"
                >
                  <FileText size={16} /> Quote
                </button>
                <button 
                  onClick={() => setIsSplitModalOpen(true)}
                  className="flex items-center justify-center gap-2 py-6 border border-border rounded-[2rem] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-surface transition-all active:scale-95 shadow-sm"
                >
                  <Calculator size={16} /> Split
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'cash', icon: Banknote, label: 'Cash' },
                  { id: 'card', icon: CreditCard, label: 'Card' },
                  { id: 'knet', icon: Store, label: 'K-Net' },
                  { id: 'store_credit', icon: RefreshCcw, label: 'Credit' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center gap-3 py-6 rounded-[1.5rem] border transition-all ${
                      paymentMethod === method.id 
                        ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105 z-10' 
                        : 'bg-surface border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    <method.icon size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleProcessSale}
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-primary text-primary-foreground py-8 rounded-[2.5rem] font-black text-base uppercase tracking-[0.5em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-primary/40 flex items-center justify-center gap-6"
              >
                {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <CheckCircle2 size={28} />}
                Finalize Transaction
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      <ImeiModal 
        isOpen={isImeiModalOpen}
        onClose={() => setIsImeiModalOpen(false)}
        onConfirm={handleImeiConfirm}
        productName={pendingProduct?.name || (pendingProduct?.parentProduct?.name + ' ' + Object.values(pendingProduct?.attributes || {}).join('/'))}
        variantId={pendingProduct?.isVariant ? pendingProduct._id : undefined}
        productId={!pendingProduct?.isVariant ? pendingProduct?._id : undefined}
      />

      {/* Variant Selection Modal */}
      <AnimatePresence>
        {selectedProductForVariants && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForVariants(null)}
              className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-12 border-b border-border flex items-start justify-between">
                <div>
                  <h2 className="text-4xl font-serif italic tracking-tight">{selectedProductForVariants.name}</h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3 opacity-60">Select Variant to Add</p>
                </div>
                <button onClick={() => setSelectedProductForVariants(null)} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 grid grid-cols-2 gap-6">
                {selectedProductForVariants.variants?.map((v: any) => (
                  <button 
                    key={v._id}
                    onClick={() => addToCart(v, true, selectedProductForVariants)}
                    disabled={v.stock <= 0}
                    className="p-6 bg-surface border border-border rounded-[2rem] text-left hover:border-primary transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{v.sku}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${v.stock < 5 ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                        {v.stock}
                      </span>
                    </div>
                    <p className="text-lg font-black uppercase tracking-tighter group-hover:text-primary transition-colors">
                      {Object.values(v.attributes).join(' / ')}
                    </p>
                    <p className="text-2xl font-black font-mono text-primary mt-4">{v.price.toFixed(3)} KD</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Gate>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
