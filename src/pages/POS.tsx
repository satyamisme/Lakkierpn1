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
  Printer
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
  isImeiRequired: boolean;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  imei?: string;
  discount: number; // Line-item discount
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
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
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
    // For demo, just unlock. In production, require PIN.
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
            // Map items back to cart items
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
        // Handle both array and paginated response
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

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Out of stock!");
      return;
    }

    if (product.isImeiRequired) {
      setPendingProduct(product);
      setIsImeiModalOpen(true);
    } else {
      const existing = cart.find(item => item.product._id === product._id);
      if (existing) {
        setCart(cart.map(item => 
          item.product._id === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ));
      } else {
        setCart([...cart, { product, quantity: 1, discount: 0 }]);
      }
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleImeiConfirm = (imei: string) => {
    if (pendingProduct) {
      setCart([...cart, { product: pendingProduct, quantity: 1, imei, discount: 0 }]);
      setPendingProduct(null);
      toast.success(`${pendingProduct.name} added with IMEI`);
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
        productId: item.product._id,
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
            name: item.product.name,
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
        productId: item.product._id,
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

  const handleRetrieveHeld = async (sessionId: string) => {
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
        setIsHeldCartsModalOpen(false);
        toast.success("Cart resumed successfully.");
      }
    } catch (error) {
      console.error("Resume error:", error);
      toast.error("Failed to resume cart.");
    }
  };

  return (
    <Gate id={1}>
      {/* Auto-Lock Overlay (ID 325) */}
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

              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
            </div>

            <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full opacity-10">
                  <Loader2 className="w-20 h-20 animate-spin text-primary mb-6" />
                  <p className="text-[12px] font-black uppercase tracking-[0.5em]">Syncing Matrix...</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -12 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(product)}
                      className={`bg-surface-container-lowest border border-border cursor-pointer hover:border-primary transition-all group relative overflow-hidden rounded-[3rem] shadow-sm hover:shadow-2xl ${
                        viewMode === 'grid' ? 'p-8' : 'p-6 flex items-center gap-10'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="aspect-square mb-8 bg-muted rounded-[2.5rem] relative overflow-hidden shadow-inner">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all flex items-center justify-center">
                              <Plus size={48} className="text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                            </div>
                          </div>
                          <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-3">{product.category}</div>
                          <h3 className="text-lg font-black uppercase tracking-tighter mb-6 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                          <div className="flex items-end justify-between mt-auto">
                            <div className="text-2xl font-black text-primary font-mono tracking-tighter">{product.price.toFixed(3)} <span className="text-[11px]">KD</span></div>
                            <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${product.stock < 5 ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                              {product.stock} Units
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
                            <Plus size={32} />
                          </div>
                        </>
                      )}
                      
                      {product.isImeiRequired && (
                        <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-indigo-500 text-[9px] font-black text-white uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/40">
                          <Tag size={12} /> Serial Required
                        </div>
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
                        <h4 className="text-sm font-black uppercase tracking-tighter leading-tight flex-1 line-clamp-2 group-hover:text-primary transition-colors">{item.product.name}</h4>
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
                          productId: item.product._id,
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

            {/* Background Accent */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      <ImeiModal 
        isOpen={isImeiModalOpen}
        onClose={() => setIsImeiModalOpen(false)}
        onConfirm={handleImeiConfirm}
        productName={pendingProduct?.name || ""}
      />

      <HeldCartsModal 
        isOpen={isHeldCartsModalOpen}
        onClose={() => setIsHeldCartsModalOpen(false)}
        onRetrieve={handleRetrieveHeld}
      />

      <BulkImportModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchProducts}
      />

      {/* Success Modal with Print Options */}
      <AnimatePresence>
        {isSuccessModalOpen && lastSale && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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

      {/* Split Payment Modal */}
      <AnimatePresence>
        {isSplitModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSplitModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border p-8 rounded-[3rem] shadow-2xl"
            >
              <h3 className="text-3xl font-serif italic mb-2">Split Transaction</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-8">Allocate payments across multiple methods</p>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Remaining Balance</span>
                  <span className="text-2xl font-mono font-black text-primary">{remainingSplit.toFixed(3)} KD</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['Cash', 'Card', 'K-Net', 'Store Credit'].map(method => (
                    <div key={method} className="space-y-2">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-2">{method}</label>
                      <input 
                        type="number" 
                        placeholder="0.000"
                        value={splitPayments[method] || ''}
                        onChange={(e) => handleSplitPayment(method, parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted border border-border p-3 rounded-xl text-xs font-black font-mono outline-none focus:ring-2 ring-primary/20"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-border flex gap-4">
                  <button 
                    onClick={() => {
                      setSplitPayments({});
                      setIsSplitModalOpen(false);
                    }}
                    className="flex-1 py-4 bg-muted border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsSplitModalOpen(false)}
                    className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Apply Split
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Gate>
  );
};
