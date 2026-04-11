import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Smartphone, 
  User, 
  Phone, 
  AlertCircle, 
  Camera, 
  CheckCircle2, 
  Loader2,
  MapPin,
  Plus,
  Search
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";

import { toast } from "sonner";

export const RepairIntake: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    phoneModel: "",
    imei: "",
    issue: "",
    estimatedQuote: 0,
    isWarranty: false,
    isUrgent: false,
    parts: [] as any[]
  });
  const [damageMap, setDamageMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [partSearch, setPartSearch] = useState("");

  React.useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await fetch('/api/products?category=Parts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableParts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch parts error:", err);
    }
  };

  const addPart = (part: any) => {
    if (formData.parts.find(p => p._id === part._id)) return;
    const newParts = [...formData.parts, part];
    const newQuote = newParts.reduce((sum, p) => sum + p.price, 0) + 15; // Base labor 15 KD
    setFormData({ ...formData, parts: newParts, estimatedQuote: newQuote });
    toast.success(`Part added: ${part.name}`);
  };

  const removePart = (id: string) => {
    const newParts = formData.parts.filter(p => p._id !== id);
    const newQuote = newParts.reduce((sum, p) => sum + p.price, 0) + 15;
    setFormData({ ...formData, parts: newParts, estimatedQuote: newQuote });
  };

  const toggleDamage = (part: string) => {
    setDamageMap(prev => ({ ...prev, [part]: !prev[part] }));
  };

  const addPhoto = () => {
    const newPhoto = `https://picsum.photos/seed/${Math.random()}/800/600`;
    setPhotos(prev => [...prev, newPhoto]);
    toast.info("Photo captured and attached");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, visualDamageMap: damageMap, photos }),
      });

      if (response.ok) {
        toast.success("Repair job created successfully!");
        setFormData({ 
          customerName: "", 
          customerPhone: "", 
          phoneModel: "", 
          imei: "", 
          issue: "", 
          estimatedQuote: 0,
          isWarranty: false,
          isUrgent: false,
          parts: []
        });
        setDamageMap({});
        setPhotos([]);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create job card");
      }
    } catch (error) {
      console.error("Intake error:", error);
      toast.error("Network error: Failed to sync with matrix");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Gate id={61}>
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl font-serif italic tracking-tight text-foreground leading-none">Repair Intake</h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Job card generation & asset mapping (ID 61)</p>
          </div>
          <div className="flex items-center gap-6 px-8 py-4 bg-surface-container-lowest border border-border rounded-2xl shadow-sm">
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Store Node</div>
              <div className="text-sm font-black uppercase tracking-tighter">Salmiya Branch #04</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <MapPin className="text-primary" size={20} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Customer & Device (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm space-y-8">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <User size={14} /> Customer Intelligence
                </h3>
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="Customer Name"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="Phone Number"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-border">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <Smartphone size={14} /> Asset Specification
                </h3>
                <div className="space-y-4">
                  <div className="relative group">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="Device Model"
                      required
                      value={formData.phoneModel}
                      onChange={(e) => setFormData({ ...formData, phoneModel: e.target.value })}
                      className="w-full bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <AlertCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="IMEI / Serial Number"
                      required
                      value={formData.imei}
                      onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                      className="w-full bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <textarea 
                    placeholder="Describe the anomaly..."
                    required
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="w-full bg-surface border border-border p-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Parts & Quote (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm space-y-8">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <Plus size={14} /> Component Allocation
                </h3>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="text"
                    placeholder="Search Inventory Matrix..."
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    className="w-full bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                  />
                  <AnimatePresence>
                    {partSearch && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full bg-surface-container-lowest border border-border mt-2 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar"
                      >
                        {availableParts.filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase())).map(p => (
                          <div 
                            key={p._id}
                            onClick={() => {
                              addPart(p);
                              setPartSearch("");
                            }}
                            className="p-4 hover:bg-muted cursor-pointer text-[10px] font-black uppercase tracking-widest flex justify-between items-center group/item"
                          >
                            <span className="group-hover/item:text-primary transition-colors">{p.name}</span>
                            <span className="text-primary font-mono font-black">{p.price.toFixed(3)} KD</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  {formData.parts.map(p => (
                    <motion.div 
                      key={p._id} 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl group"
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest truncate flex-1">{p.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono font-black text-primary">{p.price.toFixed(3)}</span>
                        <button onClick={() => removePart(p._id)} className="text-red-500 hover:text-red-700 transition-colors">
                          <AlertCircle size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {formData.parts.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl opacity-40">
                      <p className="text-[9px] font-black uppercase tracking-widest">No parts allocated</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-border">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Financial Projection</h3>
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Inc. Labor 15.000 KD</div>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-mono font-black text-sm">KD</span>
                  <input 
                    type="number" 
                    placeholder="0.000"
                    required
                    value={formData.estimatedQuote}
                    onChange={(e) => setFormData({ ...formData, estimatedQuote: parseFloat(e.target.value) })}
                    className="w-full bg-surface border border-border pl-14 pr-6 py-5 rounded-2xl text-2xl font-black font-mono outline-none focus:border-primary transition-all text-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isWarranty: !formData.isWarranty })}
                    className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      formData.isWarranty ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-surface text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    Warranty (ID 64)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isUrgent: !formData.isUrgent })}
                    className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      formData.isUrgent ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-surface text-muted-foreground border-border hover:border-red-500/50'
                    }`}
                  >
                    Urgent (ID 65)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Damage & Photos (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <MapPin size={14} /> Visual Damage Matrix
              </h3>
              
              <div className="relative aspect-[1/2] max-w-[200px] mx-auto border-[8px] border-surface-container rounded-[40px] p-2 bg-surface shadow-inner">
                <svg viewBox="0 0 100 200" className="w-full h-full">
                  {['Screen', 'Back Glass', 'Camera', 'Frame', 'Port', 'Buttons'].map((part, i) => (
                    <rect
                      key={part}
                      x="10"
                      y={20 + (i * 25)}
                      width="80"
                      height="20"
                      rx="4"
                      onClick={() => toggleDamage(part)}
                      className={`cursor-pointer transition-all duration-500 ${damageMap[part] ? 'fill-red-500/40 stroke-red-500' : 'fill-primary/5 stroke-primary/10 hover:fill-primary/20'}`}
                      strokeWidth="1"
                    />
                  ))}
                  {['Screen', 'Back Glass', 'Camera', 'Frame', 'Port', 'Buttons'].map((part, i) => (
                    <text
                      key={`${part}-text`}
                      x="50"
                      y={32 + (i * 25)}
                      textAnchor="middle"
                      className="text-[6px] font-black uppercase pointer-events-none fill-foreground/40 group-hover:fill-foreground transition-colors"
                    >
                      {part}
                    </text>
                  ))}
                </svg>
              </div>

              <div className="space-y-6 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                    <Camera size={14} /> Pre-Repair Evidence
                  </h3>
                  <span className="text-[9px] font-mono font-black text-muted-foreground">{photos.length}/4</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-surface border-2 border-dashed border-border rounded-2xl flex items-center justify-center relative group overflow-hidden transition-all hover:border-primary/50">
                      {photos[i] ? (
                        <>
                          <img 
                            src={photos[i]} 
                            alt={`Evidence ${i}`} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                          />
                          <button 
                            type="button"
                            onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                          >
                            <AlertCircle size={12} />
                          </button>
                        </>
                      ) : (
                        <Camera className="text-muted-foreground/20 group-hover:text-primary/30 transition-colors" size={32} />
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={addPhoto}
                  disabled={photos.length >= 4}
                  className="w-full flex items-center justify-center gap-3 py-4 border border-primary text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 rounded-2xl"
                >
                  <Plus size={16} /> Capture Device Photo
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground text-background py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl shadow-foreground/20"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <CheckCircle2 size={20} />
                  Authorize & Generate Job Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Gate>
  );
};
