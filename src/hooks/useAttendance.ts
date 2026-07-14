import { useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/fingerprints`;

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.detail) {
    return String(err.response.data.detail);
  }
  return fallback;
};

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      // Backend enforces the mode guard (ensure_device_free) and returns
      // a 409 with a descriptive detail message if another mode is active.
      const res = await axios.post(`${API_URL}/start-attendance`);
      return res.data;
    } catch (err) {
      console.error("Failed to start attendance:", err);
      const message = getErrorMessage(err, "Failed to start attendance");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/stop-attendance`);
      return res.data;
    } catch (err) {
      console.error("Failed to stop attendance:", err);
      const message = getErrorMessage(err, "Failed to stop attendance");
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    startAttendance,
    stopAttendance,
    loading,
    error,
  };
};
