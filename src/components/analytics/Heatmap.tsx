import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HeatmapProps {
  data: Array<{ lat: number, lng: number, count: number, area: string }>;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Kuwait City Center
    mapInstance.current = L.map(mapRef.current).setView([29.3759, 47.9774], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    data.forEach(point => {
      const radius = Math.sqrt(point.count) * 500;
      L.circle([point.lat, point.lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.4,
        radius: radius
      }).addTo(mapInstance.current!)
        .bindPopup(`<b>${point.area}</b><br>${point.count} Sales`);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div className="bg-card border border-border p-4 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest italic">Sales Heatmap (ID 294)</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Live Density</span>
        </div>
      </div>
      <div ref={mapRef} className="h-[400px] w-full grayscale contrast-125 brightness-75 border border-border" />
    </div>
  );
};
