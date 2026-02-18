import { useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/fingerprints`;

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/start-attendance`);

      const modeCheck = await axios.get(`${API_URL}/device-mode`);

      return res.data;
    } catch (err: any) {
      console.error("Failed to start attendance:", err);
      setError(err.response?.data?.detail || "Failed to start attendance");
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
    } catch (err: any) {
      console.error("Failed to stop attendance:", err);
      setError(err.response?.data?.detail || "Failed to stop attendance");
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
