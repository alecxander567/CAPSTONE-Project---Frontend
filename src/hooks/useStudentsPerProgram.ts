import { useState, useEffect } from "react";
import axios from "axios";

export function useStudentsPerProgram(year: string = "all") {
  const [data, setData] = useState<{ program: string; students: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = year !== "all" ? { year } : {};
    axios
      .get(`${import.meta.env.VITE_API_URL}/attendance/students-per-program`, {
        params,
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [year]);

  return { data, loading, error };
}
