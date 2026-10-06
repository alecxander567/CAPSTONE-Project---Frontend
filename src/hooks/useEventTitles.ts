import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface EventTitle {
  id: number;
  name: string;
  is_active: boolean;
}

export const useEventTitles = () => {
  const [titles, setTitles] = useState<EventTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTitles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<EventTitle[]>(
        `${import.meta.env.VITE_API_URL}/event-titles/`,
      );
      setTitles(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load event titles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTitles();
  }, [fetchTitles]);

  const createTitle = async (name: string): Promise<EventTitle> => {
    const token = localStorage.getItem("token");
    const res = await axios.post<EventTitle>(
      `${import.meta.env.VITE_API_URL}/event-titles/`,
      { name },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setTitles((prev) =>
      [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return res.data;
  };

  return { titles, loading, error, createTitle, refetch: fetchTitles };
};
