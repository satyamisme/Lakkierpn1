import React, { useState } from 'react';
import { LogIn, MapPin, ShieldAlert, Loader2 } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePermissions } from './PermissionGuard';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const { setPermissions } = usePermissions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          latitude: latitude || undefined,
          longitude: longitude || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and update permissions
      localStorage.setItem('token', data.token);
      localStorage.setItem('permissions', JSON.stringify(data.user.permissions));
      setPermissions(data.user.permissions);
      console.log('Login successful:', data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Staff Login</h2>
        <p className="text-gray-500 text-sm">Access Lakki Phone ERP Terminal</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@lakkiphone.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            Security Verification
          </div>
          
          {geoLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Capturing GPS coordinates...
            </div>
          ) : geoError ? (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <ShieldAlert className="w-4 h-4" />
              Location Error: {geoError}
            </div>
          ) : (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              GPS Locked: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoggingIn || geoLoading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize & Enter'}
        </button>
      </form>
    </div>
  );
};
