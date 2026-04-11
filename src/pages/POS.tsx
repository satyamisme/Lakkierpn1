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
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { ImeiModal } from "../components/pos/molecules/ImeiModal";
import { LoyaltyPayment } from "../components/pos/organisms/LoyaltyPayment";
import { Gate } from "../components/PermissionGuard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchProducts();
    const heldCart = localStorage.getItem("held_cart");
    if (heldCart) {
      setCart(JSON.parse(heldCart));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const productsWithImages = data.map((p: any) => ({
            ...p,
            image: p.image || `https://picsum.photos/seed/${p.sku}/400/400`
          }));
          setProducts(productsWithImages);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
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

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const wholesaleDiscount = isWholesale ? subtotal * 0.2 : 0;
  const lineDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - lineDiscounts - globalDiscount - wholesaleDiscount;

  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    const saleData = {
      items: cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        imei: item.imei
      })),
      payments: [{ method: paymentMethod, amount: total }],
      subtotal,
      discount: lineDiscounts + globalDiscount,
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
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        setCart([]);
        setGlobalDiscount(0);
        fetchProducts();
        toast.success("Sale completed successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Sale failed");
      }
    } catch (error) {
      console.error("Sale error:", error);
      addToQueue(saleData);
      setCart([]);
      toast.info("Network error: Sale queued for sync.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHoldCart = () => {
    localStorage.setItem("held_cart", JSON.stringify(cart));
    setCart([]);
    toast.success("Cart held locally.");
  };

  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  const handleSplitPayment = (method: string, amount: number) => {
    setSplitPayments(prev => ({ ...prev, [method]: amount }));
  };

  const totalSplit = Object.values(splitPayments).reduce((sum, val) => sum + val, 0);
  const remainingSplit = total - totalSplit;

  return (
    <Gate id={1}>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
        {/* Product Selection (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-8">
          <div className="flex flex-col gap-6 bg-surface-container-lowest border border-border p-6 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input 
                  type="text" 
                  placeholder="Search Matrix (Name, SKU, IMEI)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Gate id={122}>
                  <button 
                    onClick={onAddProductClick}
                    className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                  >
                    <Plus size={16} /> Register Asset
                  </button>
                </Gate>
                <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl border border-border">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-surface text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Store size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-surface text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Tag size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 border-l border-border">
                {isOnline ? (
                  <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                    <Wifi size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                    <WifiOff size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Offline ({queueLength})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                    activeCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Syncing Matrix...</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "flex flex-col gap-3"}>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className={`bg-surface-container-lowest border border-border cursor-pointer hover:border-primary transition-all group relative overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl ${
                      viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="aspect-square mb-6 bg-muted rounded-[1.5rem] relative overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                          />
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all flex items-center justify-center">
                            <Plus size={32} className="text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                          </div>
                        </div>
                        <div className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] mb-2">{product.category}</div>
                        <h3 className="text-sm font-black uppercase tracking-tighter mb-4 line-clamp-2 leading-tight">{product.name}</h3>
                        <div className="flex items-end justify-between mt-auto">
                          <div className="text-xl font-black text-primary font-mono tracking-tighter">{product.price.toFixed(3)} <span className="text-[10px]">KD</span></div>
                          <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${product.stock < 5 ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
                            {product.stock} Units
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden flex-shrink-0">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{product.category}</div>
                          <h3 className="text-base font-black uppercase tracking-tighter truncate">{product.name}</h3>
                          <p className="text-[9px] font-mono text-muted-foreground font-bold">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-primary font-mono">{product.price.toFixed(3)} KD</div>
                          <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${product.stock < 5 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {product.stock} In Stock
                          </div>
                        </div>
                        <div className="p-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Plus size={24} />
                        </div>
                      </>
                    )}
                    
                    {product.isImeiRequired && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 bg-indigo-500 text-[8px] font-black text-white uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-500/20">
                        <Tag size={10} /> Serial Required
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar (1 col) */}
        <div className="xl:col-span-1 flex flex-col bg-surface-container-lowest border border-border rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif italic tracking-tight flex items-center gap-3">
                <ShoppingCart size={24} className="text-primary" />
                Active Cart
              </h2>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{cart.length} Items Selected</p>
            </div>
            <button 
              onClick={() => setCart([])} 
              className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-95"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full opacity-20"
                >
                  <ShoppingCart size={64} className="mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Cart is empty</p>
                </motion.div>
              ) : (
                cart.map((item, index) => (
                  <motion.div 
                    key={`${item.product._id}-${index}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-black uppercase tracking-tighter leading-tight flex-1 line-clamp-2">{item.product.name}</h4>
                      <span className="text-sm font-black font-mono text-primary">{(item.product.price * item.quantity).toFixed(3)}</span>
                    </div>
                    {item.imei && (
                      <div className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg text-[9px] font-mono font-black border border-indigo-500/20">
                        IMEI: {item.imei}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(index, -1)} className="p-2 hover:bg-muted transition-colors text-muted-foreground"><Minus size={14} /></button>
                        <span className="px-4 text-xs font-black font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, 1)} className="p-2 hover:bg-muted transition-colors text-muted-foreground"><Plus size={14} /></button>
                      </div>
                      <Gate id={13}>
                        <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                          <Percent size={12} /> Discount
                        </button>
                      </Gate>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 border-t border-border bg-muted/10 space-y-6">
            <LoyaltyPayment 
              totalAmount={total} 
              onRedeem={(discount) => setGlobalDiscount(prev => prev + discount)} 
            />
            
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{subtotal.toFixed(3)} KD</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-500">
                <span>Total Savings</span>
                <span className="font-mono">-{ (lineDiscounts + globalDiscount + wholesaleDiscount).toFixed(3) } KD</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-border">
                <span className="text-3xl font-serif italic tracking-tight">Total</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-primary font-mono tracking-tighter">{total.toFixed(3)}</span>
                  <span className="text-[10px] font-black text-primary ml-1 uppercase tracking-widest">KD</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleHoldCart}
                className="flex items-center justify-center gap-3 py-4 border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
              >
                <Pause size={16} /> Hold Cart
              </button>
              <button 
                onClick={() => setIsSplitModalOpen(true)}
                className="flex items-center justify-center gap-3 py-4 border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
              >
                <Calculator size={16} /> Split Pay
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cash', icon: Banknote, label: 'Cash' },
                { id: 'card', icon: CreditCard, label: 'Card' },
                { id: 'knet', icon: Store, label: 'K-Net' },
                { id: 'store_credit', icon: RefreshCcw, label: 'Credit' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${
                    paymentMethod === method.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <method.icon size={20} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{method.label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleProcessSale}
              disabled={isProcessing || cart.length === 0}
              className="w-full bg-primary text-primary-foreground py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-primary/40 flex items-center justify-center gap-4"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 size={20} />}
              Complete Transaction
            </button>
          </div>
        </div>
      </div>

      <ImeiModal 
        isOpen={isImeiModalOpen}
        onClose={() => setIsImeiModalOpen(false)}
        onConfirm={handleImeiConfirm}
        productName={pendingProduct?.name || ""}
      />

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
