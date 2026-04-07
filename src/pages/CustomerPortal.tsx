import React from "react";
import { CustomerPortalDashboard } from "../components/organisms/CustomerPortalDashboard";

const CustomerPortalPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <CustomerPortalDashboard customerId="current-customer-id" />
    </div>
  );
};

export default CustomerPortalPage;
