// hooks/useEnrollFingerprint.ts
import { useState } from "react";
import axios from "axios";

export type FingerprintStatus =
  | "not_enrolled"
  | "pending"
  | "enrolled"
  | "failed";

interface EnrollResponse {
  message: string;
  finger_id: number;
  status?: FingerprintStatus;
  step?: string;
  target_device?: string | null;
}

interface OnlineDevice {
  device_id: string;
  mode: string;
  last_seen: string | null;
  is_online: boolean;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`;

export const useEnrollFingerprint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [onlineDevices, setOnlineDevices] = useState<OnlineDevice[]>([]);
  const [systemTargetDevice, setSystemTargetDevice] = useState<string | null>(
    null,
  );

  const fetchOnlineDevices = async (): Promise<OnlineDevice[]> => {
    try {
      const { data } = await axios.get<{
        online_devices: OnlineDevice[];
        total: number;
      }>(`${API_BASE_URL}/fingerprints/online-devices`, { timeout: 5000 });
      setOnlineDevices(data.online_devices || []);
      return data.online_devices || [];
    } catch (err) {
      console.error("Failed to fetch online devices:", err);
      setOnlineDevices([]);
      return [];
    }
  };

  const fetchSystemTargetDevice = async (): Promise<string | null> => {
    try {
      const { data } = await axios.get<{
        target_device: string | null;
        is_set: boolean;
      }>(`${API_BASE_URL}/fingerprints/target-device`, { timeout: 5000 });
      setSystemTargetDevice(data.target_device);
      return data.target_device;
    } catch (err) {
      console.error("Failed to fetch system target device:", err);
      setSystemTargetDevice(null);
      return null;
    }
  };

  const setTargetDevice = async (deviceId: string): Promise<void> => {
    try {
      await axios.post(
        `${API_BASE_URL}/fingerprints/set-target-device`,
        { device_id: deviceId },
        { timeout: 5000 },
      );
      setSystemTargetDevice(deviceId);
    } catch (err) {
      console.error("Failed to set target device:", err);
      throw err;
    }
  };

  const clearTargetDevice = async (): Promise<void> => {
    try {
      await axios.post(
        `${API_BASE_URL}/fingerprints/clear-target-device`,
        {},
        { timeout: 5000 },
      );
      setSystemTargetDevice(null);
    } catch (err) {
      console.error("Failed to clear target device:", err);
      throw err;
    }
  };

  const enrollFingerprint = async (
    userId: number,
    targetDevice?: string | null,
  ): Promise<EnrollResponse | void> => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: { user_id: number; target_device?: string | null } = {
        user_id: userId,
      };

      // Only send target_device if explicitly provided
      if (targetDevice !== undefined) {
        payload.target_device = targetDevice;
      }

      const { data } = await axios.post<EnrollResponse>(
        `${API_BASE_URL}/fingerprints/start-enrollment`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      setSuccessMessage(data.message);
      return data;
    } catch (err: unknown) {
      let message = "Failed to start fingerprint enrollment";

      if (axios.isAxiosError(err)) {
        console.error("Axios Error Details:", {
          message: err.message,
          code: err.code,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
        });

        if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
          message = `Cannot connect to server at ${API_BASE_URL}. Please ensure:\n1. Backend is running\n2. CORS is enabled\n3. URL is correct`;
        } else if (err.response) {
          message =
            err.response.data?.detail ?? `Server error: ${err.response.status}`;
        } else if (err.request) {
          message = "No response from server. Check if backend is running.";
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      console.error("Final error message:", message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return {
    enrollFingerprint,
    isLoading,
    error,
    successMessage,
    clearMessages,
    onlineDevices,
    systemTargetDevice,
    fetchOnlineDevices,
    fetchSystemTargetDevice,
    setTargetDevice,
    clearTargetDevice,
  };
};
