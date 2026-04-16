import React, { useState } from "react";
import { QualityControlInspection } from "../components/organisms/QualityControlInspection";
import { QualityControlHistory } from "../components/organisms/QualityControlHistory";
import { ShieldCheck, List, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const QualityControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [refId, setRefId] = useState("");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Quality Control</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Device inspection and QC workflows</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-2xl">
          {[
            { id: "new", label: "New Inspection", icon: ShieldCheck },
            { id: "history", label: "QC History", icon: List },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "new" && (
            <div className="space-y-6">
              <div className="bg-card border border-border p-6 flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enter Repair or PO ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={refId}
                      onChange={(e) => setRefId(e.target.value)}
                      className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
                      placeholder="REP-XXXX or PO-XXXX"
                    />
                  </div>
                </div>
              </div>
              {refId && (
                <QualityControlInspection 
                  type={refId.startsWith('REP') ? 'repair' : 'incoming'} 
                  referenceId={refId} 
                  onSuccess={() => setRefId("")}
                />
              )}
            </div>
          )}
          {activeTab === "history" && <QualityControlHistory />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// export default QualityControlPage;
