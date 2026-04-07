import React from "react";
import { HardwareSettings } from "../components/organisms/HardwareSettings";

const HardwarePage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Hardware Integration</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage printers, scanners, and POS peripherals</p>
      </div>
      <HardwareSettings />
    </div>
  );
};

export default HardwarePage;
