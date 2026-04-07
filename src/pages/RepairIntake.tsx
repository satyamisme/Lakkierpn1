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
  MapPin
} from "lucide-react";
import { Gate } from "../components/Gate";

export const RepairIntake: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    phoneModel: "",
    imei: "",
    issue: "",
    estimatedQuote: 0
  });
  const [damageMap, setDamageMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDamage = (part: string) => {
    setDamageMap(prev => ({ ...prev, [part]: !prev[part] }));
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
        body: JSON.stringify({ ...formData, visualDamageMap: damageMap }),
      });

      if (response.ok) {
        alert("Repair job created successfully!");
        setFormData({ customerName: "", customerPhone: "", phoneModel: "", imei: "", issue: "", estimatedQuote: 0 });
        setDamageMap({});
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create job card");
      }
    } catch (error) {
      console.error("Intake error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Gate id={61}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Repair Intake (ID 61)</h1>
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Create new job card & damage map</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer & Device Info */}
          <div className="space-y-6 bg-card border border-border p-8 shadow-xl">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="Customer Name"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-muted border-none pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="Phone Number"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full bg-muted border-none pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="Device Model (e.g. iPhone 13 Pro)"
                  required
                  value={formData.phoneModel}
                  onChange={(e) => setFormData({ ...formData, phoneModel: e.target.value })}
                  className="w-full bg-muted border-none pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
              <div className="relative">
                <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="IMEI / Serial Number"
                  required
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                  className="w-full bg-muted border-none pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
              <textarea 
                placeholder="Issue Description"
                required
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                className="w-full bg-muted border-none p-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none min-h-[100px]"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">KD</span>
                <input 
                  type="number" 
                  placeholder="Estimated Quote"
                  required
                  value={formData.estimatedQuote}
                  onChange={(e) => setFormData({ ...formData, estimatedQuote: parseFloat(e.target.value) })}
                  className="w-full bg-muted border-none pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Visual Damage Mapper */}
          <div className="space-y-6 bg-card border border-border p-8 shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Visual Damage Mapper
            </h3>
            
            <div className="relative aspect-[1/2] max-w-[200px] mx-auto border-4 border-muted rounded-[40px] p-2 bg-muted/20">
              {/* Mock Phone SVG with clickable regions */}
              <svg viewBox="0 0 100 200" className="w-full h-full">
                {['Screen', 'Back Glass', 'Camera', 'Frame', 'Charging Port', 'Buttons'].map((part, i) => (
                  <rect
                    key={part}
                    x="10"
                    y={20 + (i * 25)}
                    width="80"
                    height="20"
                    rx="4"
                    onClick={() => toggleDamage(part)}
                    className={`cursor-pointer transition-all ${damageMap[part] ? 'fill-red-500/50 stroke-red-500' : 'fill-primary/5 stroke-primary/20 hover:fill-primary/10'}`}
                    strokeWidth="1"
                  />
                ))}
                {['Screen', 'Back Glass', 'Camera', 'Frame', 'Charging Port', 'Buttons'].map((part, i) => (
                  <text
                    key={`${part}-text`}
                    x="50"
                    y={33 + (i * 25)}
                    textAnchor="middle"
                    className="text-[6px] font-black uppercase pointer-events-none fill-foreground"
                  >
                    {part}
                  </text>
                ))}
              </svg>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(damageMap).filter(([_, v]) => v).map(([part]) => (
                <span key={part} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest">
                  {part}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-4 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">
                <Camera size={16} /> Add Photos
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 w-full bg-primary text-primary-foreground py-5 font-black text-sm uppercase tracking-[0.3em] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <CheckCircle2 size={20} />
                Generate Job Card
              </>
            )}
          </button>
        </form>
      </div>
    </Gate>
  );
};
