import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export type AppRole = 'super-admin' | 'manager' | 'cashier' | 'technician';

interface PermissionContextType {
  permissions: number[];
  role: AppRole;
  hasPermission: (id: number) => boolean;
  setPermissions: (permissions: number[]) => void;
  switchRole: (role: AppRole) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Initialize socket once
const socket = io();

// Global Fetch Interceptor for Authorization Header
const originalFetch = window.fetch;
try {
  Object.defineProperty(window, 'fetch', {
    value: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init = { ...init, headers };
      }
      return originalFetch(input, init);
    },
    configurable: true,
    writable: true
  });
} catch (e) {
  console.warn('Could not override window.fetch directly, falling back to assignment:', e);
  // Fallback for environments where defineProperty might fail but assignment might work (unlikely given the error)
  try {
    (window as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init = { ...init, headers };
      }
      return originalFetch(input, init);
    };
  } catch (e2) {
    console.error('Failed to intercept fetch globally:', e2);
  }
}

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AppRole>(() => {
    return (localStorage.getItem('role') as AppRole) || 'super-admin';
  });

  // Initialize permissions from localStorage if available
  const [permissions, setPermissions] = useState<number[]>(() => {
    const saved = localStorage.getItem('permissions');
    const savedRole = localStorage.getItem('role') as AppRole;
    
    // If super-admin (or first boot where it defaults to super-admin), always ensure full permissions [1-300]
    if (savedRole === 'super-admin' || (!savedRole && !saved)) {
      return Array.from({ length: 300 }, (_, i) => i + 1);
    }
    
    return saved ? JSON.parse(saved) : [0, 1, 3, 5, 12, 185]; // Default fallback
  });

  const switchRole = (newRole: AppRole) => {
    setRole(newRole);
    localStorage.setItem('role', newRole);
    
    // Define preset permissions for each role (ID 195)
    let newPermissions: number[] = [];
    switch (newRole) {
      case 'super-admin':
        newPermissions = Array.from({ length: 300 }, (_, i) => i + 1);
        break;
      case 'manager':
        newPermissions = [1, 3, 5, 12, 31, 34, 61, 63, 71, 72, 121, 141, 185, 199, 232];
        break;
      case 'cashier':
        newPermissions = [1, 3, 5, 12, 31, 141, 121]; // Cashiers can view stock
        break;
      case 'technician':
        newPermissions = Array.from({ length: 39 }, (_, i) => i + 61); // 61 to 99 (includes 63, 71, 72)
        break;
    }
    setPermissions(newPermissions);
    localStorage.setItem('permissions', JSON.stringify(newPermissions));
  };

  useEffect(() => {
    // Sync permissions to localStorage whenever they change
    localStorage.setItem('permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    // Listen for real-time permission updates (ID 185 requirement)
    socket.on('PERMISSION_UPDATE', (data: { userId: string, permissions: number[] }) => {
      console.log('Real-time permission update received:', data);
      // In a real app, check if data.userId matches current user
      setPermissions(data.permissions);
    });

    return () => {
      socket.off('PERMISSION_UPDATE');
    };
  }, []);

  const hasPermission = (id: number) => {
    return permissions.includes(id) || permissions.includes(0); // 0 is super admin
  };

  return (
    <PermissionContext.Provider value={{ permissions, role, hasPermission, setPermissions, switchRole }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface GateProps {
  id: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Gate: React.FC<GateProps> = ({ id, children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(id)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
