import { useState, useEffect } from "react";
import axios from "axios";

export interface ProgramData {
  code: string;
  name: string;
  students: number;
}

export const usePrograms = () => {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<ProgramData[]>(
          "http://localhost:8000/programs/counts",
          { withCredentials: true }
        );
        setPrograms(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch program data:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return { programs, loading, error };
};
