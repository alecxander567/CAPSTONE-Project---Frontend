import { useState } from "react";
import axios from "axios";

export const Password = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (mobilePhone: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        "http://localhost:8000/auth/forgot-password",
        {
          mobile_phone: mobilePhone.trim(),
        },
      );

      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Phone number not found");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      await axios.post("http://localhost:8000/auth/reset-password", {
        token,
        new_password: newPassword,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Reset failed");
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
