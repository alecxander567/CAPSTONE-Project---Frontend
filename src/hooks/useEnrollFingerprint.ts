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
}

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
        `http://localhost:8000/fingerprints/start-enrollment`,
        { user_id: userId },
      );

      setSuccessMessage(data.message);
      return data;
    } catch (err: unknown) {
      let message = "Failed to start fingerprint enrollment";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.detail ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

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
