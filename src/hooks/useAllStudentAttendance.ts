import { useState, useEffect } from "react";

export interface StudentAttendance {
  student_id_no: string;
  first_name: string;
  last_name: string;
  program: string;
  program_code: string;
  absences: number;
  present: number;
  total_events: number;
}

export function useAllStudentsAttendance() {
  const [data, setData] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/attendance/all-students-attendance`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError("Failed to load student attendance data");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  return { data, loading, error };
}