import { useState } from "react";
import axios from "axios";

export const usePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (mobilePhone: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        "http://localhost:8000/auth/forgot-password",
        { mobile_phone: mobilePhone.trim() },
      );

      return res.data;
    } catch (err: unknown) {
      let message = "Phone number not found";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.detail ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
      });
    } catch (err: unknown) {
      let message = "Reset failed";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.detail ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    forgotPassword,
    resetPassword,
    loading,
    error,
  };
};
