import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface Location {
  id: number;
  name: string;
  is_active: boolean;
}

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<Location[]>(
        `${import.meta.env.VITE_API_URL}/locations/`,
      );
      setLocations(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const createLocation = async (name: string): Promise<Location> => {
    const token = localStorage.getItem("token");
    const res = await axios.post<Location>(
      `${import.meta.env.VITE_API_URL}/locations/`,
      { name },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setLocations((prev) =>
      [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return res.data;
  };

  return { locations, loading, error, createLocation, refetch: fetchLocations };
};
