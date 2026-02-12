import { useState } from "react";
import axios from "axios";

export interface RegisterPayload {
  student_id_no?: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  program_id?: number; 
  year_level?: string; 
  mobile_phone: string;
  password: string;
  role: "admin" | "student";
}

interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/register",
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      return response.data;
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (Array.isArray(detail)) {
          message = detail
            .map((e: ValidationError) => `${e.loc[e.loc.length - 1]}: ${e.msg}`)
            .join(", ");
        } else if (typeof detail === "string") {
          message = detail;
        } else if (detail) {
          message = JSON.stringify(detail);
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      console.error("Registration error:", message);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};
