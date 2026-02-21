import { useState, useEffect } from "react";
import axios from "axios";

export interface AtRiskStudent {
  student_id_no: string;
  first_name: string;
  last_name: string;
  program: string;
  program_code: string;
  absences: number;
  present: number;
  total_events: number;
}

interface UseAtRiskStudentsReturn {
  data: AtRiskStudent[];
  loading: boolean;
  error: string | null;
}

export const useAtRiskStudents = (): UseAtRiskStudentsReturn => {
  const [data, setData] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAtRisk = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data: responseData } = await axios.get<AtRiskStudent[]>(
          `${import.meta.env.VITE_API_URL}/attendance/at-risk`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setData(responseData);
      } catch (err: unknown) {
        let message = "Something went wrong. Please try again.";

        if (axios.isAxiosError(err)) {
          message = err.response?.data?.detail ?? message;
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAtRisk();
  }, []);

  return { data, loading, error };
};
