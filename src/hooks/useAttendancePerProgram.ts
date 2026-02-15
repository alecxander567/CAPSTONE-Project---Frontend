import { useState, useEffect } from "react";
import axios from "axios";

interface ProgramAttendance {
  program: string;
  code: string;
  students: number;
}

export function useAttendancePerProgram() {
  const [data, setData] = useState<ProgramAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/attendance/per-program")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
