import React from "react";
import { InventoryIntelligence } from "../components/organisms/InventoryIntelligence";

const InventoryIntelligencePage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Inventory Intelligence</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">AI-powered demand forecasting and stock optimization</p>
      </div>
      <InventoryIntelligence />
    </div>
  );
};

export default InventoryIntelligencePage;
