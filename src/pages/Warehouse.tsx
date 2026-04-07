import React, { useState } from "react";
import { WarehousePicking } from "../components/organisms/WarehousePicking";
import { WarehousePacking } from "../components/organisms/WarehousePacking";
import { WarehouseReceiving } from "../components/organisms/WarehouseReceiving";
import { Search, Box, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const WarehousePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"picking" | "packing" | "receiving">("picking");

  const tabs = [
    { id: "picking", label: "Picking", icon: Search },
    { id: "packing", label: "Packing", icon: Box },
    { id: "receiving", label: "Receiving", icon: Truck },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Warehouse Logistics</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage picking, packing, and receiving workflows</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-2xl">
          {tabs.map((tab) => (
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
          {activeTab === "picking" && <WarehousePicking />}
          {activeTab === "packing" && <WarehousePacking />}
          {activeTab === "receiving" && <WarehouseReceiving />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WarehousePage;
