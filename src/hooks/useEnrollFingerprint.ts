import { useState } from "react";
import axios from "axios";

type FingerprintStatus = "not_enrolled" | "pending" | "enrolled" | "failed";

interface EnrollResponse {
  message: string;
  finger_id: number;
}

export const useEnrollFingerprint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const enrollFingerprint = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(
        `http://localhost:8000/fingerprints/start-enrollment`,
        { user_id: userId }, 
      );

      setSuccessMessage(response.data.message);

      return {
        user_id: userId,
        fingerprint_status: "pending" as FingerprintStatus,
        finger_id: response.data.finger_id, 
      };
    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Failed to start fingerprint enrollment";
      setError(message);
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
