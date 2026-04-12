import React from 'react';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Package, 
  Wrench, 
  Users,
  Home
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface DownbarProps {
  onSearchClick: () => void;
  onAddProductClick: () => void;
}

export const Downbar: React.FC<DownbarProps> = ({ onSearchClick, onAddProductClick }) => {
  const navigate = useNavigate();

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
      <div className="bg-surface-container-lowest/80 backdrop-blur-2xl border border-border rounded-[2.5rem] p-3 shadow-2xl flex items-center justify-between gap-2">
        <button 
          onClick={() => navigate('/')}
          className="flex-1 flex flex-col items-center gap-1 p-3 hover:bg-surface-container rounded-2xl text-muted-foreground hover:text-primary transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
        </button>
        
        <button 
          onClick={() => navigate('/pos')}
          className="flex-1 flex flex-col items-center gap-1 p-3 hover:bg-surface-container rounded-2xl text-muted-foreground hover:text-primary transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">POS</span>
        </button>

        <button 
          onClick={onAddProductClick}
          className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 -mt-10 border-4 border-surface-container-lowest active:scale-90 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>

        <button 
          onClick={onSearchClick}
          className="flex-1 flex flex-col items-center gap-1 p-3 hover:bg-surface-container rounded-2xl text-muted-foreground hover:text-primary transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Search</span>
        </button>

        <button 
          onClick={() => navigate('/inventory')}
          className="flex-1 flex flex-col items-center gap-1 p-3 hover:bg-surface-container rounded-2xl text-muted-foreground hover:text-primary transition-all"
        >
          <Package className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Stock</span>
        </button>
      </div>
    </div>
  );
};
