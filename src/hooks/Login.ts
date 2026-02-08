import { useState } from "react";
import axios from "axios"; 

interface LoginPayload {
  student_id_no: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  student_id_no: string;
  role: "admin" | "student";
  message?: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post<LoginResponse>(
        "http://localhost:8000/auth/login",
        payload,
      );

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("student_id_no", data.student_id_no);

      return data;
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

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

  return { login, loading, error };
};
