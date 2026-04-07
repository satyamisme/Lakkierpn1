import React, { useEffect } from "react";
import { useSupplierPortalStore } from "../../store/useSupplierPortalStore";
import { Building2, Package, AlertTriangle, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export const SupplierPortal: React.FC = () => {
  const { orders, alerts, isLoading, fetchOrders, fetchAlerts, updateOrderStatus } = useSupplierPortalStore();

  useEffect(() => {
    fetchOrders();
    fetchAlerts();
  }, []);

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateOrderStatus(id, status);
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <Building2 className="text-primary w-6 h-6" />
          Vendor Dashboard
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active POs */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4">Active Purchase Orders</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : orders.map((order) => (
              <div key={order.id} className="bg-card border border-border p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black uppercase tracking-tight text-lg">PO #{order.poNumber}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {["confirmed", "shipped"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(order.id, status as any)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          order.status === status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">{item.name} x {item.quantity}</span>
                      <span>{(item.price * item.quantity).toFixed(3)} KD</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Amount</span>
                  <span className="text-lg font-black text-primary">{order.totalAmount.toFixed(3)} KD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4">Inventory Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.productId} className="bg-red-50 border border-red-100 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Low Stock Alert</span>
                </div>
                <h4 className="font-black uppercase tracking-tight text-sm text-red-900">{alert.name}</h4>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-red-700">
                  <span>Current: {alert.currentStock}</span>
                  <span>Min: {alert.minThreshold}</span>
                </div>
                <button className="w-full bg-red-600 text-white py-2 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                  <ExternalLink size={12} /> Propose Restock
                </button>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="bg-green-50 border border-green-100 p-8 rounded-xl text-center">
                <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest text-green-700">All stock levels healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
