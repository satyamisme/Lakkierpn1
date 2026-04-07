import { useState, useEffect } from "react";

interface OfflineSale {
  id: string;
  data: any;
  timestamp: number;
}

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<OfflineSale[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load queue from localStorage
    const savedQueue = localStorage.getItem("offline_sales_queue");
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncQueue();
    }
  }, [isOnline, queue]);

  const addToQueue = (saleData: any) => {
    const newSale: OfflineSale = {
      id: Math.random().toString(36).substr(2, 9),
      data: saleData,
      timestamp: Date.now(),
    };
    const newQueue = [...queue, newSale];
    setQueue(newQueue);
    localStorage.setItem("offline_sales_queue", JSON.stringify(newQueue));
  };

  const syncQueue = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    for (const sale of queue) {
      try {
        const response = await fetch("/api/sales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(sale.data),
        });

        if (response.ok) {
          // Remove from queue
          const newQueue = queue.filter((s) => s.id !== sale.id);
          setQueue(newQueue);
          localStorage.setItem("offline_sales_queue", JSON.stringify(newQueue));
        }
      } catch (error) {
        console.error("Sync failed for sale:", sale.id, error);
        break; // Stop syncing if network error
      }
    }
  };

  return { addToQueue, queueLength: queue.length, isOnline };
};
