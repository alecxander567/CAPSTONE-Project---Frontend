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
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/device/status-all`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: DeviceInfo[] = await res.json();
      setDevices(data);
      // Overall connected if at least one device is online
      setConnected(data.some((d) => d.connected));
    } catch (err) {
      console.error("Failed to fetch device status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch device status",
      );
      setConnected(false);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return { connected, devices, loading, error, refetch: fetchStatus };
};
