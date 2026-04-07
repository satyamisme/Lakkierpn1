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
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { ImeiModal } from "../components/pos/molecules/ImeiModal";
import { LoyaltyPayment } from "../components/pos/organisms/LoyaltyPayment";
import { Gate } from "../components/Gate";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isImeiRequired: boolean;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  imei?: string;
  discount: number; // Line-item discount
}

export const POS: React.FC = () => {
  const { hasPermission } = useAuth();
  const { addToQueue, isOnline, queueLength } = useOfflineQueue();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'knet' | 'store_credit'>('cash');
  const [splitPayments, setSplitPayments] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProducts();
    // Load held cart if exists
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
        setProducts(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Out of stock!");
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
    }
  };

  const handleImeiConfirm = (imei: string) => {
    if (pendingProduct) {
      setCart([...cart, { product: pendingProduct, quantity: 1, imei, discount: 0 }]);
      setPendingProduct(null);
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
      alert("Insufficient stock!");
      return;
    }
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const lineDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - lineDiscounts - globalDiscount;

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
      alert("Offline: Sale queued for sync.");
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
        fetchProducts(); // Refresh stock
        alert("Sale completed successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Sale failed");
      }
    } catch (error) {
      console.error("Sale error:", error);
      addToQueue(saleData);
      setCart([]);
      alert("Network error: Sale queued for sync.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHoldCart = () => {
    localStorage.setItem("held_cart", JSON.stringify(cart));
    setCart([]);
    alert("Cart held locally.");
  };

  return (
    <Gate id={1}>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
        {/* Product Selection (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <div className="flex items-center gap-4 bg-card border border-border p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search by Name, SKU, or IMEI (Ctrl+K)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted border-none pl-12 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-4 border-l border-border">
              {isOnline ? (
                <div className="flex items-center gap-2 text-green-500">
                  <Wifi size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <WifiOff size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Offline ({queueLength})</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="bg-card border border-border p-4 cursor-pointer hover:border-primary transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} className="text-primary" />
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{product.category}</div>
                    <h3 className="text-sm font-black uppercase tracking-tighter mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-end justify-between">
                      <div className="text-lg font-black text-primary font-mono">{product.price.toFixed(3)} KD</div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${product.stock < 5 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        Stock: {product.stock}
                      </div>
                    </div>
                    {product.isImeiRequired && (
                      <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                        <Tag size={10} /> IMEI Required
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar (1 col) */}
        <div className="xl:col-span-1 flex flex-col bg-card border border-border shadow-xl">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" />
              Active Cart
            </h2>
            <button onClick={() => setCart([])} className="text-muted-foreground hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                <ShoppingCart size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Cart is empty</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.product._id}-${index}`} className="p-3 bg-muted/30 border border-border space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black uppercase tracking-tighter leading-tight flex-1">{item.product.name}</h4>
                    <span className="text-xs font-black font-mono ml-2">{(item.product.price * item.quantity).toFixed(3)}</span>
                  </div>
                  {item.imei && (
                    <div className="text-[9px] font-mono text-primary font-bold">IMEI: {item.imei}</div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border bg-card">
                      <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:bg-muted transition-colors"><Minus size={12} /></button>
                      <span className="px-3 text-xs font-black font-mono">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:bg-muted transition-colors"><Plus size={12} /></button>
                    </div>
                    <Gate id={13}>
                      <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                        <Percent size={10} /> Discount
                      </button>
                    </Gate>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-border bg-muted/30 space-y-4">
            <LoyaltyPayment 
              totalAmount={total} 
              onRedeem={(discount) => setGlobalDiscount(prev => prev + discount)} 
            />
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{subtotal.toFixed(3)} KD</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-red-500">
                <span>Discount</span>
                <span className="font-mono">-{ (lineDiscounts + globalDiscount).toFixed(3) } KD</span>
              </div>
              <div className="flex justify-between text-xl font-black uppercase tracking-tighter italic pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary font-mono">{total.toFixed(3)} KD</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleHoldCart}
                className="flex items-center justify-center gap-2 py-3 border border-border font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
              >
                <Pause size={14} /> Hold
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-border font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all">
                <Calculator size={14} /> Split
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
                  className={`flex flex-col items-center justify-center gap-1 py-2 border transition-all ${
                    paymentMethod === method.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <method.icon size={16} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">{method.label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleProcessSale}
              disabled={isProcessing || cart.length === 0}
              className="w-full bg-primary text-primary-foreground py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Transaction"}
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
    </Gate>
  );
};
