import { useState, useEffect } from "react";
import { saveSale, syncPendingSales, getPendingSales } from "../services/offlineQueue";

export const useOfflineQueue = () => {
  const [queueLength, setQueueLength] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingSales().then(updateQueueLength);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    updateQueueLength();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updateQueueLength = async () => {
    const sales = await getPendingSales();
    setQueueLength(sales.length);
  };

  const addToQueue = async (saleData: any) => {
    await saveSale(saleData);
    await updateQueueLength();
  };

  return { addToQueue, queueLength, isOnline };
};
