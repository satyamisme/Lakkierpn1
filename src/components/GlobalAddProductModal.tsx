import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Plus, Package, Tag, Layers, Smartphone, CheckCircle2, AlertCircle, Zap, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface GlobalAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any; // New prop for editing
}

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
    trackingMethod: (initialData?.trackingMethod || 'none') as 'none' | 'imei' | 'serial',
    isConfigurable: initialData?.isConfigurable || false,
    attributes: initialData?.attributes || [] as { name: string, values: string[] }[],
    variants: initialData?.variants || [] as any[]
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
        trackingMethod: (initialData?.trackingMethod || 'none') as 'none' | 'imei' | 'serial',
        isConfigurable: initialData?.isConfigurable || false,
        attributes: initialData?.attributes || [] as { name: string, values: string[] }[],
        variants: initialData?.variants || [] as any[]
      });
      setStep(1);
    }
  }, [isOpen, initialData]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skuStatus, setSkuStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const BRANDS = ["Apple", "Samsung", "Huawei", "Xiaomi", "Google", "Oppo", "Vivo"];

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

  const updateAttributeValues = (index: number, valuesString: string) => {
    const newAttrs = [...newProduct.attributes];
    newAttrs[index].values = valuesString.split(',').map(v => v.trim()).filter(v => v !== "");
    setNewProduct({ ...newProduct, attributes: newAttrs });
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
    if (newProduct.attributes.length === 0) {
      toast.error("Please add at least one attribute.");
      return;
    }

    // Cartesian product of attribute values
    const combinations = newProduct.attributes.reduce((acc, attr) => {
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
          stock: 0,
          trackingMethod: newProduct.trackingMethod,
          binLocation: newProduct.binLocation
        };
      } catch (error) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          attributes: combo,
          sku: `SKU-${index}`,
          price: newProduct.price,
          cost: newProduct.cost,
          stock: 0,
          trackingMethod: 'none'
        };
      }
    }));

    setNewProduct({ ...newProduct, variants: newVariants });
    setStep(3);
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    });
  };

  const removeVariant = (id: string) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter(v => v.id !== id)
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let response;
      if (initialData?._id) {
        response = await axios.put(`/api/products/${initialData._id}`, newProduct);
      } else {
        response = await axios.post('/api/products', newProduct);
      }
      
      if (response.status === 201 || response.status === 200) {
        const data = response.data;
        setCreatedProducts(data.variants || [data]);
        setStep(4);
        toast.success(initialData?._id ? "Product updated." : "Product and variants registered successfully.");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
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
      isConfigurable: false,
      attributes: [] as { name: string, values: string[] }[],
      variants: [] as any[]
    });
    setStep(1);
    setCreatedProducts([]);
    onClose();
  };

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
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Brand</label>
                            <input 
                              placeholder="Apple"
                              value={newProduct.brand}
                              onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Category</label>
                            <select 
                              value={newProduct.category}
                              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                              <option className="bg-[#0A0A0A]">Smartphones</option>
                              <option className="bg-[#0A0A0A]">Accessories</option>
                              <option className="bg-[#0A0A0A]">Parts</option>
                            </select>
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
                      <div className="h-10 w-px bg-white/10 mx-4" />
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox"
                          id="globalConfigurable"
                          checked={newProduct.isConfigurable}
                          onChange={(e) => setNewProduct({...newProduct, isConfigurable: e.target.checked})}
                          className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                        />
                        <label htmlFor="globalConfigurable" className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none text-white/40 hover:text-blue-500 transition-colors">
                          Configurable Product
                        </label>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        if (newProduct.isConfigurable) {
                          setStep(2);
                        } else {
                          setStep(3);
                        }
                      }}
                      disabled={!newProduct.name || !newProduct.brand}
                      className="w-full py-4 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-2xl shadow-white/10 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {newProduct.isConfigurable ? "Define Attributes" : "Review Product"} <Zap size={16} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Layers className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Attributes (Variations)</h3>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Define axes of variation</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={addAttribute}
                          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                          <Plus size={16} /> Add Attribute
                        </button>
                      </div>

                      <div className="space-y-6">
                        {newProduct.attributes.map((attr, idx) => (
                          <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4 relative group">
                            <button 
                              type="button"
                              onClick={() => removeAttribute(idx)}
                              className="absolute top-4 right-4 p-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Attribute Name</label>
                                <input 
                                  placeholder="e.g. Color"
                                  value={attr.name}
                                  onChange={(e) => updateAttributeName(idx, e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                                />
                              </div>
                              <div className="col-span-2 space-y-1.5">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Values (Comma separated)</label>
                                <input 
                                  placeholder="e.g. Red, Blue, Black"
                                  value={attr.values.join(', ')}
                                  onChange={(e) => updateAttributeValues(idx, e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {attr.values.map((val, vIdx) => (
                                <span key={vIdx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                  {val}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}

                        {newProduct.attributes.length === 0 && (
                          <div className="py-20 border border-dashed border-white/10 rounded-[2.5rem] text-center">
                            <Layers className="w-12 h-12 text-white/5 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No attributes defined yet</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 py-4 border border-white/10 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] text-white/40 hover:bg-white/5 transition-all"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={generateMatrix}
                          disabled={newProduct.attributes.length === 0}
                          className="flex-[2] py-4 bg-blue-500 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          Generate Variants <Zap className="w-4 h-4 fill-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Variant Matrix ({newProduct.variants.length} variants)</h3>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Review and adjust individual configurations</p>
                      </div>
                      <div className="flex gap-3 relative">
                        {showBulkPrice && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute right-0 bottom-full mb-4 p-4 bg-surface-container border border-border rounded-2xl shadow-2xl z-[100] flex items-center gap-3 w-64"
                          >
                            <input 
                              type="number"
                              placeholder="Price..."
                              value={bulkPrice}
                              onChange={(e) => setBulkPrice(e.target.value)}
                              className="flex-1 bg-surface border border-border rounded-xl p-2 text-xs font-bold text-white outline-none focus:border-blue-500"
                            />
                            <button 
                              onClick={applyBulkPrice}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                              Apply
                            </button>
                            <button 
                              onClick={() => setShowBulkPrice(false)}
                              className="p-2 text-white/20 hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        )}
                        <button 
                          type="button"
                          onClick={() => setShowBulkPrice(!showBulkPrice)}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                        >
                          Set All Prices
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                        >
                          Edit Attributes
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Configuration</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">SKU</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Price</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Cost</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/20">Tracking</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/20 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {newProduct.variants.map((v) => (
                            <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-black text-white uppercase">
                                  {Object.values(v.attributes).join(' / ')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[9px] font-mono text-white/40 font-bold">{v.sku}</span>
                              </td>
                              <td className="px-6 py-4">
                                <input 
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => updateVariant(v.id, 'price', parseFloat(e.target.value))}
                                  className="w-20 bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white outline-none focus:border-blue-500 font-mono"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input 
                                  type="number"
                                  value={v.cost}
                                  onChange={(e) => updateVariant(v.id, 'cost', parseFloat(e.target.value))}
                                  className="w-20 bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white outline-none focus:border-blue-500 font-mono"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={v.trackingMethod}
                                  onChange={(e) => updateVariant(v.id, 'trackingMethod', e.target.value)}
                                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-[8px] font-black text-white outline-none focus:border-blue-500 uppercase tracking-widest"
                                >
                                  <option value="none" className="bg-[#0A0A0A]">None</option>
                                  <option value="serial" className="bg-[#0A0A0A]">Serial</option>
                                  <option value="imei" className="bg-[#0A0A0A]">IMEI</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  type="button"
                                  onClick={() => removeVariant(v.id)}
                                  className="p-2 text-white/10 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 py-4 border border-white/10 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] text-white/40 hover:bg-white/5 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-4 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-2xl shadow-white/10 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <>
                            <CheckCircle2 size={16} /> Finalize Catalog
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
