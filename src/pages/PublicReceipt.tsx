import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, MapPin, Phone, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const PublicReceipt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await axios.get(`/api/sales/lookup?q=${id}`);
        setSale(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Receipt Verification Failed");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSale();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Access Denied</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">{error || "Invalid Receipt Cluster"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12 selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
        {/* Verification Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] font-black text-green-500 uppercase tracking-widest leading-none">
          <CheckCircle2 size={10} /> Verified Authentic
        </div>

        <div className="p-12 border-b border-white/5 bg-white/[0.02]">
           <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
                 <Smartphone className="w-8 h-8 text-black fill-black" />
              </div>
              <div>
                 <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Lakki Phone</h1>
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Enterprise Transaction Record</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
              <div>
                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1.5">Record Number</p>
                 <p className="text-sm font-black font-mono text-white/80">{sale.saleNumber}</p>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1.5">Issue Timestamp</p>
                 <p className="text-sm font-black font-mono text-white/80">{new Date(sale.createdAt).toLocaleDateString()}</p>
              </div>
           </div>
        </div>

        <div className="p-12 space-y-8">
           <div className="space-y-4">
              {sale.items.map((item: any, i: number) => (
                 <div key={i} className="flex justify-between items-start gap-4 group">
                    <div className="flex-1">
                       <h4 className="text-[11px] font-black text-white/80 uppercase leading-snug">{item.productId?.name || "Product Item"}</h4>
                       <p className="text-[8px] font-mono text-white/20 font-bold mt-1 tracking-tighter uppercase">{item.imei || "Standard Unit"}</p>
                    </div>
                    <span className="text-sm font-black font-mono text-white/60">KD {item.price.toFixed(3)}</span>
                 </div>
              ))}
           </div>

           <div className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                 <span>Subtotal Settlement</span>
                 <span className="text-white/60">KD {sale.subtotal.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-destructive">
                 <span>Efficiency Credit</span>
                 <span>-KD {sale.discount.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t-2 border-white/10">
                 <span className="text-4xl font-serif italic text-white leading-none">Aggregate Total</span>
                 <div className="text-right leading-none">
                    <span className="text-4xl font-black text-primary-foreground font-mono tracking-tighter leading-none">{sale.total.toFixed(3)}</span>
                    <span className="text-[10px] font-black text-primary-foreground ml-3 uppercase tracking-widest">KD</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex flex-col items-center gap-4 text-center">
           <div className="flex items-center gap-6 text-[9px] font-black text-white/10 uppercase tracking-widest">
              <div className="flex items-center gap-2"><MapPin size={12} /> Kuwait Operations Hub</div>
              <div className="flex items-center gap-2"><Phone size={12} /> +965 2222 3333</div>
           </div>
           <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.2em] italic max-w-[80%] line-clamp-2">
              This digital ledger entry serves as a legally binding validation of transaction #{sale.saleNumber}.
              Please retain this record for all warranty claims and reconciliation activities.
           </p>
        </div>
      </div>
      
      {/* Print Trigger */}
      <div className="flex justify-center mt-8">
         <button 
           onClick={() => window.print()}
           className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
         >
           Initialize Physical Export
         </button>
      </div>
    </div>
  );
};
