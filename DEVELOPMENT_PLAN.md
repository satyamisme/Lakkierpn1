# Lakki Terminal OS - Technical Development Plan

This document provides technical guidance for developers implementing the 100 atomic pages.

## 1. Component Architecture
Each atomic page should follow this structure:

```tsx
// src/pages/[Category]/[PageName].tsx
import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../../components/ui/GlassCard';
import { DataTable } from '../../components/ui/DataTable';

export const PageName: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Feature Name</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Sub-description</p>
        </div>
        {/* Actions */}
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Bento Grid Layout */}
      </div>
    </motion.div>
  );
};
```

## 2. Data Layer Strategy
- **State Management**: Use `Zustand` for global state (Auth, Cart, Settings) and local `useState` for page-specific data.
- **API Calls**: Use the `axios` instance with interceptors for auth headers.
- **Real-time**: Subscribe to `Socket.io` events in `useEffect` and clean up on unmount.
- **Offline**: Use `idb` (IndexedDB) for local storage and the `useOfflineQueue` hook for syncing.

## 3. Styling Guidelines (Obsidian Theme)
- **Backgrounds**: Pure black `#000000` or deep gray `#0A0A0A`.
- **Surfaces**: `bg-white/5` with `backdrop-blur-3xl` and `border-white/10`.
- **Typography**: 
    - Headers: `font-black uppercase tracking-tighter`.
    - Labels: `text-[9px] font-black uppercase tracking-[0.3em] text-white/20`.
    - Monospace: Use for IDs, SKUs, and metrics.
- **Accents**: 
    - Primary: `text-blue-500` / `bg-blue-500`.
    - Success: `text-green-500`.
    - Danger: `text-red-500`.

## 4. Implementation Workflow for a New Page
1. **Define Route**: Add the page to `src/constants/navigation.ts`.
2. **Create Component**: Create the `.tsx` file in `src/pages/`.
3. **Register in Renderer**: Update `src/components/ModuleRenderer.tsx` to lazy-load and route to the new component.
4. **Backend Endpoint**: Create the corresponding Express route in `server.ts` and Mongoose model if needed.
5. **Audit Trail**: Ensure every write operation triggers a `SystemPulse` log entry.

## 5. Performance Requirements
- **Lighthouse Score**: Aim for 90+ on Desktop.
- **Virtualization**: Any list exceeding 50 items MUST use `FixedSizeList` or `VariableSizeList` from `react-window`.
- **Bundle Size**: Use dynamic imports (`lazy`) for every page to keep the initial load under 500KB.
- **Memoization**: Use `useMemo` and `useCallback` for expensive calculations and event handlers in high-density grids.
