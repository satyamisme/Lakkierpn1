import React from "react";
import { SupplierPortal } from "../components/organisms/SupplierPortal";

const SupplierPortalPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Supplier Portal</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Vendor-facing order and inventory management</p>
      </div>
      <SupplierPortal />
    </div>
  );
};

export default SupplierPortalPage;
