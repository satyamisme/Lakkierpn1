import React from "react";
import { CampaignManager } from "../components/organisms/CampaignManager";

const MarketingPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <CampaignManager />
    </div>
  );
};

export default MarketingPage;
