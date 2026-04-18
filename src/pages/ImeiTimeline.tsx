import React, { useState } from "react";
import { ImeiTimeline as ImeiTimelineOrg } from "../components/organisms/ImeiTimeline";
import { useImeiTimelineStore } from "../store/useImeiTimelineStore";
import { Search, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const ImeiTimeline: React.FC = () => {
  const [imei, setImei] = useState("");
  const { history, isLoading, fetchHistory } = useImeiTimelineStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei) return;
    try {
      await fetchHistory(imei);
    } catch (error) {
      toast.error("Failed to fetch IMEI history");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">IMEI Lifecycle</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Track device history from purchase to sale</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder="Enter 15-digit IMEI..."
            className="w-full bg-muted border-none pl-10 pr-4 py-4 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </form>

      {history.length > 0 && <ImeiTimelineOrg imei={imei} history={history} />}
    </div>
  );
};
