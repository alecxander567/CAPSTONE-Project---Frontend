import { useEffect, useState } from "react";

export const useDeviceStatus = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/device/status`,
        );
        const data = await res.json();
        setConnected(data.connected);
      } catch (error) {
        setConnected(false);
      }
    };

    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return { connected };
};
