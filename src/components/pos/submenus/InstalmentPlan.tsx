import React, { useState } from "react";
import { Landmark, ShieldCheck, Clock, Zap, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export const InstalmentPlan: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providers = [
    { id: 'tamara', name: 'Tamara', description: 'Split in 4 payments - 0% Interest', image: 'https://cdn.tamara.co/assets/tamara_logo_en.png' },
    { id: 'tabby', name: 'Tabby', description: 'Pay later or in instalments', image: 'https://tabby.ai/tabby-logo.png' },
    { id: 'inhouse', name: 'Lakki In-House', description: 'For corporate clients & payroll', icon: Landmark }
  ];

  return (
    <div className="flex flex-col h-full space-y-10 p-4">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-serif italic text-white tracking-tight">Financial Matrix</h2>
        <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.6em]">Deferred Payment Stratification</p>
      </div>

      <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
         {providers.map((provider) => (
           <motion.div
             key={provider.id}
             whileHover={{ y: -10 }}
             onClick={() => setSelectedProvider(provider.id)}
             className={`p-10 rounded-[3rem] border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-8 ${
               selectedProvider === provider.id 
               ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/20 scale-105' 
               : 'bg-white/5 border-white/5 hover:border-white/20'
             }`}
           >
              <div className="w-32 h-32 flex items-center justify-center bg-white/5 rounded-[2rem]">
                 {provider.image ? (
                   <img 
                     src={provider.image} 
                     alt={provider.name} 
                     className="w-20 h-auto grayscale group-hover:grayscale-0 transition-all opacity-40 hover:opacity-100" 
                     referrerPolicy="no-referrer"
                   />
                 ) : (
                   <provider.icon size={48} className="text-white/20" />
                 )}
              </div>
              <div>
                 <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{provider.name}</h4>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed px-4">{provider.description}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                 {selectedProvider === provider.id ? (
                   <ShieldCheck size={20} className="text-primary" />
                 ) : (
                   <div className="w-2 h-2 rounded-full bg-white/10" />
                 )}
              </div>
           </motion.div>
         ))}
      </div>

      <div className="max-w-xl mx-auto w-full space-y-6">
         <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
               <AlertCircle size={24} />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-relaxed">
               All instalment plans require pre-approval via SMS link. Identity verification node must be active before proceeding to checkout.
            </p>
         </div>
         
         <button 
           disabled={!selectedProvider}
           className="w-full py-6 bg-white text-black text-[12px] font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
         >
           Confirm Provider & Link Sale
         </button>
      </div>

      <div className="flex justify-center gap-12 pt-4">
         {[
           { label: 'Instant Approval', icon: Zap },
           { label: '0% Processing', icon: ShieldCheck },
           { label: 'Flexible Tenure', icon: Clock }
         ].map((feat, i) => (
           <div key={i} className="flex items-center gap-3 opacity-20">
              <feat.icon size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">{feat.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
};
