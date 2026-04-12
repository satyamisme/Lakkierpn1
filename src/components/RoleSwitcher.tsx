import React from 'react';
import { ShieldAlert, ChevronDown } from 'lucide-react';
import { Gate, usePermissions, AppRole } from './PermissionGuard';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = usePermissions();

  const roles: { id: AppRole; label: string }[] = [
    { id: 'super-admin', label: 'Super Admin' },
    { id: 'manager', label: 'Store Manager' },
    { id: 'cashier', label: 'Cashier' },
    { id: 'technician', label: 'Technician' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'auditor', label: 'Auditor' },
  ];

  return (
    <Gate id={195}>
      <div className="relative group">
        <button className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all">
          <ShieldAlert className="w-4 h-4" />
          Role: {roles.find(r => r.id === role)?.label}
          <ChevronDown className="w-3 h-3" />
        </button>
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Dev-Mode Role Switcher</p>
          </div>
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => switchRole(r.id)}
              className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${role === r.id ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </Gate>
  );
};
