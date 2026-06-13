import { useState } from "react";
import axios from "axios";

export const usePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (mobilePhone: string) => {
    setLoading(true);
    setError(null);

    try {
      // Clean the phone number (remove spaces, dashes, etc.)
      const cleanedPhone = mobilePhone
        .trim()
        .replace(/\s/g, "")
        .replace(/-/g, "");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { mobile_phone: cleanedPhone },
      );

      // Return the full response which contains the token
      return res.data; // { message: "...", token: "..." }
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          token: token,
          new_password: newPassword,
        },
      );

      return response.data;
    } catch (err: unknown) {
      let message = "Reset failed. Please try again.";

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
