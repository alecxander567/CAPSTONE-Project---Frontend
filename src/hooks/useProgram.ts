import { useState, useEffect } from "react";
import axios from "axios";

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_id_no: string;
  year_level?: number | string;
}

export interface ProgramData {
  id?: number;
  code: string;
  name: string;
  students?: number;
  studentList?: Student[];
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const usePrograms = () => {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<ProgramData[]>(
          `${import.meta.env.VITE_API_URL}/programs/counts`,
          { withCredentials: true },
        );

        const programsWithStudents = await Promise.all(
          data.map(async (prog) => {
            try {
              const { data: students } = await axios.get<Student[]>(
                `${import.meta.env.VITE_API_URL}/programs/${prog.code}/students`,
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
      } catch (err: unknown) {
        console.error("Failed to fetch program data:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return { programs, loading, error };
};

export const useAddProgram = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProgram = async (code: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post<ProgramData>(
        `${import.meta.env.VITE_API_URL}/programs/`,
        { code, name },
        { withCredentials: true, headers: getAuthHeaders() },
      );
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail ?? "Something went wrong";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addProgram, loading, error };
};

export const useEditProgram = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editProgram = async (id: number, code: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.put<ProgramData>(
        `${import.meta.env.VITE_API_URL}/programs/${id}`,
        { code, name },
        { withCredentials: true, headers: getAuthHeaders() },
      );
      return data;
    } catch (err: any) {
      const message = err.response?.data?.detail ?? "Something went wrong";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editProgram, loading, error };
};

export const useDeleteProgram = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProgram = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/programs/${id}`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
    } catch (err: any) {
      const message = err.response?.data?.detail ?? "Something went wrong";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProgram, loading, error };
};
