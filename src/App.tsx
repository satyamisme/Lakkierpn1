/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionProvider } from './components/PermissionGuard';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/MainLayout';
import { Login } from './components/Login';
import { TwoFactorVerify } from './pages/TwoFactorVerify';
import { Loader2 } from 'lucide-react';
import { syncPendingSales } from './services/offlineQueue';
import { Toaster, toast } from 'sonner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  useEffect(() => {
    const handleOnline = () => {
      toast.success("Connection Restored: Syncing pending transactions...");
      syncPendingSales();
    };
    const handleOffline = () => {
      toast.error("Offline Mode: Data will be queued until sync.");
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <PermissionProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/2fa-verify" element={<TwoFactorVerify />} />
              <Route path="/ping" element={<div>Public route works</div>} />
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster position="top-right" richColors theme="dark" />
          </PermissionProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
