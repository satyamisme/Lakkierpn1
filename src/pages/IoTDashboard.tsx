import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Activity, 
  Monitor, 
  Scan, 
  Scale, 
  Lock, 
  Loader2, 
  RefreshCcw, 
  Zap, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Terminal
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Gate } from '../components/Gate';

interface IotDevice {
  _id: string;
  deviceId: string;
  type: string;
  status: 'online' | 'offline';
  lastHeartbeat: string;
  currentValue: any;
}

export const IoTDashboard: React.FC = () => {
  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/iot/devices', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setDevices(await response.json());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('iot_display_update', (data) => {
      addLog(`Display Updated: "${data.text}" - Total: ${data.total} KD`);
      fetchDevices();
    });

    newSocket.on('iot_rfid_scan', (data) => {
      addLog(`RFID Tag Scanned: ${data.tagId}`);
      fetchDevices();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const simulateRfid = async () => {
    try {
      const tagId = 'TAG-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await fetch('/api/iot/simulate-rfid', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ tagId }),
      });
    } catch (err) {
      console.error("Simulation failed");
    }
  };

  const updateDisplay = async () => {
    try {
      await fetch('/api/iot/update-display', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: "Welcome to Lakki Phone!", total: 0 }),
      });
    } catch (err) {
      console.error("Display update failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Connecting to IoT Mesh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">IoT Mesh Control</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Hardware Integration & Webhooks (ID 277, 275, 276)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchDevices}
            className="p-3 bg-card border border-border text-muted-foreground hover:text-primary transition-all active:scale-95"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map((device) => (
            <motion.div 
              key={device._id}
              whileHover={{ y: -4 }}
              className="bg-card border border-border p-6 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  {device.type === 'Customer_Display' && <Monitor className="text-primary" size={24} />}
                  {device.type === 'RFID_Scanner' && <Scan className="text-primary" size={24} />}
                  {device.type === 'Digital_Scale' && <Scale className="text-primary" size={24} />}
                  {device.type === 'Smart_Lock' && <Lock className="text-primary" size={24} />}
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${device.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {device.status === 'online' ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {device.status}
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest">{device.type.replace('_', ' ')}</h3>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">ID: {device.deviceId}</p>
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-lg mb-6">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Current Value</p>
                <div className="text-xs font-mono font-bold break-all">
                  {device.currentValue ? JSON.stringify(device.currentValue) : '---'}
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Last Heartbeat</span>
                <span>{device.lastHeartbeat ? new Date(device.lastHeartbeat).toLocaleTimeString() : 'Never'}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Control Panel & Logs */}
        <div className="space-y-8">
          <div className="bg-card border border-border p-8 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              Hardware Simulator
            </h3>
            <div className="space-y-4">
              <Gate id={276}>
                <button 
                  onClick={simulateRfid}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 border border-border hover:border-primary transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Scan size={18} className="text-muted-foreground group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Simulate RFID Scan</span>
                  </div>
                  <Play size={12} className="text-muted-foreground" />
                </button>
              </Gate>

              <Gate id={275}>
                <button 
                  onClick={updateDisplay}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 border border-border hover:border-primary transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Monitor size={18} className="text-muted-foreground group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Push Display Update</span>
                  </div>
                  <Play size={12} className="text-muted-foreground" />
                </button>
              </Gate>
            </div>
          </div>

          <div className="bg-card border border-border p-8 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
              <Terminal size={20} className="text-primary" />
              Live Mesh Logs
            </h3>
            <div className="space-y-3 font-mono text-[9px]">
              {logs.length === 0 && <p className="text-muted-foreground italic">Waiting for mesh events...</p>}
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-2 bg-muted/30 border-l-2 border-primary"
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
