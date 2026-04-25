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
  Radio,
  User,
} from "lucide-react";
import api from '../api/client';
import { useAuth } from "../context/AuthContext";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { ImeiModal } from "../components/pos/molecules/ImeiModal";
import { LoyaltyPayment } from "../components/pos/organisms/LoyaltyPayment";
import { Gate } from "../components/PermissionGuard";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ThermalReceipt } from '../components/print/ThermalReceipt';
import { A4Invoice } from '../components/print/A4Invoice';
import { printThermalReceipt, printA4Invoice, triggerPrint } from '../utils/documentService';
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
import { HardwareMatrix } from "../components/pos/submenus/HardwareMatrix";

interface Product {
  _id: string;
  name: string;
  name_ar?: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
  category_ar?: string;
  brand?: string;
  brand_ar?: string;
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'knet' | 'store_credit' | 'gift_card'>('cash');
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
  const [discountItemIndex, setDiscountItemIndex] = useState<number | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cartNotes, setCartNotes] = useState("");
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isBundlesModalOpen, setIsBundlesModalOpen] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm && searchTerm.length > 2) {
        setIsSearching(true);
        try {
          // Identifier-first deep lookup (ID 319)
          const response = await api.get(`/products/search?q=${searchTerm}`);
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
  const [taxRate, setTaxRate] = useState(() => Number(localStorage.getItem('terminal_tax_rate')) || 0);
  
  const [activeStage, setActiveStage] = useState<'grid' | 'customers' | 'exchange' | 'loyalty' | 'instalments' | 'setup' | 'network' | 'records' | 'sync' | 'receipts' | 'hardware'>('grid');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayTransactions: 0
  });
  
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(user?.storeId || null);

  // Terminal Logic Configuration (Manager Controlled)
  const [roundingMethod, setRoundingMethod] = useState<'none' | '5fils' | '10fils'>(() => (localStorage.getItem('terminal_rounding') as any) || '5fils');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [isSupervisorSession, setIsSupervisorSession] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(true);

  useEffect(() => {
    // Audit Wiring: Handle paths from the Global Sidebar Navigation Matrix
    const path = location.pathname;
    
    if (path.includes('/pos/grid')) setActiveStage('grid');
    else if (path.includes('/pos/returns')) setActiveStage('exchange');
    else if (path.includes('/crm/360')) setActiveStage('customers');
    else if (path.includes('/pos/loyalty')) setActiveStage('loyalty');
    else if (path.includes('/pos/receipts')) setActiveStage('records');
    else if (path.includes('/pos/network')) setActiveStage('network');
    else if (path.includes('/pos/layaway')) setActiveStage('instalments');
    else if (path.includes('/pos/hardware')) setActiveStage('hardware');
    else if (path.includes('/pos/tax') || path.includes('/pos/setup')) setActiveStage('setup');
    else if (path.includes('/pos/payments')) setIsSplitModalOpen(true);
  }, [location.pathname]);

  const handleStageChange = (stage: typeof activeStage) => {
    setActiveStage(stage);
    // Deep Wiring: Sync URL with Stage Matrix
    const stageMap: Record<string, string> = {
      'grid': '/pos/grid',
      'customers': '/crm/360',
      'exchange': '/pos/returns',
      'records': '/pos/receipts',
      'loyalty': '/pos/loyalty',
      'instalments': '/pos/layaway',
      'hardware': '/pos/hardware',
      'setup': '/pos/setup',
      'network': '/pos/network'
    };
    if (stageMap[stage]) navigate(stageMap[stage]);
  };

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
      const response = await api.get(`/products/search?q=${barcode}`);
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

  const handleFetchZReport = async () => {
    setIsLoadingReport(true);
    try {
      const res = await api.get('/reports/z-report');
      setReportData(res.data);
      toast.success("Z-Report Summary Verified", {
        description: "Compiling terminal vectors for physical output."
      });
      // Allow state to update and template to render before printing
      setTimeout(() => {
        triggerPrint('z-report-thermal', 'Daily Z-Report Summary');
      }, 500);
    } catch (error) {
      console.error("Z-Report Fetch Error:", error);
      toast.error("Cloud synchronization failed for Z-Report sequence.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores');
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
        const response = await api.get(`/sales/hold/${sessionId}`);
        if (response.status === 200) {
          const sale = response.data;
          const cartItems = await Promise.all(sale.items.map(async (item: any) => {
            const pRes = await api.get(`/products/${item.productId}`);
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
        const res = await api.get('/analytics/summary');
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
      const response = await api.get('/products?limit=50&sort=-createdAt');
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

    // Tax and Rounding calculation for the backend
    const saleData = {
      items: cart.map(item => ({
        productId: item.isVariant ? item.parentProduct?._id : item.product._id,
        variantId: item.isVariant ? item.product._id : undefined,
        quantity: item.quantity,
        price: item.product.price,
        imei: item.imei,
        discount: item.discount || 0
      })),
      payments,
      subtotal,
      discount: lineDiscounts + globalDiscount + wholesaleDiscount,
      total,
      tax: taxAmount,
      rounding: roundingDifference,
      status: finalStatus,
      customerId: selectedCustomer?._id,
      giftCardCode: giftCardCode || undefined,
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
      const response = await api.post('/sales', saleData);

      if (response.status === 201) {
        const sale = response.data;
        setLastSale({
          ...sale,
          items: cart.map(item => ({
            name: item.isVariant ? `${item.parentProduct?.name} (${Object.values(item.product.attributes).join('/')})` : item.product.name,
            name_ar: item.isVariant ? `${item.parentProduct?.name_ar || item.parentProduct?.name} (${Object.values(item.product.attributes).join('/')})` : item.product.name_ar,
            brand: item.product.brand,
            brand_ar: item.product.brand_ar,
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
      const response = await api.post('/sales', saleData);

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

        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden">
          {/* Nav Sidebar (9 Submenu Matrix) - Fixed width, sticky to height */}
          <aside className="w-full lg:w-28 bg-surface-container-low/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] flex flex-row lg:flex-col items-center py-4 lg:py-8 space-x-2 lg:space-x-0 lg:space-y-1 relative overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto no-scrollbar shrink-0 z-20 h-auto lg:h-full">
             <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[40px] pointer-events-none" />
             {[
               { id: 'grid', label: 'Terminal', icon: Smartphone, title: 'Main POS Terminal Matrix' },
               { id: 'customers', label: 'Client 360', icon: Users, title: 'Customer Lead & CRM Vector' },
               { id: 'exchange', label: 'Returns', icon: RefreshCcw, title: 'Exchange & Returns Hub' },
               { id: 'records', label: 'Records', icon: History, title: 'Historical Sale Records Audit' },
               { id: 'loyalty', label: 'Loyalty', icon: Gift, title: 'Loyalty Rewards & Gift Matrix' },
               { id: 'instalments', label: 'Instalment', icon: CreditCard, title: 'Instalment Payment Monitoring' },
               { id: 'hardware', label: 'Hardware', icon: Smartphone, title: 'Hardware Peripheral & Terminal Health' },
               { id: 'setup', label: 'Setup', icon: Settings, title: 'Terminal Configuration & Setup' },
               { id: 'network', label: 'Network', icon: Activity, title: 'Regional Cluster & Sync Performance' },
             ].map((item) => (
               <button 
                key={item.id}
                onClick={() => handleStageChange(item.id as any)}
                title={item.title}
                className={`w-auto lg:w-full min-w-[70px] px-2 group flex flex-col items-center py-3 transition-all relative shrink-0 ${activeStage === item.id ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}
               >
                 {activeStage === item.id && (
                   <motion.div layoutId="nav-glow" className="absolute bottom-0 lg:bottom-auto lg:inset-y-0 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 w-8 lg:w-1 h-1 lg:h-auto bg-primary rounded-t-full lg:rounded-r-full lg:rounded-tl-none shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                 )}
                 <div className={`p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${activeStage === item.id ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-110 text-white' : 'bg-white/5 border-white/5 text-white shadow-sm'}`}>
                    <item.icon size={20} />
                 </div>
                 <span className="text-[6px] font-black uppercase tracking-[0.3em] mt-3 lg:block text-center">{item.label}</span>
               </button>
             ))}
          </aside>

          <div className="flex-1 pb-4 h-full flex flex-col min-w-0">
            <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-black/40 border-b border-white/5 relative z-10 shrink-0 rounded-t-3xl">
              <div className="flex flex-col min-w-[200px]">
                <div className="flex items-center gap-3">
                   <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-none">
                     Obsidian Terminal
                   </h1>
                   <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase whitespace-nowrap">Active</div>
                </div>
                <p className="text-[9px] md:text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mt-2 truncate">
                  Node POS-01 • Shift Open
                </p>
              </div>

              <div className="flex items-center gap-3 md:gap-6 ml-auto">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Operator State</span>
                     <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{user?.name || 'Lead Admin'}</span>
                  </div>
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
                    {user?.name?.charAt(0) || 'L'}
                  </div>
                </div>
                <button 
                  onClick={() => setIsLocked(true)} 
                  className="px-5 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
                >
                  <Lock size={14} /> Lock Desk
                </button>
              </div>
            </header>

            {/* LAYER 2: Command Matrix & Search Vector - Improved Wrapping */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-6 py-4 bg-black/20 border-b border-white/5 relative z-10 shrink-0">
              <div className="flex-1 relative group min-w-0">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-primary' : 'text-white/10 group-focus-within:text-white/60'}`} size={18} />
                <input 
                  type="text" 
                  placeholder="Scan S/N, IMEI, or product identifier..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-12 py-4 rounded-2xl text-sm font-medium text-white placeholder:text-white/10 focus:bg-white/10 focus:border-primary/40 focus:outline-none transition-all shadow-inner" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   {isSearching && <Loader2 size={16} className="animate-spin text-primary" />}
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl z-[150] overflow-hidden p-3"
                    >
                      <div className="max-h-[60vh] overflow-y-auto no-scrollbar space-y-1">
                        {searchResults.map((p) => (
                          <button 
                            key={p._id}
                            onClick={() => {
                              addToCart(p);
                              setSearchTerm("");
                              setSearchResults([]);
                            }}
                            className="w-full p-3 flex items-center gap-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-primary/30 transition-all text-left group"
                          >
                             <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden group-hover:scale-105 transition-transform border border-white/5">
                               <img src={p.image || undefined} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{p.name}</p>
                                <span className="text-[10px] text-white/30 uppercase font-mono tracking-tighter">{p.sku}</span>
                             </div>
                             <div className="text-right pl-4">
                                <p className="text-sm font-mono text-primary font-black tracking-tight">{p.price.toFixed(3)}</p>
                                <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">KD</span>
                             </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center flex-wrap gap-3 shrink-0">
                 <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                    <button 
                      onClick={handleFetchZReport}
                      disabled={isLoadingReport}
                      className="px-3 md:px-5 py-2 md:py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoadingReport ? <Loader2 size={14} className="animate-spin text-amber-500" /> : <Printer size={14} className="text-amber-500" />}
                      <span className="hidden sm:inline">Z-Report</span>
                    </button>
                    <button onClick={() => setIsBulkModalOpen(true)} className="px-3 md:px-5 py-2 md:py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-2">
                      <Upload size={14} /> <span className="hidden sm:inline">Bulk</span>
                    </button>
                    <button onClick={onAddProductClick} className="px-3 md:px-5 py-2 md:py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-2">
                      <Plus size={14} /> <span className="hidden sm:inline">Register</span>
                    </button>
                 </div>

                 <div className="flex items-center gap-4 px-5 py-2 bg-black/40 border border-white/5 rounded-xl">
                    <div className="flex flex-col items-start translate-y-0.5">
                       <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-black">Sync Engine</span>
                       <span className={`text-[10px] font-bold tracking-tight ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>{isOnline ? 'ACTIVE • 12ms' : 'LOCAL CACHE'}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'} animate-pulse`} />
                 </div>
              </div>
            </div>
        {/* LAYER 2.5: Terminal Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-2 bg-black/20 border-b border-white/5 shrink-0">
          {[
            { label: "Today's Revenue", value: `KD ${stats.todayRevenue.toFixed(3)}`, icon: Activity, color: 'text-emerald-400' },
            { label: "Transactions", value: stats.todayTransactions, icon: ShoppingCart, color: 'text-primary' },
            { label: "Stock Alerts", value: products.filter(p => p.stock < 10).length, icon: AlertTriangle, color: 'text-amber-400' },
            { label: "Terminal Health", value: isOnline ? 'Optimal' : 'Off-grid', icon: Radio, color: isOnline ? 'text-emerald-400' : 'text-amber-400' },
          ].map((card, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1">
              <div className={`p-1.5 rounded-lg bg-white/5 ${card.color}`}>
                <card.icon size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-medium text-white/30 uppercase tracking-wider">{card.label}</span>
                <span className="text-[11px] font-bold text-white leading-tight">{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* LAYER 3: Main work area - Controlled Switch point at 1024px */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 px-6 mt-6">
          {activeStage === 'grid' ? (
            <React.Fragment>
              {/* Main Stage Selection (Balanced flex) */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0">
                <div className="flex flex-col bg-surface-container-low/40 backdrop-blur-sm border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden flex-1 group/matrix hover:border-primary/20 transition-all duration-500 min-h-0">
                  <div className="p-4 md:p-6 pb-0 shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none opacity-0 group-hover/matrix:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between gap-4 relative z-10 w-full mb-4">
                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pr-10 pb-1 flex-1">
                        <button
                          onClick={() => setActiveCategory('All')}
                          title="Show All Segments"
                          className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border whitespace-nowrap ${
                            activeCategory === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          All Segments
                        </button>
                        {categories.filter(c => c !== 'All').map(cat => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            title={`Filter by ${cat}`}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border whitespace-nowrap ${
                              activeCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10 shrink-0">
                        <button 
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                          <Store size={14} />
                        </button>
                        <button 
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                          <Tag size={14} />
                        </button>
                        <button 
                          onClick={() => setViewMode('table')}
                          className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                          <LayoutList size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 custom-scrollbar scroll-smooth overflow-x-hidden min-h-0">
               <div className="pr-1">
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
                                 <th className="px-6 py-4 text-[9px] font-medium text-white/30 uppercase tracking-widest whitespace-nowrap">SKU / ID</th>
                                 <th className="px-6 py-4 text-[9px] font-medium text-white/30 uppercase tracking-widest">Product Information</th>
                                 <th className="px-6 py-4 text-[9px] font-medium text-white/30 uppercase tracking-widest text-right">Price (KD)</th>
                                 <th className="px-6 py-4 text-[9px] font-medium text-white/30 uppercase tracking-widest text-center">In Stock</th>
                                 <th className="px-6 py-4 text-[9px] font-medium text-white/30 uppercase tracking-widest text-center">Tracking</th>
                                 <th className="px-6 py-4 text-[9px] font-medium text-white/30 uppercase tracking-widest text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody>
                              {filteredProducts.map((product) => (
                                <tr 
                                  key={product._id}
                                  onClick={() => addToCart(product)}
                                  className="border-b border-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group"
                                >
                                   <td className="px-6 py-4">
                                      <p className="text-[10px] font-mono text-white/40 tracking-tighter">{product.sku}</p>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden shadow-sm border border-white/5">
                                            <img src={product.image || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                         </div>
                                         <div className="min-w-0">
                                            <p className="text-[12px] font-medium text-white truncate leading-tight">{product.name}</p>
                                            <p className="text-[9px] text-white/20 mt-0.5">{product.brand || 'No Brand'}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <p className="text-[13px] font-bold text-white font-mono">{product.price.toFixed(3)}</p>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${product.stock < 10 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                         {product.stock} units
                                      </span>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                         {product.imei ? (
                                           <span className="text-[9px] font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">IMEI</span>
                                         ) : product.serial ? (
                                           <span className="text-[9px] font-mono text-white/40 px-1.5 py-0.5 bg-white/5 rounded border border-white/10">SRL</span>
                                         ) : (
                                           <span className="text-[9px] text-white/10 italic">N/A</span>
                                         )}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <button className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-medium hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100">Add</button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  ) : (
                    <div className="space-y-12">
                      <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3" : "flex flex-col gap-2"}>
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
                        className={`bg-white/5 border border-white/10 cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden rounded-xl shadow-sm ${
                          viewMode === 'grid' ? 'p-3 pb-4' : 'p-3 flex items-center gap-6'
                        }`}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className="aspect-square bg-white/5 rounded-lg mb-3 relative overflow-hidden group/img flex items-center justify-center">
                              <img 
                                src={product.image || undefined} 
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110"
                              />
                                <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                  <span className="px-2 py-0.5 bg-black/80 text-white text-[8px] font-bold uppercase rounded border border-white/10 backdrop-blur-md"> {product.sku}</span>
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl">
                                    {product.isConfigurable ? 'Configure' : 'Add to Cart'}
                                  </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-medium text-white/30 uppercase tracking-tight">{product.category}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${product.stock < 5 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {product.stock} in stock
                              </span>
                            </div>

                            <h3 className="text-sm font-medium text-white line-clamp-1 mb-4 h-5 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                              <span className="text-[10px] font-mono text-white/20">{product.sku}</span>
                              <span className="text-[14px] font-bold text-white transition-colors group-hover:text-primary">
                                {product.price.toFixed(3)} <span className="text-[9px] text-white/40">KD</span>
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                              <img 
                                src={product.image || undefined} 
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center pr-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[8px] font-medium text-white/30 uppercase tracking-widest">{product.brand || 'GENERIC'}</span>
                                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    product.condition === 'New' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    product.condition === 'Refurbished' ? 'bg-amber-500/10 text-amber-500' : 
                                    'bg-sky-500/10 text-sky-500'
                                  }`}>{product.condition}</span>
                                </div>
                                <h3 className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">{product.name}</h3>
                                <div className="flex gap-3 mt-1.5">
                                  <span className="text-[10px] font-mono text-white/10 mt-1">SKU: {product.sku}</span>
                                </div>
                              </div>

                              <div className="flex justify-center">
                                 <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
                                    {product.imei && (
                                      <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md" title="IMEI Tracker">
                                        <Smartphone size={12} className="text-primary" />
                                        <span className="text-[9px] font-mono font-black text-primary tracking-tight">{product.imei.slice(-8)}...</span>
                                      </div>
                                    )}
                                    {!product.imei && product.serial && (
                                      <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-md" title="Serial Tracker">
                                        <Layers size={12} className="text-white/40" />
                                        <span className="text-[9px] font-mono font-black text-white/50 truncate tracking-tight">{product.serial.slice(-8)}...</span>
                                      </div>
                                    )}
                                 </div>
                              </div>
                              
                              <div className="flex justify-center">
                                <div className="hidden lg:flex flex-col pl-4 border-l border-white/5 w-32 shrink-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[7px] font-black uppercase text-muted-foreground opacity-40">Stock</span>
                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[30px]">
                                      <div className={`h-full ${product.stock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, product.stock * 2)}%` }} />
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-black whitespace-nowrap mt-1">{product.stock} Units</span>
                                </div>
                              </div>

                              <div className="text-center">
                                 <div className="hidden">
                                    <div className="flex flex-col items-center">
                                       <span className="text-[6px] font-black uppercase text-muted-foreground opacity-60">Status</span>
                                       <div className="flex items-center gap-0.5 h-4 mt-1">
                                          {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                                            <div key={i} className="w-1 rounded-sm bg-primary/20" style={{ height: `${20 + i * 10}%` }} />
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="text-right px-4">
                                 <div className="text-lg font-bold text-white font-mono tracking-tighter" title="Unit Price">{product.price.toFixed(3)} <span className="text-[10px] text-white/40">KD</span></div>
                                 <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[8px] font-black text-muted-foreground opacity-40 uppercase tracking-tighter">Market Rate</span>
                                 </div>
                              </div>

                              <div className="flex justify-end pr-2">
                                <div className="w-10 h-10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 bg-primary/10 rounded-xl">
                                  {product.isConfigurable ? <ChevronRight size={20} /> : <Plus size={20} />}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
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

        {/* Cart Sidebar (Flexible with min-width) */}
                <div className="w-full lg:w-[360px] xl:w-[420px] 2xl:w-[480px] flex flex-col bg-surface-container-low/60 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden relative min-h-[500px] lg:min-h-0 shrink-0">
                  <div className="p-5 md:p-6 border-b border-white/5 bg-white/[0.02] space-y-4 relative z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium tracking-tight flex items-center gap-2.5 text-white">
                    <ShoppingCart size={18} className="text-primary" />
                    Cart Matrix
                  </h2>
                  <p className="text-[10px] font-medium text-white/40 tracking-wider mt-1">{cart.length} items allocated</p>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button 
                      onClick={() => setCart([])} 
                      className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all active:scale-95 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Selection Vector */}
              <CustomerSelector 
                selectedCustomer={selectedCustomer} 
                onSelect={(customer) => setSelectedCustomer(customer)} 
              />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 custom-scrollbar scroll-smooth relative z-10">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-12"
                  >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/10 mb-4 border border-white/10">
                      <ShoppingCart size={24} className="opacity-20" />
                    </div>
                    <h3 className="text-sm font-medium text-white/60 mb-1">Cart is empty</h3>
                    <p className="text-[11px] text-white/20 max-w-[180px]">Scan a product or search SKU above to begin transaction</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => (
                      <motion.div
                        key={`${item.product._id}-${index}`}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white/5 border border-white/10 rounded-xl group hover:border-primary/30 transition-all overflow-hidden"
                      >
                         <div className="p-3 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-black/20 overflow-hidden shrink-0 border border-white/5">
                               <img src={item.product.image || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-[12px] font-medium text-white truncate leading-tight">{item.isVariant ? `${item.parentProduct?.name} (${Object.values(item.product.attributes).join('/')})` : item.product.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-mono text-white/20">{item.product.sku}</span>
                                  {item.imei && (
                                    <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">ID: {item.imei.slice(-8)}</span>
                                  )}
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[13px] font-bold text-white leading-none">{(item.product.price * item.quantity).toFixed(3)}</p>
                               <div className="flex items-center justify-end gap-1.5 mt-2 bg-black/20 rounded-md p-1 border border-white/5">
                                  <button onClick={() => updateQuantity(index, item.quantity - 1)} className="p-0.5 text-white/20 hover:text-white transition-colors"><Minus size={10} /></button>
                                  <span className="text-[10px] font-bold text-primary w-4 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(index, item.quantity + 1)} className="p-0.5 text-white/20 hover:text-white transition-colors"><Plus size={10} /></button>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-5 md:p-6 border-t border-white/5 bg-white/[0.02] flex flex-col gap-4 relative z-10 shrink-0 max-h-[60vh] overflow-y-auto no-scrollbar">
              {/* Collapsible Utility Sections */}
              {cart.length > 0 && (
                <div className="space-y-2 shrink-0">
                  <details className="group">
                    <summary className="list-none cursor-pointer p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group-open:rounded-b-none transition-all">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                        <User size={12} className="text-primary" /> Loyalty Lookup
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="p-4 bg-white/[0.02] border-x border-b border-white/10 rounded-b-xl animate-in fade-in slide-in-from-top-2">
                      <LoyaltyPayment 
                        totalAmount={total} 
                        customerId={selectedCustomer?._id}
                        onRedeem={(discount) => setGlobalDiscount(prev => prev + discount)} 
                      />
                    </div>
                  </details>

                  <details className="group">
                    <summary className="list-none cursor-pointer p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group-open:rounded-b-none transition-all">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                        <FileText size={12} className="text-primary" /> Transaction Memo
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="p-4 bg-white/[0.02] border-x border-b border-white/10 rounded-b-xl animate-in fade-in slide-in-from-top-2">
                      <textarea
                        value={cartNotes}
                        onChange={(e) => setCartNotes(e.target.value)}
                        placeholder="Add transaction notes..."
                        className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-[11px] text-white placeholder:text-white/20 outline-none focus:border-primary/40 transition-all resize-none h-16"
                      />
                    </div>
                  </details>
                </div>
              )}
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[11px] text-white/40">
                  <span>Subtotal</span>
                  <span className="font-mono">{subtotal.toFixed(3)} KD</span>
                </div>
                {calculatedGlobalDiscount + wholesaleDiscount > 0 && (
                  <div className="flex justify-between text-[11px] text-red-400">
                    <span>Discounts</span>
                    <span className="font-mono">-{(lineDiscounts + calculatedGlobalDiscount + wholesaleDiscount).toFixed(3)} KD</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between text-[11px] text-white/40">
                    <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-mono">+{ taxAmount.toFixed(3) } KD</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-3 border-t border-white/10 mb-4">
                  <span className="text-2xl font-serif italic text-white leading-none">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary leading-none">{total.toFixed(3)}</span>
                    <span className="text-[10px] font-bold text-white/40 ml-2 uppercase tracking-widest">KD</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT DOCK: Layer 4 */}
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'hold', icon: Pause, label: 'Hold', action: handleHoldCart },
                    { id: 'layaway', icon: Clock, label: 'Layaway', action: () => handleProcessSale('layaway') },
                    { id: 'history', icon: History, label: 'History', action: () => handleStageChange('records') },
                    { id: 'split', icon: Calculator, label: 'Split', action: () => setIsSplitModalOpen(true) }
                  ].map(util => (
                    <button 
                      key={util.id}
                      onClick={util.action}
                      className="flex items-center justify-center gap-2 py-2.5 bg-surface-container border border-white/5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <util.icon size={14} />
                      <span className="text-xs font-semibold">{util.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'cash', icon: Banknote, label: 'Cash' },
                    { id: 'card', icon: CreditCard, label: 'Card' },
                    { id: 'knet', icon: Store, label: 'K-Net' },
                    { id: 'gift_card', icon: Gift, label: 'Gift' },
                    { id: 'store_credit', icon: RefreshCcw, label: 'Credit' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                          : 'bg-surface-container border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <method.icon size={16} />
                      <span className="text-[11px] font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => handleProcessSale()}
                  disabled={isProcessing || cart.length === 0}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg tracking-wide hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-primary/20 flex items-center justify-center gap-2 mt-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                  {isProcessing ? 'Processing...' : 'Finalize Sale'}
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </div>
        </React.Fragment>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
                {activeStage === 'customers' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Client360 />
                  </div>
                )}

                {activeStage === 'exchange' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <ReturnsHub />
                  </div>
                )}

                {activeStage === 'records' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SaleRecords />
                  </div>
                )}

                {activeStage === 'loyalty' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <GiftsLoyalty />
                  </div>
                )}

                {activeStage === 'instalments' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <InstalmentPlan />
                  </div>
                )}

                {activeStage === 'setup' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <TerminalSetup />
                  </div>
                )}

                {activeStage === 'network' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <NetworkMatrix />
                  </div>
                )}

                {activeStage === 'hardware' && (
                  <div className="flex-1 bg-surface-container-low/40 backdrop-blur-sm border border-white/5 p-8 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <HardwareMatrix />
                  </div>
                )}

                {activeStage === 'sync' && (
                  <div className="flex-1 bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-16 text-center animate-in zoom-in duration-500">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-inner ${isOnline ? 'bg-green-500/5 text-green-400' : 'bg-red-500/5 text-red-400'}`}>
                      {isOnline ? <Wifi size={40} /> : <WifiOff size={40} />}
                    </div>
                    <h2 className="text-5xl font-serif italic tracking-tighter text-white mb-2">Sync Manager</h2>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-12">Connection: {isOnline ? 'Active Cloud' : 'Isolated Local'}</p>
                    <div className="w-full max-w-lg p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Local Buffer</p>
                        <p className="text-2xl font-mono text-white/80">{queueLength} SKUs</p>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: isOnline ? '100%' : '20%' }} className={`h-full ${isOnline ? 'bg-primary-foreground' : 'bg-red-500'}`} />
                      </div>
                      {queueLength > 0 && isOnline && (
                        <button onClick={() => syncPendingSales()} className="w-full py-5 bg-primary-foreground text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] shadow-2xl shadow-primary-foreground/20 transition-all">Sync Pending</button>
                      )}
                    </div>
                    <button onClick={() => navigate('/pos/grid')} className="mt-12 text-[9px] font-black text-white/10 uppercase tracking-[0.4em] hover:text-white transition-colors">Close Overview</button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>

      <AnimatePresence>
        {isDiscountModalOpen && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
            >
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">Item Discount</h3>
                 <button onClick={() => setIsDiscountModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={16}/></button>
               </div>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 uppercase tracking-widest">KD</span>
                  <input 
                    type="number"
                    step="0.001"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full bg-white/[0.02] border border-white/5 pl-12 pr-4 py-3 rounded-xl text-lg font-black font-mono text-white outline-none focus:border-primary-foreground/40"
                    placeholder="0.000"
                    autoFocus
                  />
               </div>
               <button 
                 onClick={() => {
                   if (discountItemIndex !== null) {
                     const newCart = [...cart];
                     newCart[discountItemIndex].discount = discountAmount;
                     setCart(newCart);
                   }
                   setIsDiscountModalOpen(false);
                 }}
                 className="w-full bg-primary-foreground text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] mt-6 shadow-xl shadow-primary-foreground/10"
               >
                 Apply Credit
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-start justify-between shrink-0">
                <div>
                  <h2 className="text-xl md:text-3xl font-serif italic tracking-tight text-white leading-none">Split Payment</h2>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Payment Allocation Matrix</p>
                </div>
                <button onClick={() => setIsSplitModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 bg-black/20 text-center border-b border-white/5 shrink-0">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Balance Due</p>
                <p className="text-2xl md:text-4xl font-serif italic text-white/80">{total.toFixed(3)} KD</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 no-scrollbar">
                {['cash', 'card', 'knet', 'gift_card', 'store_credit'].map(method => (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center gap-6 group">
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
                    {method === 'gift_card' && (
                      <div className="ml-30 flex gap-2">
                         <input 
                           type="text"
                           placeholder="GC CODE..."
                           value={giftCardCode}
                           onChange={(e) => setGiftCardCode(e.target.value)}
                           className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white outline-none focus:border-primary-foreground/40"
                         />
                         <button 
                           onClick={async () => {
                             if (!giftCardCode) return;
                             try {
                               const res = await api.get(`/gift-cards/${giftCardCode}`);
                               toast.success(`GC Verified: ${res.data.currentBalance.toFixed(3)} KD`);
                               const amt = Math.min(res.data.currentBalance, total - Object.entries(splitPayments).filter(([k])=>k!=='gift_card').reduce((s,[,v])=>s+v,0));
                               setSplitPayments({...splitPayments, gift_card: amt});
                             } catch(e) {
                               toast.error("Invalid Vector");
                             }
                           }}
                           className="px-3 py-1 bg-primary-foreground/20 text-primary-foreground rounded-lg text-[8px] font-black uppercase tracking-widest"
                         >Verify</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-6 md:p-8 bg-white/[0.02] flex items-center justify-between border-t border-white/5 shrink-0">
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
                  Confirm Split
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
              className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-6 md:p-12 w-full max-w-xl text-center flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-center shrink-0 mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-foreground/10 rounded-full flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-foreground-rgb),0.2)]">
                  <CheckCircle2 size={32} />
                </div>
              </div>
              <div className="shrink-0 mb-6">
                <h2 className="text-2xl md:text-4xl font-serif italic tracking-tighter text-white">Sale Completed</h2>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mt-4 leading-none">Invoice: {lastSale.saleNumber}</p>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 mb-8 no-scrollbar">
                <button 
                  onClick={() => printThermalReceipt(lastSale.saleNumber || lastSale._id, 'pos-thermal-receipt')}
                  className="flex flex-col items-center gap-4 p-4 md:p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-primary-foreground/40 transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary-foreground group-hover:bg-primary-foreground/10 transition-all">
                    <Printer size={20} />
                  </div>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Thermal</span>
                </button>
                <button 
                  onClick={() => printA4Invoice(lastSale.saleNumber || lastSale._id, 'pos-a4-invoice')}
                  className="flex flex-col items-center gap-4 p-4 md:p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-primary-foreground/40 transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary-foreground group-hover:bg-primary-foreground/10 transition-all">
                    <FileText size={20} />
                  </div>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Invoice</span>
                </button>
              </div>

              <div className="shrink-0 space-y-3">
                <button 
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setCart([]);
                    setLastSale(null);
                    setSelectedCustomer(null);
                  }}
                  className="w-full bg-primary-foreground text-white py-4 md:py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-primary-foreground/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  New Sequence
                </button>

                <button 
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setCart([]);
                    setLastSale(null);
                    setSelectedCustomer(null);
                    setActiveStage('records');
                  }}
                  className="w-full py-3 md:py-4 bg-white/[0.02] border border-white/5 text-white/40 hover:text-white rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.4em] transition-all text-center"
                >
                  Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Off-screen Print Templates */}
      <div className="fixed -left-[5000px] top-0 pointer-events-none opacity-0">
        <div id="pos-thermal-receipt">
          <ThermalReceipt 
            id="thermal-receipt-inner"
            orderId={lastSale?.saleNumber || lastSale?._id || 'PENDING'}
            date={lastSale ? new Date(lastSale.createdAt).toLocaleString() : ''}
            items={lastSale?.items || []}
            payments={lastSale?.payments || []}
            total={lastSale?.total || 0}
          />
        </div>
        <div id="pos-a4-invoice">
          <A4Invoice 
            id="a4-invoice-inner"
            orderId={lastSale?.saleNumber || lastSale?._id || 'PENDING'}
            date={lastSale ? new Date(lastSale.createdAt).toLocaleDateString() : ''}
            items={lastSale?.items || []}
            payments={lastSale?.payments || []}
            total={lastSale?.total || 0}
          />
        </div>
        
        {/* Z-REPORT HIDDEN TEMPLATE */}
        <div id="z-report-thermal" className="p-8 bg-white text-black font-mono text-xs w-[80mm]">
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-xl font-bold uppercase tracking-tighter">Terminal Z-Report</h1>
            <p className="text-[10px] mt-1">Obsidian Node-Matrix</p>
            <p className="text-[10px]">{new Date().toLocaleString()}</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-bold"><span>Revenue (Total)</span><span>{(reportData?.expectedTotal || stats.todayRevenue).toFixed(3)} KD</span></div>
            <div className="flex justify-between text-[10px]"><span>Transactions</span><span>{reportData?.salesCount || stats.todayTransactions}</span></div>
            <div className="w-full border-t border-dashed border-black/20 my-2" />
            <div className="flex justify-between"><span>Cash In</span><span>{reportData?.sales?.cash?.toFixed(3) || "0.000"} KD</span></div>
            <div className="flex justify-between"><span>Card In</span><span>{reportData?.sales?.card?.toFixed(3) || "0.000"} KD</span></div>
            <div className="flex justify-between"><span>K-NET In</span><span>{reportData?.sales?.knet?.toFixed(3) || "0.000"} KD</span></div>
            <div className="flex justify-between"><span>Store Credit</span><span>{reportData?.sales?.store_credit?.toFixed(3) || "0.000"} KD</span></div>
          </div>
          <div className="border-t-2 border-black pt-4 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">End of Shift Allocation</p>
            <p className="text-[7px] mt-2 opacity-60">Verified Node: {reportData?.id || 'LOCAL-SYNC'}</p>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isBundlesModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Layers size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none">Recursive Bundling</h2>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mt-2">Active Protocol V2</p>
                </div>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed mb-8">Bundles execute recursive logic to verify and deduct constituent entities from the registry in a single atomic transaction. Integrity verified for Kuwait local matrix.</p>
              <div className="space-y-3">
                 {[
                   { label: 'Cloud Buffer', status: 'Optimal' },
                   { label: 'Relational Sync', status: 'Authorized' },
                   { label: 'Inventory Lock', status: 'Global' }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{stat.label}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">{stat.status}</span>
                   </div>
                 ))}
              </div>
              <button onClick={() => setIsBundlesModalOpen(false)} className="w-full mt-8 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Dismiss Logic</button>
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
    </Gate>
  );
};

export default POS;
