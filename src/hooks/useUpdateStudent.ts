import { useState } from "react";
import api from "../api/axiosConfig";

export interface StudentUpdatePayload {
  student_id_no?: string;
  first_name?: string;
  last_name?: string;
  middle_initial?: string;
  email?: string;
  program?: string;
  year_level?: string;
}

export interface UpdatedStudent {
  id: number;
  student_id_no: string | null;
  first_name: string;
  last_name: string;
  middle_initial: string | null;
  email: string | null;
  program: string | null;
  year_level: string | null;
  role: string;
}

export const useUpdateStudent = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStudent = async (
    studentId: number,
    payload: StudentUpdatePayload,
  ): Promise<UpdatedStudent> => {
    setUpdating(true);
    setError(null);
    try {
      // strip empty/undefined so we don't accidentally blank fields
      const filtered: Record<string, string> = {};
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          filtered[k] = v;
        }
      });

      const res = await api.patch<UpdatedStudent>(
        `/auth/admin/users/${studentId}`,
        filtered,
      );
      return res.data;
    } catch (err: unknown) {
      let message = "Failed to update student";
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response
          ?.data?.detail === "string"
      ) {
        message = (err as { response: { data: { detail: string } } }).response
          .data.detail;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    } finally {
      setUpdating(false);
    }
  };

  return { updateStudent, updating, error };
};
