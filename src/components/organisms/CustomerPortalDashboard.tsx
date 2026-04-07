import React, { useEffect } from "react";
import { useCustomerPortalStore } from "../../store/useCustomerPortalStore";
import { ShoppingBag, Wrench, Star, Clock, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface CustomerPortalDashboardProps {
  customerId: string;
}

export const CustomerPortalDashboard: React.FC<CustomerPortalDashboardProps> = ({ customerId }) => {
  const { orders, repairStatus, loyaltyPoints, isLoading, fetchOrders, fetchLoyaltyPoints } = useCustomerPortalStore();

  useEffect(() => {
    fetchOrders(customerId);
    fetchLoyaltyPoints(customerId);
  }, [customerId]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between bg-primary p-8 rounded-[2.5rem] text-primary-foreground shadow-xl shadow-primary/20">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">My Dashboard</h2>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mt-1">Welcome back to Lakki Phone</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Loyalty Points</div>
          <div className="text-4xl font-black flex items-center gap-2 justify-end">
            <Star className="fill-current" size={24} />
            {loyaltyPoints}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest px-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" /> Recent Orders
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : orders.map((order) => (
              <div key={order.id} className="bg-card border border-border p-4 flex items-center justify-between group hover:border-primary transition-all">
                <div>
                  <h4 className="font-black uppercase tracking-tight">Order #{order.orderNumber}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.total.toFixed(3)} KD
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                    {order.status}
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repair Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest px-4 flex items-center gap-2">
            <Wrench size={16} className="text-primary" /> Active Repairs
          </h3>
          {repairStatus ? (
            <div className="bg-card border border-border p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black uppercase tracking-tight text-lg">{repairStatus.device}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ticket: {repairStatus.ticketNumber}</p>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                  <Clock size={24} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                  <span>Progress</span>
                  <span className="text-primary">{repairStatus.status}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              {repairStatus.estimatedCompletion && (
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                  Est. Completion: {new Date(repairStatus.estimatedCompletion).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 border border-dashed border-border p-12 rounded-[2rem] text-center opacity-50">
              <Wrench size={32} className="mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">No active repairs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
