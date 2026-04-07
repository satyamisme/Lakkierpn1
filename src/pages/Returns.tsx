import React, { useState, useEffect } from "react";
import { returnsService, ReturnRequest } from "../api/services/returns";
import { RefreshCw, Search, CheckCircle, XCircle, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const data = await returnsService.getAll();
      setReturns(data);
    } catch (error) {
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: ReturnRequest["status"]) => {
    try {
      await returnsService.updateStatus(id, status);
      toast.success(`Return ${status}`);
      fetchReturns();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <RefreshCw className="text-primary w-8 h-8" />
            RMA & Returns
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage product returns and warranty claims</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Order ID..."
            className="w-full bg-muted border-none pl-10 pr-4 py-2 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : returns.map((ret) => (
          <div key={ret._id} className="bg-card border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary transition-all">
            <div className="flex items-center gap-6">
              <div className="bg-muted p-4 rounded-2xl">
                <Package className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg">Order #{ret.orderId}</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  <span>Customer: {ret.customerId}</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>Reason: {ret.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</div>
                <div className={`text-xs font-black uppercase tracking-widest mt-1 ${
                  ret.status === 'approved' ? 'text-green-500' :
                  ret.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {ret.status}
                </div>
              </div>
              
              {ret.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(ret._id, 'rejected')}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(ret._id, 'approved')}
                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                  >
                    <CheckCircle size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {!loading && returns.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <RefreshCw size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest">No return requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnsPage;
