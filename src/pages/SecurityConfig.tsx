import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  MapPin, 
  Globe, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Store, 
  Navigation, 
  Lock,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import axios from "axios";
import { toast } from "sonner";

export const SecurityConfig: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [newIp, setNewIp] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get("/api/stores");
      setStores(response.data);
      if (response.data.length > 0) {
        setSelectedStore(response.data[0]);
      }
    } catch (error) {
      toast.error("Failed to fetch stores");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStore) return;
    setSaving(true);
    try {
      await axios.put(`/api/stores/${selectedStore._id}`, {
        whitelistedIPs: selectedStore.whitelistedIPs,
        location: selectedStore.location,
        geofenceRadius: selectedStore.geofenceRadius
      });
      toast.success("Security configuration updated");
      fetchStores();
    } catch (error) {
      toast.error("Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  const addIp = () => {
    if (!newIp) return;
    if (selectedStore.whitelistedIPs.includes(newIp)) {
      toast.error("IP already whitelisted");
      return;
    }
    setSelectedStore({
      ...selectedStore,
      whitelistedIPs: [...selectedStore.whitelistedIPs, newIp]
    });
    setNewIp("");
  };

  const removeIp = (ip: string) => {
    setSelectedStore({
      ...selectedStore,
      whitelistedIPs: selectedStore.whitelistedIPs.filter((i: string) => i !== ip)
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedStore({
          ...selectedStore,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
        toast.success("Location captured from device");
      },
      () => {
        toast.error("Unable to retrieve your location");
      }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Loading Security Matrix...</p>
      </div>
    );
  }

  return (
    <Gate id={186}>
      <div className="space-y-16 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Security Matrix</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">
              IP Whitelisting & Geofencing Control (ID 186/187)
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Apply Configuration
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Store Selector */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-4 opacity-60">Select Node</h3>
            <div className="space-y-3">
              {stores.map((store) => (
                <button
                  key={store._id}
                  onClick={() => setSelectedStore(store)}
                  className={`w-full p-6 rounded-[2rem] border text-left transition-all duration-300 flex items-center gap-4 ${selectedStore?._id === store._id ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20' : 'bg-surface-container-lowest border-border text-foreground hover:border-primary/50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedStore?._id === store._id ? 'bg-white/20' : 'bg-primary/5 text-primary'}`}>
                    <Store size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{store.name}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60 ${selectedStore?._id === store._id ? 'text-white' : 'text-muted-foreground'}`}>
                      {store.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Panels */}
          <div className="lg:col-span-3 space-y-12">
            {selectedStore ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* IP Whitelisting */}
                <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-12 shadow-sm space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                        <Globe size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif italic">IP Whitelist</h3>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Restrict Access by Network</p>
                      </div>
                    </div>
                    <Lock size={24} className="text-muted-foreground opacity-20" />
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <input 
                        type="text"
                        placeholder="Enter IP Address (e.g. 192.168.1.1)"
                        value={newIp}
                        onChange={(e) => setNewIp(e.target.value)}
                        className="flex-1 bg-surface border border-border rounded-2xl p-5 text-xs font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                      />
                      <button 
                        onClick={addIp}
                        className="p-5 bg-primary text-primary-foreground rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedStore.whitelistedIPs.map((ip: string) => (
                        <div key={ip} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl group hover:border-red-500/30 transition-all">
                          <span className="text-xs font-mono font-bold text-foreground">{ip}</span>
                          <button 
                            onClick={() => removeIp(ip)}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {selectedStore.whitelistedIPs.length === 0 && (
                        <div className="text-center py-10 opacity-20">
                          <AlertCircle size={32} className="mx-auto mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No IP restrictions active</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Geofencing */}
                <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-12 shadow-sm space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                        <MapPin size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif italic">Geofencing</h3>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">GPS Boundary Enforcement</p>
                      </div>
                    </div>
                    <Navigation size={24} className="text-muted-foreground opacity-20" />
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Latitude</label>
                        <input 
                          type="number"
                          step="any"
                          value={selectedStore.location.latitude}
                          onChange={(e) => setSelectedStore({
                            ...selectedStore,
                            location: { ...selectedStore.location, latitude: parseFloat(e.target.value) }
                          })}
                          className="w-full bg-surface border border-border rounded-2xl p-5 text-xs font-mono font-bold outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Longitude</label>
                        <input 
                          type="number"
                          step="any"
                          value={selectedStore.location.longitude}
                          onChange={(e) => setSelectedStore({
                            ...selectedStore,
                            location: { ...selectedStore.location, longitude: parseFloat(e.target.value) }
                          })}
                          className="w-full bg-surface border border-border rounded-2xl p-5 text-xs font-mono font-bold outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Authorized Radius (Meters)</label>
                      <div className="flex items-center gap-6">
                        <input 
                          type="range"
                          min="50"
                          max="5000"
                          step="50"
                          value={selectedStore.geofenceRadius}
                          onChange={(e) => setSelectedStore({ ...selectedStore, geofenceRadius: parseInt(e.target.value) })}
                          className="flex-1 accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-black font-mono text-primary min-w-[80px] text-right">{selectedStore.geofenceRadius}m</span>
                      </div>
                    </div>

                    <button 
                      onClick={getCurrentLocation}
                      className="w-full py-5 bg-surface border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:border-primary transition-all"
                    >
                      <Navigation size={18} className="text-primary" />
                      Capture Current Location
                    </button>

                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-start gap-4">
                      <CheckCircle2 size={18} className="text-primary mt-1" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                        Operators with Geofence permission will only be able to login within {selectedStore.geofenceRadius}m of this node.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 opacity-20">
                <Search size={64} className="mb-6" />
                <p className="text-xl font-serif italic">Select a node to configure security</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Gate>
  );
};
