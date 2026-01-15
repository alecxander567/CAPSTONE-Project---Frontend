import { useState, useEffect } from "react";
import axios from "axios";

export interface Student {
  id: number;
  student_id_no: string;
  first_name: string;
  last_name: string;
  program: string;
  email: string;
}

export const useProgramStudents = (programCode: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get<Student[]>(
          `http://localhost:8000/programs/${programCode}/students`
        );
        setStudents(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    if (programCode) fetchStudents();
  }, [programCode]);

  return { students, loading, error };
};
