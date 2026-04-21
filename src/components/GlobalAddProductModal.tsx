import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, X, Plus, Package, Tag, Layers, Smartphone, 
  CheckCircle2, AlertCircle, Zap, Trash2, ArrowRight, 
  Scan, ChevronDown, Database 
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface GlobalAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any; // New prop for editing
}

import { SmartSelector } from './atoms/SmartSelector';
import { VariationMatrix } from './organisms/VariationMatrix';

export const GlobalAddProductModal: React.FC<GlobalAddProductModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [step, setStep] = useState(1);
  const [createdProducts, setCreatedProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "Phones",
    brand: initialData?.brand || "",
    modelNumber: initialData?.modelNumber || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    cost: initialData?.cost || 0,
    stock: initialData?.stock || 0,
    image: initialData?.image || "",
    binLocation: initialData?.binLocation || "",
    trackingMethod: (initialData?.trackingMethod || 'imei') as 'none' | 'imei' | 'serial',
    condition: initialData?.condition || "New",
    isConfigurable: initialData?.isConfigurable ?? true,
    isNewBrand: false,
    attributes: initialData?.attributes || [] as { name: string, values: string[] }[],
    variants: initialData?.variants || [] as any[],
    targetStoreId: "",
    incomingStock: [] as { variantId: string, units: any[] }[]
  });

  // Reset state when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNewProduct({
        name: initialData?.name || "",
        sku: initialData?.sku || "",
        category: initialData?.category || "Phones",
        brand: initialData?.brand || "",
        modelNumber: initialData?.modelNumber || "",
        description: initialData?.description || "",
        price: initialData?.price || 0,
        cost: initialData?.cost || 0,
        stock: initialData?.stock || 0,
        image: initialData?.image || "",
        binLocation: initialData?.binLocation || "",
        trackingMethod: (initialData?.trackingMethod || 'imei') as 'none' | 'imei' | 'serial',
        condition: initialData?.condition || "New",
        isConfigurable: initialData?.isConfigurable ?? true,
        isNewBrand: false,
        attributes: initialData?.attributes || [] as { name: string, values: string[] }[],
        variants: initialData?.variants || [] as any[],
        targetStoreId: "",
        incomingStock: [] as { variantId: string, units: any[] }[]
      });
      setStep(1);
    }
  }, [isOpen, initialData]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skuStatus, setSkuStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (!newProduct.sku || newProduct.sku.length < 3) {
      setSkuStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setSkuStatus('checking');
      try {
        const res = await axios.get(`/api/products/validate-sku?sku=${newProduct.sku}`);
        setSkuStatus(res.data.available ? 'available' : 'taken');
      } catch (err) {
        setSkuStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newProduct.sku]);

  const BRANDS = ["Apple", "Samsung", "Huawei", "Xiaomi", "Google", "Oppo", "Vivo"];
  const STORAGE_PRESETS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "4TB"];
  const RAM_PRESETS = ["2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB"];
  const SIM_PRESETS = ["Physical SIM", "eSIM", "Dual Nano SIM", "Nano + eSIM"];
  const CONDITION_OPTIONS = ["New", "Used", "Refurbished"];

  const addAttribute = () => {
    setNewProduct({
      ...newProduct,
      attributes: [...newProduct.attributes, { name: "", values: [] }]
    });
  };

  const removeAttribute = (index: number) => {
    const newAttrs = [...newProduct.attributes];
    newAttrs.splice(index, 1);
    setNewProduct({ ...newProduct, attributes: newAttrs });
  };

  const updateAttributeName = (index: number, name: string) => {
    const newAttrs = [...newProduct.attributes];
    newAttrs[index].name = name;
    setNewProduct({ ...newProduct, attributes: newAttrs });
  };

  const updateAttributeValues = (index: number, val: string) => {
    const newAttrs = [...newProduct.attributes];
    const values = val.split(',').map(v => v.trim()).filter(v => v !== "");
    newAttrs[index].values = values;
    setNewProduct({ ...newProduct, attributes: newAttrs });
  };

  const [activeAttributeInput, setActiveAttributeInput] = useState<number | null>(null);
  const [attributeTempValue, setAttributeTempValue] = useState("");

  const handleAddValue = (index: number) => {
    if (!attributeTempValue.trim()) return;
    const newAttrs = [...newProduct.attributes];
    if (!newAttrs[index].values.includes(attributeTempValue.trim())) {
      newAttrs[index].values.push(attributeTempValue.trim());
      setNewProduct({ ...newProduct, attributes: newAttrs });
    }
    setAttributeTempValue("");
  };

  const [showBulkPrice, setShowBulkPrice] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");

  const applyBulkPrice = () => {
    const price = parseFloat(bulkPrice);
    if (!isNaN(price)) {
      setNewProduct({
        ...newProduct,
        variants: newProduct.variants.map(v => ({ ...v, price }))
      });
      setShowBulkPrice(false);
      toast.success(`Applied price ${price} to all variants`);
    } else {
      toast.error("Invalid price");
    }
  };

  const generateMatrix = async () => {
    let combinations: any[] = [];
    
    if (newProduct.isConfigurable) {
      if (newProduct.attributes.length === 0 || newProduct.attributes.every(a => a.values.length === 0)) {
        toast.error("Please add at least one attribute with values.");
        return;
      }

      // Cartesian product of attribute values
      combinations = newProduct.attributes.reduce((acc, attr) => {
        if (attr.values.length === 0) return acc;
        const results: any[] = [];
        attr.values.forEach(val => {
          if (acc.length === 0) {
            results.push({ [attr.name]: val });
          } else {
            acc.forEach(prev => {
              results.push({ ...prev, [attr.name]: val });
            });
          }
        });
        return results;
      }, [] as any[]);
    } else {
      combinations = [{}];
    }

    const newVariants = await Promise.all(combinations.map(async (combo, index) => {
      // Call SKU generation API
      try {
        const res = await axios.post('/api/products/sku/generate', {
          productData: newProduct,
          variantAttributes: combo,
          storeCode: 'MAIN'
        });
        return {
          id: Math.random().toString(36).substr(2, 9),
          attributes: combo,
          sku: res.data.sku,
          price: newProduct.price,
          cost: newProduct.cost,
          quantity: 0,
          incomingUnits: [] as any[],
          trackingMethod: newProduct.trackingMethod,
          binLocation: newProduct.binLocation
        };
      } catch (error) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          attributes: combo,
          sku: newProduct.sku || `SKU-${index}`,
          price: newProduct.price,
          cost: newProduct.cost,
          quantity: 0,
          incomingUnits: [] as any[],
          trackingMethod: newProduct.trackingMethod
        };
      }
    }));

    setNewProduct({ ...newProduct, variants: newVariants });
    setStep(3);
  };

  const [stores, setStores] = useState<any[]>([]);
  React.useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get('/api/stores');
        setStores(res.data);
        if (res.data.length > 0 && !newProduct.targetStoreId) {
          setNewProduct(prev => ({ ...prev, targetStoreId: res.data[0]._id }));
        }
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    };
    if (step === 3) fetchStores();
  }, [step]);

  const updateVariant = (id: string, field: string, value: any) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    });
  };

  const handleBulkImeiAdd = (id: string, text: string) => {
    const identifiers = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
    if (identifiers.length === 0) return;

    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.map(v => {
        if (v.id === id) {
          return {
            ...v,
            quantity: identifiers.length,
            incomingUnits: identifiers.map(id => ({
              identifier: id,
              id: Math.random().toString(36).substr(2, 9)
            }))
          };
        }
        return v;
      })
    });
  };

  const removeVariant = (id: string) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter(v => v.id !== id)
    });
  };

  const resetAndClose = () => {
    setNewProduct({
      name: "",
      sku: "",
      category: "Phones",
      brand: "",
      modelNumber: "",
      description: "",
      price: 0,
      cost: 0,
      stock: 0,
      image: "",
      binLocation: "",
      trackingMethod: 'imei' as 'none' | 'imei' | 'serial',
      condition: "New",
      isConfigurable: true,
      isNewBrand: false,
      attributes: [] as { name: string, values: string[] }[],
      variants: [] as any[],
      targetStoreId: "",
      incomingStock: [] as { variantId: string, units: any[] }[]
    });
    setStep(1);
    setCreatedProducts([]);
    onClose();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Inline New Brand Detection
      const brandSuggestions = await axios.get(`/api/attributes/suggestions?field=brand`);
      const isNew = newProduct.brand && !brandSuggestions.data.includes(newProduct.brand);
      
      const payload = { ...newProduct, isNewBrand: isNew };

      let response;
      if (initialData?._id) {
        response = await axios.put(`/api/products/${initialData._id}`, payload);
      } else {
        response = await axios.post('/api/products', payload);
      }
      
      const savedProduct = response.data;
      const variantsToProcess = savedProduct.variants || [savedProduct];
      
      // AUTO-INTAKE LOGIC
      const intakeItems = newProduct.variants
        .filter(v => v.quantity > 0 || (v.incomingUnits && v.incomingUnits.length > 0))
        .map(v => {
          // Find the actually saved variant ID matching the current local variant SKU/Attributes
          const matchedVariant = variantsToProcess.find((sv: any) => sv.sku === v.sku);
          return {
            productId: matchedVariant?._id || savedProduct._id,
            quantity: v.quantity || v.incomingUnits?.length || 0,
            units: v.incomingUnits?.map((iu: any) => ({
                identifier: iu.identifier,
                cost: v.cost,
                price: v.price
            })) || []
          };
        });

      if (intakeItems.length > 0) {
        await axios.post('/api/inventory/batch-intake', {
            targetStoreId: newProduct.targetStoreId,
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear().toString(),
            supplierId: "Initial Registration Intake",
            items: intakeItems
        });
        toast.success("Initial inventory intake processed.");
      }

      setCreatedProducts(variantsToProcess);
      setStep(4);
      toast.success(initialData?._id ? "Product updated." : "Product registered and matrix deployed.");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const matrixBaseProduct = React.useMemo(() => ({
    brand: newProduct.brand,
    name: newProduct.name,
    price: newProduct.price,
    cost: newProduct.cost
  }), [newProduct.brand, newProduct.name, newProduct.price, newProduct.cost]);

  const handleMatrixChange = React.useCallback((variants: any[]) => {
    setNewProduct(prev => {
      // Logic ID 999: Only update if variants actually changed to prevent loops
      if (JSON.stringify(prev.variants.map(v => v.sku)) === JSON.stringify(variants.map(v => v.sku))) {
        return prev;
      }
      return {
        ...prev,
        variants: variants.map(v => ({
          ...v,
          id: Math.random().toString(36).substr(2, 9),
          incomingUnits: []
        }))
      };
    });
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden"
          >
            <div className="p-12 relative z-10">
              <div className="flex items-start justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
                    <Zap className="w-8 h-8 text-black fill-black" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                      {step === 4 ? "Registration Complete" : "Register Asset"}
                    </h2>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">
                      {step === 4 ? "Catalog Entry Finalized" : "Enterprise Inventory Ingestion"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={resetAndClose} 
                  className="p-3 hover:bg-white/5 rounded-full text-white/40 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-12">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      step === s ? 'bg-white text-black scale-110' : 
                      step > s ? 'bg-green-500 text-white' : 'bg-white/5 text-white/20'
                    }`}>
                      {step > s ? <CheckCircle2 size={14} /> : s}
                    </div>
                    {s < 4 && <div className={`h-0.5 w-8 rounded-full ${step > s ? 'bg-green-500' : 'bg-white/5'}`} />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                {step === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Product Name</label>
                          <input 
                            required
                            placeholder="e.g. iPhone 15 Pro"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <SmartSelector 
                            field="brand"
                            label="Brand"
                            value={newProduct.brand}
                            onChange={(val) => setNewProduct({...newProduct, brand: val})}
                            onAddNew={(val) => console.log("New brand staged:", val)}
                          />
                          <SmartSelector 
                            field="category"
                            label="Category"
                            value={newProduct.category}
                            onChange={(val) => setNewProduct({...newProduct, category: val})}
                            onAddNew={(val) => console.log("New category staged:", val)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Base SKU / Parent ID</label>
                              <div className="relative">
                                <input 
                                  required
                                  placeholder="IPH-15-PRO"
                                  value={newProduct.sku}
                                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value.toUpperCase()})}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-primary outline-none focus:border-blue-500 transition-all font-mono"
                                />
                                {skuStatus === 'checking' && <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-white/20" />}
                                {skuStatus === 'available' && <CheckCircle2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
                                {skuStatus === 'taken' && <X size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Model Number</label>
                              <input 
                                placeholder="A3102"
                                value={newProduct.modelNumber}
                                onChange={(e) => setNewProduct({...newProduct, modelNumber: e.target.value.toUpperCase()})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all font-mono"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                           <SmartSelector 
                             field="storage"
                             label="Capacity"
                             value={newProduct.attributes.find(a => a.name === 'storage')?.values[0] || ''}
                             onChange={(val) => {
                               const attrs = [...newProduct.attributes].filter(a => a.name !== 'storage');
                               if (val) attrs.push({ name: 'storage', values: [val] });
                               setNewProduct({...newProduct, attributes: attrs});
                             }}
                           />
                           <SmartSelector 
                             field="ram"
                             label="Memory"
                             value={newProduct.attributes.find(a => a.name === 'ram')?.values[0] || ''}
                             onChange={(val) => {
                               const attrs = [...newProduct.attributes].filter(a => a.name !== 'ram');
                               if (val) attrs.push({ name: 'ram', values: [val] });
                               setNewProduct({...newProduct, attributes: attrs});
                             }}
                           />
                           <SmartSelector 
                             field="simType"
                             label="Connectivity"
                             value={newProduct.attributes.find(a => a.name === 'simType')?.values[0] || ''}
                             onChange={(val) => {
                               const attrs = [...newProduct.attributes].filter(a => a.name !== 'simType');
                               if (val) attrs.push({ name: 'simType', values: [val] });
                               setNewProduct({...newProduct, attributes: attrs});
                             }}
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Default Base Price (KD)</label>
                              <input 
                                type="number"
                                placeholder="0.000"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all font-mono"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Default Base Cost (KD)</label>
                              <input 
                                type="number"
                                placeholder="0.000"
                                value={newProduct.cost}
                                onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value) || 0})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all font-mono"
                              />
                           </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Main Image</label>
                          <div className="h-32 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden">
                            {newProduct.image ? (
                              <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <Loader2 className="w-6 h-6 text-white/20" />
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Upload Image</span>
                              </>
                            )}
                            <input 
                              type="text" 
                              placeholder="Paste URL..."
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Description</label>
                      <textarea 
                        placeholder="The latest A17 Pro chip..."
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all min-h-[80px]"
                      />
                    </div>

                    <div className="flex items-center gap-8 p-6 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Condition</label>
                        <div className="flex gap-4">
                          {CONDITION_OPTIONS.map((cond) => (
                            <label key={cond} className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="radio"
                                name="condition"
                                checked={newProduct.condition === cond}
                                onChange={() => setNewProduct({...newProduct, condition: cond})}
                                className="w-4 h-4 accent-blue-500"
                              />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${newProduct.condition === cond ? 'text-blue-500' : 'text-white/40 group-hover:text-white/60'}`}>
                                {cond}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-white/10 mx-4" />
                      <div className="space-y-2 flex-1">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Tracking Method</label>
                        <div className="flex gap-4">
                          {['none', 'imei', 'serial'].map((method) => (
                            <label key={method} className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="radio"
                                name="trackingMethod"
                                checked={newProduct.trackingMethod === method}
                                onChange={() => setNewProduct({...newProduct, trackingMethod: method as any})}
                                className="w-4 h-4 accent-blue-500"
                              />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${newProduct.trackingMethod === method ? 'text-blue-500' : 'text-white/40 group-hover:text-white/60'}`}>
                                {method}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 px-6">
                      <input 
                        type="checkbox"
                        id="globalConfigurable"
                        checked={newProduct.isConfigurable}
                        onChange={(e) => setNewProduct({...newProduct, isConfigurable: e.target.checked})}
                        className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                      />
                      <label htmlFor="globalConfigurable" className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none text-white/40 hover:text-blue-500 transition-colors">
                        Configurable Product (Matrix Generation)
                      </label>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        if (newProduct.isConfigurable) {
                          setStep(2);
                        } else {
                          generateMatrix();
                        }
                      }}
                      disabled={!newProduct.name || !newProduct.brand}
                      className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {newProduct.isConfigurable ? "Define System Attributes" : "Finalize Registration"} <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Define Variations</h3>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] mt-1">AXES OF SYSTEM DIVERSITY</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Back to Identity
                      </button>
                    </div>

                    <VariationMatrix 
                      baseProduct={matrixBaseProduct}
                      onMatrixChange={handleMatrixChange}
                    />

                    <button 
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={newProduct.variants.length === 0}
                      className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      Finalize Stock Entry <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center border border-primary/30">
                          <Package className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Variant Matrix</h3>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-2">
                             {newProduct.variants.length} Configurations Calculated
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-4">
                        <div className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => setShowBulkPrice(!showBulkPrice)}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-2"
                          >
                            <Tag size={16} /> Bulk Adjustment
                          </button>
                          <button 
                            type="button"
                            onClick={() => setStep(newProduct.isConfigurable ? 2 : 1)}
                            className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                          >
                            <Layers size={16} /> Edit Attributes
                          </button>
                        </div>
                        <AnimatePresence>
                          {showBulkPrice && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="w-full flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl"
                            >
                              <input 
                                type="number"
                                placeholder="Universal Price..."
                                value={bulkPrice}
                                onChange={(e) => setBulkPrice(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white font-mono"
                              />
                              <button 
                                type="button"
                                onClick={applyBulkPrice}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                              >
                                Apply
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Target Receiving Node</label>
                        <select 
                          value={newProduct.targetStoreId}
                          onChange={(e) => setNewProduct({...newProduct, targetStoreId: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-xs font-bold text-white outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          {stores.map(s => (
                            <option key={s._id} value={s._id} className="bg-[#0A0A0A]">{s.name}</option>
                          ))}
                        </select>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                      <div className="max-h-[40vh] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 z-10 bg-[#0A0A0A]">
                            <tr className="border-b border-white/10">
                              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">Identity</th>
                              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">SKU Matrix</th>
                              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">Financials</th>
                              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20">Stock Intake</th>
                              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-white/20 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {newProduct.variants.map((v) => (
                              <React.Fragment key={v.id}>
                                <tr className="hover:bg-white/[0.02] transition-all group">
                                  <td className="px-8 py-8">
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(v.attributes).map(([k, val]: any) => (
                                        <span key={k} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                                          {val}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-8 py-8">
                                    <div className="relative">
                                      <input 
                                        value={v.sku}
                                        onChange={(e) => updateVariant(v.id, 'sku', e.target.value.toUpperCase())}
                                        className="bg-transparent border-b border-white/10 text-[10px] font-mono text-primary font-bold outline-none focus:border-primary transition-all w-40"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-8 py-8">
                                    <div className="flex items-center gap-4">
                                      <div className="space-y-1">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Price</p>
                                        <input 
                                          type="number"
                                          value={v.price}
                                          onChange={(e) => updateVariant(v.id, 'price', parseFloat(e.target.value))}
                                          className="w-20 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary font-mono shadow-inner"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Cost</p>
                                        <input 
                                          type="number"
                                          value={v.cost}
                                          onChange={(e) => updateVariant(v.id, 'cost', parseFloat(e.target.value))}
                                          className="w-20 bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary font-mono shadow-inner"
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-8 py-8">
                                    <div className="flex items-center gap-6">
                                      <div className="px-6 py-4 bg-primary/5 rounded-[1.5rem] border border-primary/20">
                                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest text-center">Qty</p>
                                        <p className="text-xl font-black font-mono text-primary text-center leading-none mt-1">{v.quantity || 0}</p>
                                      </div>
                                      {newProduct.trackingMethod !== 'none' && (
                                        <div className="text-left">
                                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Unit ID Required</p>
                                          <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${v.incomingUnits?.length === v.quantity && v.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">
                                              {v.incomingUnits?.length || 0} / {v.quantity || 0}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-8 py-8 text-right">
                                    <button 
                                      type="button"
                                      onClick={() => removeVariant(v.id)}
                                      className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                </tr>
                                {newProduct.trackingMethod !== 'none' && (
                                  <tr className="bg-white/5">
                                    <td colSpan={5} className="px-8 py-8">
                                      <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1 space-y-4">
                                          <div className="flex items-center gap-3">
                                            <Scan size={16} className="text-primary" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Intake Scanning Desk ({newProduct.trackingMethod.toUpperCase()})</h4>
                                          </div>
                                          <div className="relative group/scan">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover/scan:opacity-50 transition duration-1000" />
                                            <textarea 
                                              placeholder={`SCAN OR PASTE ${newProduct.trackingMethod.toUpperCase()}s FOR THIS VARIANT...`}
                                              onBlur={(e) => handleBulkImeiAdd(v.id, e.target.value)}
                                              className="relative w-full bg-[#050505] border border-white/10 rounded-2xl p-6 text-[11px] font-mono font-bold text-white outline-none focus:border-primary transition-all min-h-[100px] shadow-inner no-scrollbar"
                                            />
                                          </div>
                                        </div>
                                        <div className="w-px bg-white/10" />
                                        <div className="flex-1">
                                          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-6">Received Asset Cards</h4>
                                          <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-4 no-scrollbar">
                                            {v.incomingUnits?.map((unit: any, idx: number) => (
                                              <div key={unit.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group/unit">
                                                <div className="flex items-center gap-3">
                                                  <span className="text-[9px] font-black text-primary opacity-40 italic">#{idx+1}</span>
                                                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-tight">{unit.identifier}</span>
                                                </div>
                                                <button 
                                                  onClick={() => {
                                                    const newUnits = v.incomingUnits.filter((u: any) => u.id !== unit.id);
                                                    updateVariant(v.id, 'incomingUnits', newUnits);
                                                    updateVariant(v.id, 'quantity', newUnits.length);
                                                  }}
                                                  className="p-1 px-2 text-red-500/40 hover:text-red-500 transition-all opacity-0 group-hover/unit:opacity-100"
                                                >
                                                  <X size={12} />
                                                </button>
                                              </div>
                                            ))}
                                            {(!v.incomingUnits || v.incomingUnits.length === 0) && (
                                              <div className="col-span-2 py-8 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2">
                                                <Package className="w-6 h-6 text-white/10" />
                                                <p className="text-[9px] font-black text-white/10 uppercase tracking-widest text-center">Zero Units Staged</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Matrix Summary Footer */}
                      <div className="p-10 bg-white/5 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-12">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total Variations</p>
                            <p className="text-xl font-black text-white font-mono">{newProduct.variants.length}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total System Units</p>
                            <p className="text-xl font-black text-primary font-mono">
                              {newProduct.variants.reduce((acc, v) => acc + (v.quantity || 0), 0)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Est. Matrix Value</p>
                            <p className="text-xl font-black text-green-500 font-mono">
                              KD {newProduct.variants.reduce((acc, v) => acc + ((v.price || 0) * (v.quantity || 0)), 0).toFixed(3)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Destination Node</p>
                          <div className="flex items-center gap-3 text-white">
                            <Database size={16} className="text-primary" />
                            <span className="text-sm font-black uppercase tracking-tighter">
                              {stores.find(s => s._id === newProduct.targetStoreId)?.name || 'Central Matrix'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setStep(newProduct.isConfigurable ? 2 : 1)}
                        className="px-10 py-5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white/40 hover:bg-white/5 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            <CheckCircle2 size={20} /> Deploy Matrix to Core
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8 text-center py-12"
                  >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Catalog Entry Successful</h3>
                      <p className="text-sm text-white/40 mt-2 font-medium">
                        {createdProducts.length} variants have been registered in the global matrix.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-8">
                      <button 
                        type="button"
                        onClick={() => {
                          // This will be handled by the parent component to open Stock Intake
                          resetAndClose();
                          // We can pass a flag or use a custom event
                          window.dispatchEvent(new CustomEvent('open-stock-intake', { detail: { products: createdProducts } }));
                        }}
                        className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                      >
                        Proceed to Stock Intake <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={resetAndClose}
                        className="w-full py-5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white/40 hover:bg-white/5 transition-all"
                      >
                        Finish & Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
