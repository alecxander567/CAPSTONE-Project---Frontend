import { useState, useEffect } from "react";
import axios from "axios";

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_id_no: string;
}

export interface ProgramData {
  code: string;
  name: string;
  students: number;
  studentList?: Student[]; 
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
          { withCredentials: true },
        );

        const programsWithStudents = await Promise.all(
          data.map(async (prog) => {
            try {
              const { data: students } = await axios.get<Student[]>(
                `http://localhost:8000/programs/${prog.code}/students`,
                { withCredentials: true },
              );
              return { ...prog, studentList: students };
            } catch {
              return { ...prog, studentList: [] };
            }
          }),
        );

        setPrograms(programsWithStudents);
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
