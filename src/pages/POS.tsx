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
  ChevronRight,
  Zap,
  Clock,
  X,
  ArrowLeftRight,
  Scale,
  Layers,
  Activity,
  AlertCircle,
  Users,
  Gift,
  LayoutDashboard,
  LayoutList,
  List,
  Package,
  Settings,
  Smartphone,
  Scan,
  AlertTriangle,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { ImeiModal } from "../components/pos/molecules/ImeiModal";
import { LoyaltyPayment } from "../components/pos/organisms/LoyaltyPayment";
import { Gate } from "../components/PermissionGuard";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ThermalReceipt } from '../components/print/ThermalReceipt';
import { A4Invoice } from '../components/print/A4Invoice';
import { printThermalReceipt, printA4Invoice } from '../utils/documentService';
import { HeldCartsModal } from '../components/pos/molecules/HeldCartsModal';
import { CustomerSelector } from "../components/pos/molecules/CustomerSelector";
import { SalesHistory } from "../components/pos/SalesHistory";
import { ReturnsModal } from "../components/pos/molecules/ReturnsModal";
import { GiftCardModal } from "../components/pos/molecules/GiftCardModal";
import { syncPendingSales } from "../services/offlineQueue";
import { Client360 } from "../components/pos/submenus/Client360";
import { ReturnsHub } from "../components/pos/submenus/ReturnsHub";
import { SaleRecords } from "../components/pos/submenus/SaleRecords";
import { GiftsLoyalty } from "../components/pos/submenus/GiftsLoyalty";
import { InstalmentPlan } from "../components/pos/submenus/InstalmentPlan";
import { TerminalSetup } from "../components/pos/submenus/TerminalSetup";
import { NetworkMatrix } from "../components/pos/submenus/NetworkMatrix";

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
  // Deep-tech metadata
  imei?: string; 
  serial?: string;
  purchaseDate?: string;
  supplier?: string;
  warrantyPeriod?: string;
  condition?: 'New' | 'Used' | 'Refurbished';
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
  const { hasPermission, user } = useAuth();
  const { addToQueue, isOnline, queueLength } = useOfflineQueue();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanBuffer, setScanBuffer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'knet' | 'store_credit'>('cash');
  const [isWholesale, setIsWholesale] = useState(false);
  const [splitPayments, setSplitPayments] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [activeCategory, setActiveCategory] = useState('All');
  const [lastSale, setLastSale] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [discountItemIndex, setDiscountItemIndex] = useState<number | null>(null);
  const [cartNotes, setCartNotes] = useState("");
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isReturnsModalOpen, setIsReturnsModalOpen] = useState(false);
  const [isGiftCardModalOpen, setIsGiftCardModalOpen] = useState(false);
  const [isBundlesModalOpen, setIsBundlesModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm && searchTerm.length > 2) {
        setIsSearching(true);
        try {
          // Identifier-first deep lookup (ID 319)
          const response = await axios.get(`/api/products/search?q=${searchTerm}`);
          const results = response.data;
          setSearchResults(results);

          // Fast-track: if search term is a unique identifier and we have exactly one match
          if (results.length === 1 && results[0].imei === searchTerm) {
            addToCart(results[0], results[0].isVariant, results[0].parentProduct);
            setSearchTerm("");
            setSearchResults([]);
            toast.success(`Identifier Matrix Match: ${results[0].name} resolved`);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  const [taxRate, setTaxRate] = useState(0); // 0% by default in Kuwait
  
  const [activeStage, setActiveStage] = useState<'grid' | 'exchange' | 'customers' | 'loyalty' | 'receipts' | 'sync' | 'layaway' | 'tax' | 'bundles' | 'records' | 'instalments' | 'setup' | 'network'>('grid');
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayTransactions: 0
  });
  
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(user?.storeId || null);

  // Terminal Logic Configuration (Manager Controlled)
  const [roundingMethod, setRoundingMethod] = useState<'none' | '5fils' | '10fils'>('5fils');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [isSupervisorSession, setIsSupervisorSession] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(true);

  useEffect(() => {
    // Audit Wiring: Handle paths from the Sidebar Navigation Matrix
    const path = location.pathname;
    
    // Default switch
    if (path.includes('/pos/grid')) setActiveStage('grid');
    else if (path.includes('/pos/exchange')) setActiveStage('exchange');
    else if (path.includes('/pos/customers')) setActiveStage('customers');
    else if (path.includes('/pos/loyalty')) setActiveStage('loyalty');
    else if (path.includes('/pos/receipts')) setActiveStage('receipts');
    else if (path.includes('/pos/sync')) setActiveStage('sync');
    else if (path.includes('/pos/layaway')) setActiveStage('layaway');
    else if (path.includes('/pos/tax')) {
      setActiveStage('grid');
      setShowConfigPanel(true);
    }
    else if (path.includes('/pos/bundles')) {
      setActiveStage('grid'); // Bundles are now part of the grid flow
    }
    else if (path.includes('/pos/payments')) setIsSplitModalOpen(true);
    else setActiveStage('grid');

    // Keep some as modals for quick overlay if designated
    if (path.includes('/pos/payments')) setIsSplitModalOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Barcode scanners usually end with 'Enter'
      if (e.key === 'Enter') {
        if (scanBuffer) {
          handleBarcode(scanBuffer);
          setScanBuffer("");
        }
      } else if (e.key.length === 1) {
        setScanBuffer(prev => prev + e.key);
        // Clear buffer if there is a long delay (timeout)
        setTimeout(() => setScanBuffer(""), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanBuffer, products]);

  const handleBarcode = async (barcode: string) => {
    // Identifier-first deep lookup (ID 319)
    try {
      const response = await axios.get(`/api/products/search?q=${barcode}`);
      const results = response.data;
      
      if (results.length > 0) {
        // If results contain exactly the scanned barcode as a unique identifier (IMEI/Serial)
        const exactMatch = results.find((r: any) => 
          r.sku === barcode || 
          r.imei === barcode || 
          r.serial === barcode
        ) || results[0];

        if (exactMatch.isConfigurable && !exactMatch.isVariant) {
          setSelectedProductForVariants(exactMatch);
        } else {
          addToCart(exactMatch, exactMatch.isVariant, exactMatch.parentProduct);
        }
        return;
      }
      
      toast.error(`Unknown Identifier: ${barcode}`);
    } catch (e) {
      console.error("Barcode scan API error:", e);
      toast.error("Scanning synchronization failed");
    }
  };

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

  const fetchStores = async () => {
    try {
      const res = await axios.get('/api/stores');
      setStores(res.data);
      if (!selectedStoreId && res.data.length > 0) {
        setSelectedStoreId(res.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setLastActivity(Date.now());
  };

  const resumeHeldSession = async (customSessionId?: string) => {
    const sessionId = customSessionId || localStorage.getItem("held_session_id");
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
          setIsHeldCartsModalOpen(false);
          toast.success("Resumed held session from cloud.");
        }
      } catch (error) {
        console.error("Resume error:", error);
      }
    }
    
    if (!customSessionId) {
      const heldCart = localStorage.getItem("held_cart");
      if (heldCart) {
        setCart(JSON.parse(heldCart));
        localStorage.removeItem("held_cart");
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStores();
    resumeHeldSession();
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/analytics/summary');
        if (res.data) setStats({
          todayRevenue: res.data.todayRevenue || 0,
          todayTransactions: res.data.todaySales || 0
        });
      } catch (e) { console.error(e); }
    };
    fetchStats();
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
      const searchTermLower = searchTerm.toLowerCase();
      // Audit Wiring: Detailed Deep Match across all telemetry fields
      const matchesSearch = p.name.toLowerCase().includes(searchTermLower) ||
                          p.sku.toLowerCase().includes(searchTermLower) ||
                          (p.imei && p.imei.toLowerCase().includes(searchTermLower)) ||
                          (p.serial && p.serial.toLowerCase().includes(searchTermLower)) ||
                          (p.brand && p.brand.toLowerCase().includes(searchTermLower)) ||
                          (p.category && p.category.toLowerCase().includes(searchTermLower)) ||
                          (p.supplier && p.supplier.toLowerCase().includes(searchTermLower)) ||
                          (p.condition && p.condition.toLowerCase().includes(searchTermLower));
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

    // Auto-update optimization: if unit already has an identifier vector, bypass modal
    const preDefinedImei = item.imei || item.serial;

    if (requiresImei && !preDefinedImei) {
      setPendingProduct({ ...item, isVariant, parentProduct });
      setIsImeiModalOpen(true);
    } else {
      const existing = cart.find(ci => ci.product._id === item._id && (!requiresImei || ci.imei === preDefinedImei));
      if (existing && !requiresImei) {
        setCart(cart.map(ci => 
          ci.product._id === item._id 
            ? { ...ci, quantity: ci.quantity + 1 } 
            : ci
        ));
      } else {
        setCart([...cart, { 
          product: item, 
          quantity: 1, 
          imei: preDefinedImei,
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
      // Compliance Check: Bind to existing item missing vector
      const missingIndex = cart.findIndex(item => 
        (item.isVariant ? item.product._id === pendingProduct._id : item.product._id === pendingProduct._id) && 
        !item.imei && 
        (item.product.isImeiRequired || item.product.isSerialRequired)
      );

      if (missingIndex > -1) {
        const newCart = [...cart];
        newCart[missingIndex] = { ...newCart[missingIndex], imei };
        setCart(newCart);
        toast.success("Identifier bound to existing cart vector");
      } else {
        setCart([...cart, { 
          product: pendingProduct, 
          quantity: 1, 
          imei, 
          discount: 0,
          isVariant: pendingProduct.isVariant,
          parentProduct: pendingProduct.parentProduct
        }]);
        toast.success("New item added with identification vector");
      }
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
      toast.error("Insufficient stock!");
      return;
    }
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + ((item.product.price || 0) * (item.quantity || 0)), 0);
  const wholesaleDiscount = isWholesale ? subtotal * 0.2 : 0;
  const lineDiscounts = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
  
  const calculatedGlobalDiscount = discountType === 'percentage' ? (subtotal * (globalDiscount / 100)) : globalDiscount;
  const totalBeforeTax = Math.max(0, subtotal - lineDiscounts - calculatedGlobalDiscount - wholesaleDiscount);
  const taxAmount = totalBeforeTax * taxRate;
  
  let total = totalBeforeTax + taxAmount;
  
  // Precision Rounding Protocol (KW Standards)
  if (roundingMethod === '5fils') {
    total = Math.round(total * 200) / 200;
  } else if (roundingMethod === '10fils') {
    total = Math.round(total * 100) / 100;
  }
  
  const roundingDifference = total - (totalBeforeTax + taxAmount);

  const handleProcessSale = async (forcedStatus?: string) => {
    if (cart.length === 0) return;
    
    const finalStatus = forcedStatus || 'completed';
    const currentStoreId = selectedStoreId || user?.storeId;

    if (!currentStoreId) {
      toast.error("Terminal Node Error: No Store Assigned. Please configure in Settings.");
      return;
    }

    const totalSplit = Object.values(splitPayments).reduce((sum, val) => sum + val, 0);
    
    if (finalStatus === 'completed' && Object.keys(splitPayments).length > 0 && Math.abs(totalSplit - total) > 0.001) {
      toast.error(`Payment mismatch: Total paid (${totalSplit.toFixed(3)}) must equal sale total (${total.toFixed(3)})`);
      return;
    }

    const missingIdentifiers = cart.filter(item => 
      (item.product.isImeiRequired || item.product.isSerialRequired) && !item.imei
    );

    if (missingIdentifiers.length > 0 && finalStatus === 'completed') {
      toast.error(`Compliance Warning: ${missingIdentifiers.length} items missing identification vector.`);
      const firstMissing = missingIdentifiers[0];
      setPendingProduct({
        ...firstMissing.product,
        // Carry over variant info for the modal
        isVariant: firstMissing.isVariant,
        parentProduct: firstMissing.parentProduct,
        attributes: firstMissing.product.attributes
      } as any);
      setIsImeiModalOpen(true);
      return;
    }

    setIsProcessing(true);
    
    const payments = Object.keys(splitPayments).length > 0 
      ? Object.entries(splitPayments)
          .filter(([_, amount]) => (amount as number) > 0)
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
        tax: taxAmount,
        status: finalStatus,
        customerId: selectedCustomer?._id,
        storeId: selectedStoreId || user?.storeId,
        notes: cartNotes
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
          ...sale,
          items: cart.map(item => ({
            name: item.isVariant ? `${item.parentProduct?.name} (${Object.values(item.product.attributes).join('/')})` : item.product.name,
            sku: item.product.sku,
            price: item.product.price,
            imei: item.imei,
            quantity: item.quantity
          })),
          customer: selectedCustomer
        });
        setCart([]);
        setGlobalDiscount(0);
        setCartNotes("");
        setSplitPayments({});
        setIsSuccessModalOpen(true);
        fetchProducts();
        toast.success("Transaction Record Created!");
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
    
    const currentStoreId = selectedStoreId || user?.storeId;
    if (!currentStoreId) {
      toast.error("Terminal Node Error: No Store Assigned.");
      return;
    }

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
        sessionId,
        customerId: selectedCustomer?._id,
        userId: user?.id,
        storeId: selectedStoreId || user?.storeId
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
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-12"
          >
            <div className="bg-white/5 p-10 rounded-full mb-12 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              <Lock size={60} className="text-white/20" />
            </div>
            <h2 className="text-5xl font-serif italic tracking-tighter text-white mb-4">Terminal Suspended</h2>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-16">Security Protocol ID 325 Active</p>
            
            <div className="w-full max-w-sm space-y-6">
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center shadow-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-6">Enter Authorization Vector</p>
                <div className="flex justify-center gap-4 mb-10">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white/10" />
                  ))}
                </div>
                <button 
                  onClick={handleUnlock}
                  className="w-full bg-primary-foreground text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary-foreground/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Unlock Terminal
                </button>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
              >
                Switch Operator
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="flex gap-6 h-full min-h-0">
          {/* Nav Sidebar (8 Submenu Matrix) */}
          <aside className="w-20 lg:w-28 bg-surface-container-low/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] flex flex-col items-center py-8 space-y-1 relative overflow-hidden flex-shrink-0">
             <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[40px] pointer-events-none" />
             {[
               { id: 'grid', label: 'Terminal', icon: Smartphone, title: 'Main POS Terminal Matrix' },
               { id: 'customers', label: 'Client 360', icon: Users, title: 'Customer Lead & CRM Vector' },
               { id: 'exchange', label: 'Returns', icon: RefreshCcw, title: 'Exchange & Returns Hub' },
               { id: 'records', label: 'Records', icon: History, title: 'Historical Sale Records Audit' },
               { id: 'loyalty', label: 'Loyalty', icon: Gift, title: 'Loyalty Rewards & Gift Matrix' },
               { id: 'instalments', label: 'Instalment', icon: CreditCard, title: 'Instalment Payment Monitoring' },
               { id: 'setup', label: 'Setup', icon: Settings, title: 'Terminal Configuration & Setup' },
               { id: 'network', label: 'Network', icon: Activity, title: 'Regional Cluster & Sync Performance' },
             ].map((item) => (
               <button 
                key={item.id}
                onClick={() => setActiveStage(item.id as any)}
                title={item.title}
                className={`w-full px-2 group flex flex-col items-center py-3 transition-all relative ${activeStage === item.id ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}
               >
                 {activeStage === item.id && (
                   <motion.div layoutId="nav-glow" className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                 )}
                 <div className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${activeStage === item.id ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-110 text-white' : 'bg-white/5 border-white/5 text-white shadow-sm'}`}>
                    <item.icon size={20} />
                 </div>
                 <span className="text-[6px] font-black uppercase tracking-[0.3em] mt-3 lg:block text-center">{item.label}</span>
               </button>
             ))}
          </aside>

          <div className="flex-1 space-y-8 pb-4 h-full flex flex-col min-w-0">
            <header className="flex items-center justify-between p-3 bg-surface-container-low/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/20 shadow-lg shadow-primary/10">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight uppercase leading-none text-white">Terminal.OS</h1>
                <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(46,125,50,0.6)]" />
              </div>
              <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.4em] mt-1.5">v3.0.0-REFRACTIVE • {isOnline ? 'NODE_SYNC' : 'LOCAL_CACHE'}</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 px-8 border-x border-white/5">
             <div className="flex flex-col gap-1.5">
                <span className="text-[6px] font-black uppercase tracking-widest text-white/20">Flux Stability</span>
                <div className="flex gap-0.5">
                   {[1,2,3,4,5].map(i => <div key={i} className={`w-2.5 h-1 rounded-[1px] ${i <= (isOnline ? 5 : 1) ? 'bg-secondary' : 'bg-white/5'}`} />)}
                </div>
             </div>
             <div className="flex flex-col gap-1.5">
                <span className="text-[6px] font-black uppercase tracking-widest text-white/20">Active Authority</span>
                <div className="flex items-center gap-1.5 text-white/40">
                   <Tag size={10} className="text-primary-foreground" />
                   <span className="text-[8px] font-mono font-black tracking-tighter shrink-0">{stores.find(s => s._id === (selectedStoreId || user?.storeId))?.name || 'ROOT'}</span>
                </div>
             </div>
          </div>           <div className="flex items-center gap-1.5">
            {[
              { id: 'config', icon: Settings, action: () => setShowConfigPanel(true), title: 'Global Terminal Configuration' },
              { id: 'history', icon: History, action: () => setIsHistoryModalOpen(true), title: 'Daily Order History Vector' },
              { id: 'held', icon: Pause, action: () => setIsHeldCartsModalOpen(true), title: 'Held Cart Registry' },
              { id: 'telemetry', icon: Activity, action: () => setIsDetailedView(!isDetailedView), active: isDetailedView, title: 'Toggle Detailed Data Telemetry' },
              { id: 'operator', icon: Users, action: () => setActiveStage('customers'), active: activeStage === 'customers', title: 'Agent & Lead Vector Matrix' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={btn.action}
                title={btn.title}
                className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center group ${
                  btn.active 
                    ? 'bg-primary/30 border-primary-foreground/50 text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10 hover:border-white/10 shadow-sm'
                }`}
              >
                <btn.icon size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            ))}
            
            <div className="h-6 w-px bg-white/5 mx-1" />
            
            <div className="flex items-center gap-3 px-4 py-1.5 bg-surface-container-high/40 rounded-xl border border-white/5 group hover:border-primary-foreground/30 transition-all shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 w-8 h-full bg-secondary/5 rotate-12 -mr-4 pointer-events-none" />
               <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-[10px] shadow-sm ring-1 ring-emerald-500/20">
                    {user?.name?.charAt(0) || 'L'}
                  </div>
                  <div className="text-left">
                    <p className="text-[6px] font-black text-white/20 uppercase tracking-widest leading-none">Supervisor Access</p>
                    <p className="text-[9px] font-black uppercase text-white tracking-tighter mt-1">{user?.name || 'Lakki Admin'}</p>
                  </div>
               </div>
               <div className="w-px h-6 bg-white/5" />
               <div className="text-right">
                  <p className="text-[6px] font-black text-white/20 uppercase tracking-widest leading-none">Shift Prod.</p>
                  <p className="text-[9px] font-black text-emerald-500 font-mono mt-1">104%</p>
               </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Main Stage Selection (8 cols) */}
          <div className="xl:col-span-8 flex flex-col min-h-0 space-y-6">
            {activeStage === 'grid' && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex flex-col gap-6 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden flex-1 group/matrix hover:border-primary/20 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none opacity-0 group-hover/matrix:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10 w-full">
                  <div className="flex-1">
                    <CustomerSelector 
                      selectedCustomer={selectedCustomer}
                      onSelect={setSelectedCustomer}
                    />
                  </div>
                  <div className="w-[1px] h-8 bg-white/5 mx-1" />
                  <button 
                    onClick={async () => {
                      try {
                        const res = await axios.get('/api/reports/z-report', { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `Z-Report-${new Date().toISOString().split('T')[0]}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Z-Report Matrix Generated");
                      } catch (e) {
                        toast.error("Failed to generate report");
                      }
                    }}
                    className="px-5 py-2.5 bg-surface-container-high border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-surface-container-highest transition-all text-white shadow-sm"
                  >
                    <FileText size={12} /> Z-Report
                  </button>
                </div>

              <div className="flex items-center gap-4 relative z-10 mt-2">
                  <div className="relative flex-1 group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all ${searchTerm ? 'text-primary' : 'text-white/10'}`} size={16} />
                    <input 
                      type="text" 
                      placeholder="GLOBAL SEARCH (PRODUCT, SKU, IMEI, SERIAL)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/5 pl-12 pr-16 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] text-white placeholder:text-white/10 outline-none focus:border-primary focus:bg-white/[0.05] transition-all shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                       {searchTerm && (
                         <button onClick={() => setSearchTerm("")} className="p-1.5 hover:bg-white/5 rounded-md text-white/30"><X size={12} /></button>
                       )}
                       {isSearching && <Loader2 size={14} className="animate-spin text-primary" />}
                       <div className="w-px h-6 bg-white/5 mx-1" />
                       <div className="p-1 bg-white/5 rounded-lg text-primary shadow-sm">
                         <Scan size={14} className={searchTerm ? 'animate-pulse' : 'opacity-40'} />
                       </div>
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-3 bg-surface-container-low/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl z-[1000] overflow-hidden p-3"
                        >
                           <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-2">
                             {searchResults.map((p) => (
                               <button 
                                 key={p._id}
                                 onClick={() => {
                                   addToCart(p);
                                   setSearchTerm("");
                                   setSearchResults([]);
                                 }}
                                 className="w-full p-4 flex items-center gap-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-primary/30 transition-all text-left group"
                               >
                                  <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                     <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className="text-[10px] font-black uppercase text-white tracking-widest truncate">{p.name}</p>
                                     <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{p.sku}</span>
                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{p.stock} units</span>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-sm font-black text-primary font-mono">{p.price.toFixed(3)}</p>
                                     <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-0.5">KD</p>
                                  </div>
                               </button>
                             ))}
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                
                <div className="flex items-center gap-3">
                  <Gate id={121}>
                    <button 
                      onClick={() => setIsBulkModalOpen(true)}
                      title="Bulk Inventory Intake & Processing Hub"
                      className="bg-white/[0.02] border border-white/5 px-5 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 hover:bg-white/5 transition-all shadow-sm text-white/40 hover:text-white"
                    >
                      <Upload size={14} /> Bulk
                    </button>
                  </Gate>
                  <Gate id={122}>
                    <button 
                      onClick={onAddProductClick}
                      title="Register New Unit Vector to Registry"
                      className="bg-primary-foreground text-white px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary-foreground/20"
                    >
                      <Plus size={14} /> Register
                    </button>
                  </Gate>
                  <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setIsWholesale(!isWholesale)}
                      title="Toggle Wholesale B2B Pricing Matrix"
                      className={`px-4 py-2.5 rounded-xl transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${isWholesale ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/10' : 'text-white/20 hover:text-white/40'}`}
                    >
                      <Zap size={12} fill={isWholesale ? 'currentColor' : 'none'} /> Wholesale
                    </button>
                    <div className="w-px h-6 bg-white/5 mx-1" />
                    <button 
                      onClick={() => setViewMode('grid')}
                      title="Density View: High-Performance Product Grid"
                      className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-white shadow-xl' : 'text-white/10 hover:text-white/30'}`}
                    >
                      <Store size={18} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      title="Inventory View: Detailed Analytical List"
                      className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary/20 text-white shadow-xl' : 'text-white/10 hover:text-white/30'}`}
                    >
                      <Tag size={18} />
                    </button>
                    <button 
                      onClick={() => setViewMode('table')}
                      title="Tabular Matrix: Rapid Asset Audit View"
                      className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-primary/20 text-white shadow-xl' : 'text-white/10 hover:text-white/30'}`}
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar relative z-10 pr-20">
                <button
                  onClick={() => setActiveCategory('All')}
                  title="Show All Inventory Segments"
                  className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border whitespace-nowrap ${
                    activeCategory === 'All' ? 'bg-primary-foreground text-white border-primary-foreground shadow-2xl shadow-primary-foreground/20 scale-105 z-10' : 'bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20'
                  }`}
                >
                  All Segments
                </button>
                {categories.filter(c => c !== 'All').map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    title={`Filter by ${cat} Domain`}
                    className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border whitespace-nowrap ${
                      activeCategory === cat ? 'bg-primary-foreground text-white border-primary-foreground shadow-2xl shadow-primary-foreground/20 scale-105 z-10' : 'bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* Affinity Suggestions Bar */}
              {cart.length > 0 && cart.some(i => i.product.category === 'Phones') && activeCategory !== 'Accessories' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center justify-between relative z-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Zap size={14} className="fill-primary" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary italic">Affinity Boost: Complete with Protective Gear (Accessories)</p>
                  </div>
                  <button 
                    onClick={() => setActiveCategory('Accessories')}
                    className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Switch to Accessories
                  </button>
                </motion.div>
              )}

              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar scroll-smooth overflow-x-hidden">
               <div className="pr-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-10">
                      <Loader2 className="w-20 h-20 animate-spin text-primary mb-6" />
                      <p className="text-[12px] font-black uppercase tracking-[0.5em]">Syncing Matrix...</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {viewMode === 'table' ? (
                     <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse table-auto">
                           <thead>
                              <tr className="bg-white/5 border-b border-white/5">
                                 <th className="px-6 py-4 text-[8px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">Identifier</th>
                                 <th className="px-6 py-4 text-[8px] font-black text-white/20 uppercase tracking-widest">Asset Name</th>
                                 <th className="px-6 py-4 text-[8px] font-black text-white/20 uppercase tracking-widest text-right">Unit Val</th>
                                 <th className="px-6 py-4 text-[8px] font-black text-white/20 uppercase tracking-widest text-center">Depth</th>
                                 <th className="px-6 py-4 text-[8px] font-black text-white/20 uppercase tracking-widest text-center">Identity Vector</th>
                                 <th className="px-6 py-4 text-[8px] font-black text-white/20 uppercase tracking-widest text-right">Vector</th>
                              </tr>
                           </thead>
                           <tbody>
                              {filteredProducts.map((product) => (
                                <tr 
                                  key={product._id}
                                  onClick={() => addToCart(product)}
                                  className="border-b border-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group"
                                  title={`Click to add ${product.name} to transaction matrix`}
                                >
                                   <td className="px-6 py-4">
                                      <p className="text-[9px] font-black text-white/40 font-mono tracking-tighter">{product.sku}</p>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-4">
                                         <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden shadow-inner">
                                            <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                         </div>
                                         <div className="min-w-0">
                                            <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{product.name}</p>
                                            <p className="text-[7px] font-black text-primary/40 uppercase mt-0.5">{product.brand}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <p className="text-[12px] font-black text-white font-mono">{product.price.toFixed(3)}</p>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${product.stock < 10 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                         {product.stock} units
                                      </span>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex flex-col gap-1 items-center">
                                         {product.imei ? (
                                           <span className="text-[8px] font-mono text-primary font-black uppercase tracking-tighter px-1.5 py-0.5 bg-primary/10 rounded">I:{product.imei}</span>
                                         ) : product.serial ? (
                                           <span className="text-[8px] font-mono text-white/40 font-black uppercase tracking-tighter px-1.5 py-0.5 bg-white/5 rounded">S:{product.serial}</span>
                                         ) : (
                                           <span className="text-[6px] font-black opacity-10 uppercase italic">Untracked</span>
                                         )}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">Add+</button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  ) : (
                    <div className="space-y-12">
                      <div className={viewMode === 'grid' ? "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3" : "flex flex-col gap-2"}>
                        {filteredProducts.map((product) => (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (product.isConfigurable && product.variants && product.variants.length > 0) {
                            setSelectedProductForVariants(product);
                          } else {
                            addToCart(product);
                          }
                        }}
                        className={`bg-surface-container-lowest border border-border cursor-pointer hover:border-primary transition-all group relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl ${
                          viewMode === 'grid' ? 'p-2 pb-3' : 'p-3 flex items-center gap-6'
                        }`}
                      >
                        {viewMode === 'grid' ? 
                          <>
                            <div className="aspect-square bg-muted rounded-lg relative overflow-hidden shadow-inner flex items-center justify-center mb-2">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                              />
                                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-20">
                                  <span className="px-1.5 py-0.5 bg-black/80 text-white text-[7px] font-black uppercase tracking-widest rounded shadow-xl border border-white/10 backdrop-blur-md" title="Asset Registry Key (SKU)"> {product.sku}</span>
                                  {product.imei && (
                                    <span className="px-1.5 py-0.5 bg-primary/90 text-white text-[6px] font-black uppercase tracking-widest rounded shadow-xl border border-white/10 flex items-center gap-1 animate-in fade-in slide-in-from-left-2" title="Synchronized IMEI Identifier Vector">
                                      <Smartphone size={6} /> {product.imei.slice(-8)}
                                    </span>
                                  )}
                                  {!product.imei && product.serial && (
                                    <span className="px-1.5 py-0.5 bg-white/30 text-white text-[6px] font-black uppercase tracking-widest rounded shadow-xl border border-white/10 backdrop-blur-lg flex items-center gap-1 animate-in fade-in slide-in-from-left-2" title="Hardware Serial Number Registry">
                                      <Layers size={6} /> {product.serial.slice(-8)}
                                    </span>
                                  )}
                                </div>
                              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all flex items-center justify-center">
                                {product.isConfigurable ? <ChevronRight size={16} className="text-white opacity-0 group-hover:opacity-100" /> : <Plus size={16} className="text-white opacity-0 group-hover:opacity-100" />}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-0.5 gap-2">
                              <div className="text-[6px] font-black text-primary/60 uppercase tracking-widest truncate flex-1">{product.category}</div>
                              <div className={`text-[7px] font-mono font-black uppercase whitespace-nowrap ${product.stock < 5 ? 'text-red-500' : 'text-white/20'}`}>
                                {product.stock < 5 ? 'Low' : 'Stk'}: {product.stock}
                              </div>
                            </div>

                            <h3 className="font-black uppercase tracking-tight transition-colors group-hover:text-primary text-sm line-clamp-2 h-7 leading-tight mb-2" title={product.name}>
                              {product.name}
                            </h3>
                            
                            <div className="flex items-end justify-between mt-auto">
                              <div>
                                <p className="text-[10px] font-black text-primary font-mono tracking-tighter">
                                  {product.price.toFixed(3)} <span className="text-[7px]">KD</span>
                                </p>
                                <p className="text-[6px] font-black text-white/10 uppercase tracking-widest mt-0.5">{product.sku}</p>
                              </div>
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-sm ${product.stock < 5 ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`} title="Add Unit to Registry">
                                 <Plus size={12} />
                              </div>
                            </div>
                          </>
                         : 
                          <>
                            <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                              />
                            </div>
                            <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">{product.brand || 'GENERIC'}</span>
                                  <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${
                                    product.condition === 'New' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    product.condition === 'Refurbished' ? 'bg-amber-500/10 text-amber-500' : 
                                    'bg-sky-500/10 text-sky-500'
                                  }`}>{product.condition}</span>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{product.name}</h3>
                                <div className="flex gap-3 mt-1.5">
                                  <span className="text-[8px] font-mono text-muted-foreground font-black">SKU: {product.sku}</span>
                                </div>
                              </div>

                              <div className="col-span-3">
                                 <div className="flex flex-col gap-1.5">
                                    {product.imei && (
                                      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg group-hover:bg-primary/10 transition-colors" title="IMEI Matrix Authenticated">
                                        <Smartphone size={12} className="text-primary" />
                                        <span className="text-[9px] font-mono font-black text-primary tracking-tight">{product.imei}</span>
                                      </div>
                                    )}
                                    {product.serial && (
                                      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 group-hover:border-white/20 transition-all" title="Serial Number Vector Entry">
                                        <Layers size={12} className="text-white/40" />
                                        <span className="text-[9px] font-mono font-black text-white/50 truncate tracking-tight">{product.serial}</span>
                                      </div>
                                    )}
                                 </div>
                              </div>
                              
                              <div className="col-span-2">
                                <div className="flex flex-col border-l-2 border-primary/20 pl-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[7px] font-black uppercase text-muted-foreground opacity-40">Stock Vector</span>
                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[40px]">
                                      <div className={`h-full ${product.stock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, product.stock * 2)}%` }} />
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-black whitespace-nowrap mt-1">{product.stock} Units</span>
                                  <span className="text-[7px] font-bold text-primary/40 truncate italic">WH-KUWAIT_A04</span>
                                </div>
                              </div>

                              <div className="col-span-2 text-right">
                                 <div className="inline-block px-3 py-1 bg-surface/50 border border-border/50 rounded-lg">
                                    <div className="flex flex-col items-end">
                                       <span className="text-[6px] font-black uppercase text-muted-foreground opacity-60">Market Trend</span>
                                       <div className="flex items-center gap-0.5 h-4 mt-1">
                                          {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                                            <div key={i} className="w-1 rounded-sm bg-white/5" style={{ height: `10%` }} />
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="col-span-2 text-right px-4">
                                 <div className="text-xl font-black text-primary font-mono tracking-tighter" title="Unit Price (Inc. Tax)">{product.price.toFixed(3)} <span className="text-[8px]">KD</span></div>
                                 <div className="flex items-center justify-end gap-1 mt-1">
                                    <Scale size={10} className="text-muted-foreground opacity-40" />
                                    <span className="text-[8px] font-black text-muted-foreground opacity-40 uppercase">Inc. VAT</span>
                                 </div>
                              </div>
                            </div>
                            
                            <div className="w-12 h-12 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-5 group-hover:translate-x-0 bg-primary/10 rounded-xl">
                              {product.isConfigurable ? <ChevronRight size={24} /> : <Plus size={24} />}
                            </div>
                          </>
                        }
                      </motion.div>
                        ))}
                      </div>

                    {/* Summary Dashboard Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                      {[
                        { label: "Today's Revenue", value: `KD ${stats.todayRevenue.toFixed(3)}`, sub: "Live Session", icon: Activity, title: 'Aggregated Daily Revenue Matrix' },
                        { label: "Units Sold", value: `${stats.todayTransactions} Transactions`, sub: "Recent Volume", icon: ShoppingCart, title: 'Total Inventory Throughput' },
                        { label: "Critical SKU", value: `${products.filter((p: any) => p.stock < 5).length} SKU Alerts`, sub: "Below Threshold", icon: AlertTriangle, color: 'text-amber-500', title: 'Low Stock & Variance Vectors' },
                        { label: "Connectivity", value: isOnline ? "Active" : "Isolated", sub: isOnline ? "Synced" : "Queued", icon: ShieldCheck, color: isOnline ? 'text-emerald-500' : 'text-red-500', title: 'Network Connectivity Status' }
                      ].map((card, i) => (
                        <div key={i} title={card.title} className="bg-surface-container-low/40 border border-white/5 p-5 rounded-[1.5rem] flex items-center gap-5 group hover:bg-white/[0.02] transition-all cursor-help">
                          <div className={`p-3 bg-white/5 rounded-xl ${card.color || 'text-primary-foreground'} border border-white/5 shadow-sm group-hover:scale-110 transition-transform`}>
                            <card.icon size={20} />
                          </div>
                          <div>
                            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">{card.label}</p>
                            <div className="flex items-center gap-2">
                               <h4 className="text-sm font-black whitespace-nowrap text-white">{card.value}</h4>
                            </div>
                            <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-0.5">{card.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    )}

        {activeStage === 'customers' && (
          <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <Client360 />
          </div>
        )}

            {activeStage === 'exchange' && (
              <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                 <ReturnsHub />
              </div>
            )}

            {activeStage === 'records' && (
              <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                 <SaleRecords />
              </div>
            )}

            {activeStage === 'loyalty' && (
              <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                 <GiftsLoyalty />
              </div>
            )}

            {activeStage === 'instalments' && (
              <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                 <InstalmentPlan />
              </div>
            )}

            {activeStage === 'setup' && (
              <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                 <TerminalSetup />
              </div>
            )}

            {activeStage === 'network' && (
              <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                 <NetworkMatrix />
              </div>
            )}

            {activeStage === 'sync' && (
             <div className="flex-1 bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-16 text-center animate-in zoom-in duration-500 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-inner ${isOnline ? 'bg-green-500/5 text-green-400' : 'bg-red-500/5 text-red-400'}`}>
                  {isOnline ? <Wifi size={40} /> : <WifiOff size={40} />}
                </div>
                <h2 className="text-5xl font-serif italic tracking-tighter text-white mb-2">Sync Engine Obsidian</h2>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-12 leading-none">Cluster status: {isOnline ? 'Active Cloud' : 'Isolated Persistence'}</p>
                
                <div className="w-full max-w-lg p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8 shadow-inner">
                  <div className="flex justify-between items-center">
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/20 text-left">Local Storage Depth</p>
                     <p className="text-2xl font-mono text-white/80">{queueLength} SKUs</p>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: isOnline ? '100%' : '20%' }} className={`h-full ${isOnline ? 'bg-primary-foreground' : 'bg-red-500'}`} />
                  </div>
                  {queueLength > 0 && isOnline && (
                    <button onClick={() => syncPendingSales()} className="w-full py-5 bg-primary-foreground text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] shadow-2xl shadow-primary-foreground/20 transition-all">Flush Matrix Queue</button>
                  )}
                </div>
                <button onClick={() => navigate('/pos/grid')} className="mt-12 text-[9px] font-black text-white/10 uppercase tracking-[0.4em] hover:text-white transition-colors">Abort Sync Overview</button>
             </div>
          )}

          {activeStage === 'grid' && (
            <AnimatePresence>
              {showConfigPanel && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-3xl flex items-center justify-center p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                >
                  <div className="bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                    <div className="p-10 border-b border-white/5 bg-white/[0.02] flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-serif italic tracking-tighter text-white">Terminal Logic</h2>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-3 leading-none">Operational Config Matrix</p>
                      </div>
                      <button onClick={() => setShowConfigPanel(false)} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"><X size={20} /></button>
                    </div>
                    
                    <div className="p-12 space-y-12 overflow-y-auto">
                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block">VAT Allocation (%)</label>
                        <div className="flex gap-4">
                          {[0, 5, 10, 15].map(rate => (
                            <button 
                              key={rate}
                              onClick={() => setTaxRate(rate / 100)}
                              className={`flex-1 py-6 rounded-3xl font-mono text-xl transition-all border ${taxRate === rate/100 ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-surface border-border hover:border-primary/40'}`}
                            >
                              {rate}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block">Curreny Rounding Protocol</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'none', label: 'Precise', desc: 'No Rounding' },
                            { id: '5fils', label: '5 Fils', desc: 'Nearest 0.005' },
                            { id: '10fils', label: '10 Fils', desc: 'Nearest 0.010' }
                          ].map(method => (
                            <button 
                              key={method.id}
                              onClick={() => setRoundingMethod(method.id as any)}
                              className={`p-6 rounded-3xl text-left transition-all border ${roundingMethod === method.id ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20' : 'bg-surface border-border hover:border-primary/40'}`}
                            >
                              <p className="text-xs font-black uppercase tracking-widest">{method.label}</p>
                              <p className={`text-[9px] mt-1 font-bold ${roundingMethod === method.id ? 'opacity-80' : 'opacity-40'}`}>{method.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 bg-surface-container border border-border rounded-[2.5rem]">
                        <div className="flex items-center gap-4 text-primary">
                          <Activity size={24} />
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">
                              Active Store: {stores.find(s => s._id === (selectedStoreId || user?.storeId))?.name || "Kuwait-City_OBSIDIAN"}
                            </p>
                            <p className="text-[9px] font-bold opacity-60">All changes persistent for session matrix</p>
                          </div>
                        </div>
                      </div>

                      {user?.role === 'superadmin' && stores.length > 1 && (
                        <div className="space-y-6">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block">Switch Target Node (Store)</label>
                           <div className="grid grid-cols-2 gap-4">
                              {stores.map(store => (
                                <button 
                                  key={store._id}
                                  onClick={() => setSelectedStoreId(store._id)}
                                  className={`p-6 rounded-3xl text-left transition-all border ${selectedStoreId === store._id ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border'}`}
                                >
                                  <p className="text-[10px] font-black uppercase tracking-widest">{store.name}</p>
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="p-10 border-t border-border bg-muted/5">
                      <button 
                        onClick={() => setShowConfigPanel(false)}
                        className="w-full bg-primary text-primary-foreground py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                      >
                        Commit Configuration
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>

          {/* Cart Sidebar (4 cols) */}
          <div className="xl:col-span-4 flex flex-col bg-surface-container-low/60 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-xl font-serif italic tracking-tight flex items-center gap-3 text-white">
                  <ShoppingCart size={20} className="text-primary-foreground" />
                  Cart Matrix
                </h2>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-1.5">{cart.length} Allocation Nodes</p>
              </div>
              <button 
                onClick={() => setCart([])} 
                className="p-3 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all active:scale-90 shadow-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="px-6 py-4 bg-primary/5 border-b border-white/5 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-4">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-2">
                       <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${step === 1 ? 'bg-primary-foreground text-white' : 'bg-white/5 text-white/20'}`}>
                          {step}
                       </div>
                       <span className={`text-[7px] font-black uppercase tracking-widest ${step === 1 ? 'text-primary-foreground' : 'text-white/10'}`}>
                          {step === 1 ? 'Cart' : step === 2 ? 'Pay' : 'Done'}
                       </span>
                       {step < 3 && <div className="w-4 h-[1px] bg-white/5 ml-1" />}
                    </div>
                  ))}
               </div>
               <div className="text-[9px] font-black font-mono text-primary-foreground">VBS-2241</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[300px] opacity-[0.03]"
                  >
                    <ShoppingCart size={80} className="mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white">Matrix Empty</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="cart-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="space-y-3">
                      {cart.map((item, index) => (
                        <motion.div 
                          key={`${item.product._id}-${index}`}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-4 bg-surface-container-highest/20 border border-white/5 rounded-2xl space-y-4 group hover:border-primary-foreground/30 transition-all shadow-sm"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h4 className="text-[11px] font-black uppercase tracking-tight leading-snug line-clamp-2 text-white/80 group-hover:text-primary-foreground transition-colors">
                                {item.isVariant ? `${item.parentProduct?.name} (${Object.values(item.product.attributes).join('/')})` : item.product.name}
                              </h4>
                              <p className="text-[8px] font-mono text-white/20 font-bold mt-1.5 tracking-tighter">{item.product.sku}</p>
                            </div>
                            <span className="text-sm font-black font-mono text-primary-foreground tracking-tighter">{(item.product.price * item.quantity).toFixed(3)}</span>
                          </div>
                          {(item.imei || item.product.isImeiRequired) && (
                            <div className={`px-3 py-1 rounded-lg text-[8px] font-mono font-black border uppercase tracking-widest flex items-center justify-between ${item.imei ? 'bg-primary-foreground/5 text-primary-foreground border-primary-foreground/10' : 'bg-amber-500/5 text-amber-500 border-amber-500/20'}`}>
                              <span>{item.imei ? `ID: ${item.imei}` : 'ID REQUIRED'}</span>
                              {!item.imei && <Scan size={10} />}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex items-center bg-surface-container-highest/40 border border-white/5 rounded-xl overflow-hidden shadow-inner">
                              <button onClick={() => updateQuantity(index, -1)} className="p-2 hover:bg-white/5 transition-colors text-white/40"><Minus size={12} /></button>
                              <span className="px-5 text-[11px] font-black font-mono text-white/60">{item.quantity}</span>
                              <button onClick={() => updateQuantity(index, 1)} className="p-2 hover:bg-white/5 transition-colors text-white/40"><Plus size={12} /></button>
                            </div>
                            <Gate id={13}>
                              <button className="text-[8px] font-black text-primary-foreground uppercase tracking-[0.2em] flex items-center gap-1.5 hover:underline">
                                <Percent size={10} /> Discount
                              </button>
                            </Gate>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* RECOMMENDED ADD-ONS */}
                    <div className="pt-6 pb-2">
                       <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Recommended Add-ons</h4>
                          <span className="text-[7px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full">Boost Cart</span>
                       </div>
                       <div className="space-y-3">
                          {cart.some(item => (item.isVariant ? item.parentProduct : item.product).category === 'Phones') ? (
                            [
                              { name: "Lakki Care+ (2 Year Extended Warranty)", price: 149.000, icon: ShieldCheck, category: 'Service' },
                              { name: "9H Silicon Power Shield (Screen Guard)", price: 29.000, icon: Smartphone, category: 'Accessories' },
                              { name: "Obsidian 30W Fast Charger", price: 15.000, icon: Zap, category: 'Accessories' }
                            ].map((addon, i) => (
                              <div 
                                key={i} 
                                onClick={() => {
                                  const p = products.find(prod => prod.name === addon.name) || {
                                    _id: `addon-${i}`,
                                    name: addon.name,
                                    price: addon.price,
                                    stock: 99,
                                    category: addon.category,
                                    sku: `ADDON-${i}`,
                                    image: 'https://picsum.photos/seed/acc/200'
                                  };
                                  addToCart(p);
                                }}
                                className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary-foreground/20 transition-all cursor-pointer"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-primary-foreground transition-colors">
                                       <addon.icon size={14} />
                                    </div>
                                    <div>
                                       <p className="text-[9px] font-black uppercase text-white/60 group-hover:text-white transition-colors">{addon.name}</p>
                                       <p className="text-[8px] font-mono font-black text-primary-foreground mt-0.5">+{addon.price.toFixed(3)} KD</p>
                                    </div>
                                 </div>
                                 <div className="w-5 h-5 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:bg-primary-foreground group-hover:text-white group-hover:border-primary-foreground transition-all">
                                    <Plus size={10} />
                                 </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[8px] font-black text-white/10 uppercase text-center py-4">Add a main device for recommendations</p>
                          )}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] space-y-6 relative z-10">
              <LoyaltyPayment 
                totalAmount={total} 
                customerId={selectedCustomer?._id}
                onRedeem={(discount) => setGlobalDiscount(prev => prev + discount)} 
              />

              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary-foreground transition-colors" size={16} />
                <textarea
                  value={cartNotes}
                  onChange={(e) => setCartNotes(e.target.value)}
                  placeholder="TRANSACTION MEMO..."
                  className="w-full bg-surface-container-highest/20 border border-white/5 pl-12 pr-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white placeholder:text-white/10 outline-none focus:border-primary-foreground/30 transition-all shadow-inner resize-none h-16 leading-relaxed"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                  <span>Subtotal Matrix</span>
                  <span className="font-mono">{subtotal.toFixed(3)} KD</span>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-destructive">
                  <span className="flex items-center gap-2">
                    Efficiency Savings
                    <button 
                      onClick={() => setDiscountType(discountType === 'fixed' ? 'percentage' : 'fixed')}
                      className="p-1 bg-surface-container-highest/40 border border-white/5 rounded-md hover:bg-white/10 transition-all text-[7px]"
                    >
                      {discountType === 'fixed' ? 'KD' : '%'}
                    </button>
                  </span>
                  <div className="flex flex-col items-end">
                    <input 
                      type="number"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                      className="w-20 bg-transparent text-right font-mono outline-none border-b border-white/5 focus:border-destructive/40 text-destructive"
                    />
                    <span className="text-[7px] opacity-40">-{ (lineDiscounts + calculatedGlobalDiscount + wholesaleDiscount).toFixed(3) } KD</span>
                  </div>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                    <span>Tax Allocation ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-mono">+{ taxAmount.toFixed(3) } KD</span>
                  </div>
                )}
                {roundingDifference !== 0 && (
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-white/10 underline decoration-dotted">
                    <span>Rounding ({roundingMethod})</span>
                    <span className="font-mono">{roundingDifference.toFixed(3)} KD</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4 border-t border-white/5">
                  <span className="text-3xl font-serif italic tracking-tighter text-white">Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-primary-foreground font-mono tracking-tighter leading-none">{total.toFixed(3)}</span>
                    <span className="text-[10px] font-black text-primary-foreground ml-2 uppercase tracking-[0.4em]">KD</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleHoldCart}
                  className="flex items-center justify-center gap-2 py-4 border border-white/5 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-95 shadow-sm"
                >
                  <Pause size={12} /> Hold
                </button>
                <button 
                  onClick={() => handleProcessSale('layaway')}
                  className="flex items-center justify-center gap-2 py-4 border border-white/5 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-95 shadow-sm"
                >
                  <Clock size={12} /> Layaway
                </button>
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex items-center justify-center gap-2 py-4 border border-white/5 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-95 shadow-sm"
                >
                  <History size={12} /> History
                </button>
                <button 
                  onClick={() => setIsSplitModalOpen(true)}
                  className="flex items-center justify-center gap-2 py-4 border border-white/5 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-95 shadow-sm"
                >
                  <Calculator size={12} /> Split
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
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                      paymentMethod === method.id 
                        ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/50 shadow-lg shadow-primary/10 scale-105 z-10' 
                        : 'bg-white/5 border-white/5 text-white/20 hover:text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <method.icon size={18} />
                    <span className="text-[7px] font-black uppercase tracking-widest">{method.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handleProcessSale()}
                disabled={isProcessing || cart.length === 0}
                title="Synchronize Transaction and Commit to Blockchain Ledger"
                className="w-full bg-gradient-to-br from-primary-foreground to-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                )}
                <span className="group-hover:translate-x-1 transition-transform">Finalize</span>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
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
      {/* Held Carts Modal */}
      <AnimatePresence>
        {isHeldCartsModalOpen && (
          <HeldCartsModal 
            isOpen={isHeldCartsModalOpen}
            onClose={() => setIsHeldCartsModalOpen(false)}
            onRetrieve={(id) => resumeHeldSession(id)}
          />
        )}
      </AnimatePresence>

      {/* Split Payment Modal */}
      <AnimatePresence>
        {isSplitModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">Split Vector</h2>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Parallel Allocation Matrix</p>
                </div>
                <button onClick={() => setIsSplitModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 bg-black/20 text-center border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Aggregate Balance</p>
                <p className="text-4xl font-serif italic text-white/80">{total.toFixed(3)} KD</p>
              </div>

              <div className="p-8 space-y-4">
                {['cash', 'card', 'knet', 'store_credit'].map(method => (
                  <div key={method} className="flex items-center gap-6 group">
                    <div className="w-24 text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">{method.replace('_', ' ')}</div>
                    <div className="relative flex-1">
                      <input 
                        type="number"
                        step="0.001"
                        value={splitPayments[method] || ''}
                        onChange={(e) => setSplitPayments({...splitPayments, [method]: parseFloat(e.target.value) || 0})}
                        className="w-full bg-white/[0.02] border border-white/5 pl-6 pr-14 py-3 rounded-xl text-lg font-black font-mono focus:border-primary-foreground/40 outline-none transition-all text-white placeholder:text-white/5"
                        placeholder="0.000"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-white/10">KD</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-white/[0.02] flex items-center justify-between border-t border-white/5">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                   Allocated: <span className={Math.abs(Object.values(splitPayments).reduce((s,v)=>s+v,0) - total) < 0.001 ? "text-green-400" : "text-white/80"}>
                     {Object.values(splitPayments).reduce((s,v)=>s+v,0).toFixed(3)} KD
                   </span>
                </div>
                <button 
                  disabled={Math.abs(Object.values(splitPayments).reduce((s,v)=>s+v,0) - total) > 0.001}
                  onClick={() => setIsSplitModalOpen(false)}
                  className="px-8 py-4 bg-primary-foreground text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-foreground/10 disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm Vector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccessModalOpen && lastSale && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-12 w-full max-w-xl text-center space-y-10"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary-foreground/10 rounded-full flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-foreground-rgb),0.2)]">
                  <CheckCircle2 size={40} />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-serif italic tracking-tighter text-white">Registry Updated</h2>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mt-4 leading-none">NODE SEQUENCE: {lastSale.saleNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => printThermalReceipt(lastSale)}
                  className="flex flex-col items-center gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-primary-foreground/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary-foreground group-hover:bg-primary-foreground/10 transition-all">
                    <Printer size={24} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Thermal Vector</span>
                </button>
                <button 
                  onClick={() => printA4Invoice(lastSale)}
                  className="flex flex-col items-center gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-primary-foreground/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary-foreground group-hover:bg-primary-foreground/10 transition-all">
                    <FileText size={24} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">A4 Manifest</span>
                </button>
              </div>

              <button 
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setCart([]);
                  setLastSale(null);
                  setSelectedCustomer(null);
                }}
                className="w-full bg-primary-foreground text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-primary-foreground/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                New Sequence
              </button>

              <button 
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setCart([]);
                  setLastSale(null);
                  setSelectedCustomer(null);
                  setActiveStage('receipts');
                }}
                className="w-full mt-3 py-4 bg-white/[0.02] border border-white/5 text-white/40 hover:text-white rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.4em] transition-all"
              >
                View Manifest Archive
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ReturnsModal 
        isOpen={false} 
        onClose={() => {
          setIsReturnsModalOpen(false);
          navigate('/pos');
        }}
        onSuccess={fetchProducts}
      />

      <GiftCardModal 
        isOpen={false}
        onClose={() => {
          setIsGiftCardModalOpen(false);
          navigate('/pos');
        }}
        customerId={selectedCustomer?._id}
      />

      <AnimatePresence>
        {isBundlesModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Recursive Bundling</h2>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-6 leading-relaxed">Inventory Matrix V2 // Multi-component Synapse</p>
              <p className="text-[11px] text-white/60 leading-relaxed mb-8">Bundles execute recursive logic to verify and deduct constituent entities from the registry in a single atomic transaction. Integrity verified for Kuwait local matrix.</p>
              <div className="space-y-4">
                <div className="p-5 bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl flex items-center gap-4">
                  <Zap className="text-primary-foreground" size={20} />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary-foreground leading-none mb-1">Status</p>
                    <p className="text-[11px] font-bold text-white/80">Recursive Sync Active</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsBundlesModalOpen(false)} className="w-full mt-10 py-4 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Abort View</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTaxModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">VAT Metrics</h2>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-8 leading-none">Fiscal Compliance Config (Kuwait Domain)</p>
              <div className="space-y-6">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl text-center shadow-inner">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-4">Current Aggregate VAT</p>
                  <p className="text-5xl font-serif italic text-white/80">{taxRate}%</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-amber-400/10 border border-amber-400/20 rounded-2xl">
                   <CheckCircle2 size={16} className="text-amber-400" />
                   <p className="text-[9px] font-black text-amber-400/80 uppercase tracking-widest leading-relaxed">
                     Rounding synchronized to 5 fils standard
                   </p>
                </div>
              </div>
              <button 
                onClick={() => {
                   setIsTaxModalOpen(false);
                   navigate('/pos/grid');
                }} 
                className="w-full mt-10 py-4 bg-white/[0.02] border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all shadow-xl shadow-black/20"
              >
                Abort Sync
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSyncModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] w-full max-w-xl shadow-2xl shadow-black/50">
              <div className="flex items-center gap-6 mb-8">
                 <div className={`p-5 rounded-2xl shadow-inner border border-white/5 ${isOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                   {isOnline ? <Wifi size={32} /> : <WifiOff size={32} />}
                 </div>
                 <div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Edge Controller</h2>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-3 leading-none">{isOnline ? 'Synchronized with Cloud Matrix' : 'Local Persistence Active'}</p>
                 </div>
              </div>
              <div className="space-y-6">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between shadow-inner">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2">Temporal Queue Depth</p>
                    <p className="text-3xl font-mono text-white/80">{queueLength} VECTOR(S)</p>
                  </div>
                  {queueLength > 0 && isOnline && (
                    <button onClick={() => syncPendingSales()} className="px-6 py-3 bg-primary-foreground text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary-foreground/20">Force Handshake</button>
                  )}
                </div>
                <p className="text-[9px] font-black text-white/20 leading-relaxed uppercase tracking-widest">Transactions persist in IndexedDB when offline and auto-reconcile on matrix reconnect. Integrity verified for Kuwait domain nodes.</p>
              </div>
              <button 
                onClick={() => { setIsSyncModalOpen(false); navigate('/pos/grid'); }} 
                className="w-full mt-10 py-4 bg-white/[0.02] border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all shadow-xl shadow-black/20"
              >
                Abort View
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]"
            >
              <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">Customer Matrix</h2>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Global Identity Repository (ID 20/52-59)</p>
                </div>
                <button onClick={() => { setIsCustomerModalOpen(false); navigate('/pos/grid'); }} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
                <CustomerSelector 
                  selectedCustomer={selectedCustomer}
                  onSelect={(c) => {
                    setSelectedCustomer(c);
                    setIsCustomerModalOpen(false);
                    navigate('/pos/grid');
                  }}
                />
                <div className="mt-12 p-10 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] text-center">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Initialize selection for deep identity synapsing.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">Manifest Archive</h2>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Registry of Previous Operational Invariants</p>
                </div>
                <button onClick={() => { setIsHistoryModalOpen(false); navigate('/pos/grid'); }} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-8">
                <SalesHistory />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProductForVariants && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_80px_rgba(0,0,0,0.6)]"
            >
              <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">{selectedProductForVariants.name}</h2>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Select Variant Logic Node</p>
                </div>
                <button onClick={() => setSelectedProductForVariants(null)} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-4 no-scrollbar">
                {selectedProductForVariants.variants?.map((v: any) => (
                  <button 
                    key={v._id}
                    onClick={() => addToCart(v, true, selectedProductForVariants)}
                    disabled={v.stock <= 0}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left hover:bg-white/[0.05] hover:border-primary-foreground/40 transition-all group disabled:opacity-20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">{v.sku}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${v.stock < 5 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-white/40 border-white/5'}`}>
                        {v.stock}
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors leading-tight">
                      {Object.values(v.attributes).join(' / ')}
                    </p>
                    <p className="text-xl font-black font-mono text-primary-foreground mt-4">{v.price.toFixed(3)} KD</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
    </Gate>
  );
};

export default POS;
