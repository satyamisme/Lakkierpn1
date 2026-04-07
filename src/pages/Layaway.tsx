import React from "react";
import { LayawayForm } from "../components/organisms/LayawayForm";

const LayawayPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Layaway Plans</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage installment plans and deposits</p>
      </div>
      <LayawayForm orderId="mock-order-id" totalAmount={150.000} customerId="mock-customer-id" />
    </div>
  );
};

export default LayawayPage;
