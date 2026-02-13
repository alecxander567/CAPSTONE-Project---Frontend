import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/fingerprints";

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/start-attendance`);
      return res.data;
    } catch (err: any) {
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
