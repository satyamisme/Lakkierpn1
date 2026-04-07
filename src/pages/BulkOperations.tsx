import React, { useState } from "react";
import { BulkBarcodeScanner } from "../components/organisms/BulkBarcodeScanner";
import { BulkPriceUpdater } from "../components/organisms/BulkPriceUpdater";
import { BulkLabelPrinter } from "../components/organisms/BulkLabelPrinter";
import { Barcode, DollarSign, Printer, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const BulkOperationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"prices" | "labels" | "scanner">("prices");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const tabs = [
    { id: "prices", label: "Price Update", icon: DollarSign },
    { id: "labels", label: "Label Print", icon: Printer },
    { id: "scanner", label: "Bulk Scan", icon: Barcode },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Bulk Operations</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Mass updates, imports, and label generation</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "scanner") setIsScannerOpen(true);
                else setActiveTab(tab.id as any);
              }}
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
          {activeTab === "prices" && <BulkPriceUpdater />}
          {activeTab === "labels" && <BulkLabelPrinter />}
          {activeTab === "scanner" && (
            <div className="bg-card border border-border p-20 text-center rounded-[2.5rem] opacity-50">
              <Layers size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">Select an operation above</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <BulkBarcodeScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onComplete={(barcodes) => {
          console.log("Scanned barcodes:", barcodes);
          setActiveTab("labels"); // Switch to labels to print for scanned items
        }}
      />
    </div>
  );
};

export default BulkOperationsPage;
