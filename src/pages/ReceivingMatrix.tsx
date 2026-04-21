import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Scan, 
  DollarSign, 
  Package, 
  Truck, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import api from '../api/client';
import { toast } from 'sonner';
import { ProcurementHeader } from '../components/organisms/ProcurementMatrix/ProcurementHeader';
import { ProductManifest } from '../components/organisms/ProcurementMatrix/ProductManifest';
import { SerialTunnel } from '../components/organisms/ProcurementMatrix/SerialTunnel';
import { FinancialReconciliation } from '../components/organisms/ProcurementMatrix/FinancialReconciliation';

export const ReceivingMatrix: React.FC = () => {
  const [stage, setStage] = useState(1);
  const [header, setHeader] = useState({
    supplierId: '',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    storeId: '',
    notes: ''
  });
  
  const [manifest, setManifest] = useState<any[]>([]);
  const [isTunnelOpen, setIsTunnelOpen] = useState(false);
  const [activeTunnelIndex, setActiveTunnelIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHeaderComplete = (data: any) => {
    setHeader(data);
    setStage(2);
  };

  const handleAddToManifest = (product: any) => {
    if (manifest.find(m => m.productId === product._id)) {
      toast.error("Product already in manifest");
      return;
    }
    setManifest([...manifest, {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      quantity: 1,
      costPrice: product.cost || 0,
      retailPrice: product.price || 0,
      serials: [],
      trackingMethod: product.trackingMethod || 'none'
    }]);
  };

  const updateManifestItem = (index: number, updates: any) => {
    const newManifest = [...manifest];
    newManifest[index] = { ...newManifest[index], ...updates };
    setManifest(newManifest);
  };

  const removeItem = (index: number) => {
    setManifest(manifest.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!header.supplierId || !header.storeId) {
      toast.error("Please complete the Header details");
      return;
    }
    if (manifest.length === 0) {
      toast.error("Manifest is empty");
      return;
    }

    // Validation: check if quantity matches serials for IMEI tracked items
    for (const item of manifest) {
      if (item.trackingMethod !== 'none' && item.serials.length !== item.quantity) {
        toast.error(`Serial numbers for ${item.name} (${item.serials.length}) do not match received quantity (${item.quantity})`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/inventory/unified-intake', {
        header,
        items: manifest
      });
      toast.success(response.data.message || "Matrix Receipt Confirmed");
      // Reset flow
      setStage(1);
      setManifest([]);
      setHeader({
        supplierId: '',
        referenceNo: '',
        date: new Date().toISOString().split('T')[0],
        storeId: '',
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Intake Halted");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* OS Navigation Bar */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Receiving Matrix</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Procurement & Physical Ingestion Hub</p>
        </div>
        
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stage >= s ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/5'}`} />
              {s < 4 && <div className="w-8 h-[1px] bg-white/5" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Flow Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ProcurementHeader 
            data={header} 
            onChange={setHeader} 
            active={stage === 1}
            onComplete={() => setStage(2)}
          />
          
          <div className={`p-6 rounded-[2rem] border transition-all ${stage > 1 ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Package size={14} className="text-blue-500" />
              Manifest Logic
            </h3>
            <p className="text-[11px] text-white/20 font-bold leading-relaxed">
              Add products in Stage 2. Define quantity and scan serials in Stage 3.
            </p>
          </div>

          {stage >= 4 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? <CheckCircle2 className="animate-spin" /> : <CheckCircle2 />}
              Confirm Receipt
            </motion.button>
          )}
        </div>

        {/* Right Column: Physical Manifest Matrix */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {(stage >= 1) && (
            <ProductManifest 
              items={manifest}
              onAdd={handleAddToManifest}
              onUpdate={updateManifestItem}
              onRemove={removeItem}
              onScan={(index) => {
                setActiveTunnelIndex(index);
                setIsTunnelOpen(true);
              }}
              active={stage === 2}
              onNext={() => setStage(3)}
            />
          )}

          {stage >= 3 && (
            <FinancialReconciliation 
              items={manifest}
              onUpdate={updateManifestItem}
              active={stage === 3}
              onNext={() => setStage(4)}
            />
          )}
        </div>
      </div>

      {/* High-Density Identifier Tunnel Overlay */}
      <AnimatePresence>
        {isTunnelOpen && activeTunnelIndex !== null && (
          <SerialTunnel 
            product={manifest[activeTunnelIndex]}
            onClose={() => setIsTunnelOpen(false)}
            onSave={(serials) => {
              updateManifestItem(activeTunnelIndex, { serials });
              setIsTunnelOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
