import React, { useState, useEffect } from "react";
import { StaffLeaderboard } from "../components/organisms/StaffLeaderboard";
import { CommissionReport } from "../components/organisms/CommissionReport";
import { useLeaderboardStore } from "../store/useLeaderboardStore";
import { useCommissionStore } from "../store/useCommissionStore";
import { Trophy, Wallet, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const StaffPerformancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "my-commission">("leaderboard");
  const { entries, isLoading: leaderboardLoading, fetchLeaderboard } = useLeaderboardStore();
  const { currentReport, isLoading: reportLoading, fetchReport } = useCommissionStore();

  useEffect(() => {
    fetchLeaderboard("monthly");
    fetchReport("current-user-id", "2024-03"); // Mock IDs
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Staff Performance</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Leaderboards and commission tracking</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-2xl">
          {[
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
            { id: "my-commission", label: "My Commission", icon: Wallet },
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
          {activeTab === "leaderboard" && (
            leaderboardLoading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div> : <StaffLeaderboard entries={entries} />
          )}
          {activeTab === "my-commission" && (
            reportLoading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div> : currentReport && <CommissionReport report={currentReport} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StaffPerformancePage;
