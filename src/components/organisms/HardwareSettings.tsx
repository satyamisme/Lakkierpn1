import React, { useEffect } from "react";
import { useHardwareStore } from "../../store/useHardwareStore";
import { Printer, Scan, DollarSign, RefreshCw, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const HardwareSettings: React.FC = () => {
  const { status, isLoading, fetchStatus, testPrinter, testScanner, openCashDrawer } = useHardwareStore();

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTest = async (type: "printer" | "scanner" | "drawer") => {
    try {
      if (type === "printer") await testPrinter("default");
      if (type === "scanner") await testScanner("default");
      if (type === "drawer") await openCashDrawer("default");
      toast.success(`${type} test successful`);
    } catch (error) {
      toast.error(`${type} test failed`);
    }
  };

  const StatusIndicator = ({ state }: { state: "online" | "offline" | undefined }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
      state === "online" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {state === "online" ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {state || "unknown"}
    </div>
  );

  return (
    <div className="space-y-8 bg-card p-8 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <RefreshCw className="text-primary w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Hardware Integration</h2>
        </div>
        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Printer */}
        <div className="p-6 bg-muted/30 border border-border rounded-2xl space-y-4 flex flex-col">
          <div className="flex justify-between items-start">
            <Printer className="text-primary" size={32} />
            <StatusIndicator state={status?.printer} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight">Thermal Printer</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">80mm USB/Network</p>
          </div>
          <button
            onClick={() => handleTest("printer")}
            className="mt-auto w-full bg-card border border-border py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
          >
            Test Print
          </button>
        </div>

        {/* Scanner */}
        <div className="p-6 bg-muted/30 border border-border rounded-2xl space-y-4 flex flex-col">
          <div className="flex justify-between items-start">
            <Scan className="text-primary" size={32} />
            <StatusIndicator state={status?.scanner} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight">Barcode Scanner</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">HID / Serial Mode</p>
          </div>
          <button
            onClick={() => handleTest("scanner")}
            className="mt-auto w-full bg-card border border-border py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
          >
            Test Scanner
          </button>
        </div>

        {/* Cash Drawer */}
        <div className="p-6 bg-muted/30 border border-border rounded-2xl space-y-4 flex flex-col">
          <div className="flex justify-between items-start">
            <DollarSign className="text-primary" size={32} />
            <StatusIndicator state={status?.cashDrawer} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight">Cash Drawer</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">RJ11 via Printer</p>
          </div>
          <button
            onClick={() => handleTest("drawer")}
            className="mt-auto w-full bg-card border border-border py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
          >
            Kick Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
