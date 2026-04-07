import React from "react";
import { GiftCardForm } from "../components/organisms/GiftCardForm";

const GiftCardsPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Gift Cards</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Issue and manage store gift cards</p>
      </div>
      <GiftCardForm />
    </div>
  );
};

export default GiftCardsPage;
