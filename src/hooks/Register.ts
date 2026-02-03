import { useState } from "react";
import axios from "axios";

interface RegisterPayload {
  student_id_no?: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  program: string;
  mobile_phone: string;
  password: string;
  role: "admin" | "student";
}

export const Register = () => {
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
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (err: any) {
      console.error("Registration error:", err.response?.data);

      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const errors = err.response.data.detail
            .map((e: any) => `${e.loc[e.loc.length - 1]}: ${e.msg}`)
            .join(", ");
          setError(errors);
        } else if (typeof err.response.data.detail === "string") {
          setError(err.response.data.detail);
        } else {
          setError(JSON.stringify(err.response.data.detail));
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};
