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
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.99:8000";

export const useEnrollFingerprint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const enrollFingerprint = async (
    userId: number,
  ): Promise<EnrollResponse | void> => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await axios.post<EnrollResponse>(
        `${API_BASE_URL}/fingerprints/start-enrollment`,
        { user_id: userId },
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
  };
};
