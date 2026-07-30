import { useEffect, useState } from "react";

export interface DeviceInfo {
  device_id: string;
  connected: boolean;
  mode?: string | null;
  event_name?: string | null;
  last_seen?: string | null;
}

export const useDeviceStatus = () => {
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/device/status-all`,
        );
        const data: DeviceInfo[] = await res.json();
        setDevices(data);
        // Overall connected if at least one device is online
        setConnected(data.some((d) => d.connected));
      } catch {
        setConnected(false);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return { connected, devices, loading };
};
