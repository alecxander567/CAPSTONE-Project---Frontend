import { useState, useEffect } from "react";
import axios from "axios";

export interface ProgramAttendance {
  program: string;
  present: number;
  total_students: number;
  percentage: number;
}

export function useAttendancePerProgram() {
  const [data, setData] = useState<ProgramAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/attendance/per-program`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
