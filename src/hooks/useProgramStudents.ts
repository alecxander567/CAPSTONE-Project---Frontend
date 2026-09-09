import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface Student {
  id: number;
  student_id_no: string;
  first_name: string;
  last_name: string;
  program: string;
  email: string;
  year_level: string | null;
  finger_id: number | null;
  fingerprint_status: "not_enrolled" | "pending" | "enrolled" | "failed";
}

export const useProgramStudents = (programCode: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    if (!programCode) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get<Student[]>(
        `${import.meta.env.VITE_API_URL}/programs/${programCode}/students`,
        { timeout: 10000 },
      );
      setStudents(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch students:", err);
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [programCode]);

  useEffect(() => {
    if (programCode) fetchStudents();
  }, [programCode, fetchStudents]);

  return { students, loading, error, refreshStudents: fetchStudents };
};
