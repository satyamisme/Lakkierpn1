import React, { useState, useMemo } from 'react';
import { Search, Shield, Check, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FEATURES, Feature } from '../constants/features';
import { usePermissions, Gate } from './PermissionGuard';

export const FeatureToggleBoard: React.FC<{ userId: string }> = ({ userId }) => {
  const { permissions, setPermissions } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | 'All'>('All');
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const domains = useMemo(() => {
    const uniqueDomains = Array.from(new Set(FEATURES.map(f => f.domain)));
    return ['All', ...uniqueDomains];
  }, []);

  const filteredFeatures = useMemo(() => {
    return FEATURES.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           f.id.toString().includes(searchTerm);
      const matchesDomain = selectedDomain === 'All' || f.domain === selectedDomain;
      return matchesSearch && matchesDomain;
    });
  }, [searchTerm, selectedDomain]);

  const handleToggle = async (featureId: number) => {
    setIsUpdating(featureId);
    const isEnabled = permissions.includes(featureId);
    const newPermissions = isEnabled 
      ? permissions.filter(id => id !== featureId)
      : [...permissions, featureId];

    try {
      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPermissions }),
      });

      if (!response.ok) throw new Error('Failed to update permissions');
      
      const updatedUser = await response.json();
      setPermissions(updatedUser.permissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Gate id={185}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                Feature Toggle Board
              </h2>
              <p className="text-gray-500 text-sm mt-1">Manage 300+ ERP features for User ID: {userId}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search features or IDs..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  className="text-sm outline-none bg-transparent"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4 border-b">ID</th>
                <th className="px-6 py-4 border-b">Feature Name</th>
                <th className="px-6 py-4 border-b">Domain</th>
                <th className="px-6 py-4 border-b">Description</th>
                <th className="px-6 py-4 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {filteredFeatures.map((feature) => {
                  const isEnabled = permissions.includes(feature.id) || permissions.includes(0);
                  const isSuperAdmin = permissions.includes(0);
                  
                  return (
                    <motion.tr 
                      key={feature.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-400">#{feature.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                          {feature.domain}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={feature.description}>
                        {feature.description}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => !isSuperAdmin && handleToggle(feature.id)}
                          disabled={isUpdating === feature.id || isSuperAdmin}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                          } ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                          {isUpdating === feature.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                              <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredFeatures.length === 0 && (
            <div className="p-12 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">No features found matching your search.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Showing {filteredFeatures.length} of {FEATURES.length} features</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Enabled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <span>Disabled</span>
            </div>
          </div>
        </div>
      </div>
    </Gate>
  );
};
