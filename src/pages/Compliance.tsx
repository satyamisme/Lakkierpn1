import React, { useState } from "react";
import { ComplianceReport } from "../components/organisms/ComplianceReport";
import { AuditLogViewer } from "../components/organisms/AuditLogViewer";
import { ZReportReconciler } from "../components/organisms/ZReportReconciler";
import { ShieldCheck, List, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Compliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"export" | "audit" | "z-report">("export");

  const tabs = [
    { id: "export", label: "Tax Export", icon: FileText },
    { id: "audit", label: "Audit Logs", icon: List },
    { id: "z-report", label: "Z-Reports", icon: ShieldCheck },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Compliance & Audit</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Government reporting and system audit trails</p>
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
          {activeTab === "export" && <ComplianceReport />}
          {activeTab === "audit" && <AuditLogViewer />}
          {activeTab === "z-report" && <ZReportReconciler />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// export default CompliancePage;
