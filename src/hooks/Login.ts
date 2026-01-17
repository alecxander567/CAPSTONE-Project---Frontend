import { useState } from "react";
import axios from "axios";

interface LoginPayload {
  student_id_no: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  student_id_no: string;
  role: "admin" | "student";
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/login",
        payload,
      );

      const data = response.data;

      localStorage.setItem("token", data.access_token);

      localStorage.setItem("role", data.role);
      localStorage.setItem("student_id_no", data.student_id_no);

      return data;
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
