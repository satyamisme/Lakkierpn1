import React, { useState } from "react";
import { OmnichannelSettings } from "../components/organisms/OmnichannelSettings";
import { Globe, ShoppingBag, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const OmnichannelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"settings" | "bopis">("settings");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Omnichannel Hub</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">E-commerce sync and BOPIS fulfillment</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-2xl">
          {[
            { id: "settings", label: "Sync Settings", icon: Globe },
            { id: "bopis", label: "BOPIS Orders", icon: ShoppingBag },
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
          {activeTab === "settings" && <OmnichannelSettings />}
          {activeTab === "bopis" && (
            <div className="bg-card border border-border p-20 text-center rounded-[2.5rem] opacity-50">
              <ShoppingBag size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">BOPIS Order Management Coming Soon</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OmnichannelPage;
