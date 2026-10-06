import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export type EventStatus = "upcoming" | "ongoing" | "done";

export interface EventDay {
  id: number;
  day_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM:SS"
  end_time: string; // "HH:MM:SS"
}

export interface AppEvent {
  id: number;
  title_id: number;
  location_id: number;
  title: string; // flattened from backend
  location: string; // flattened from backend
  description?: string | null;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  program_id?: number | null;
  created_by: number;
  created_at: string;
  status: EventStatus;
  days: EventDay[];
}

export interface EventDayInput {
  day_date: string;
  start_time: string;
  end_time: string;
}

export interface EventInput {
  title_id: number;
  location_id: number;
  description: string;
  start_date: string;
  end_date: string;
  program_id: number | null;
  days: EventDayInput[];
}

interface UseEventsResult {
  events: AppEvent[];
  loading: boolean;
  error: string | null;
  totalEvents: number;
  addEvent: (data: EventInput) => Promise<void>;
  editEvent: (id: number, data: EventInput) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  getEventById: (id: number) => Promise<AppEvent>;
  refetch: () => Promise<void>;
}

export const useEvents = (): UseEventsResult => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<AppEvent[]>(
        `${import.meta.env.VITE_API_URL}/events/`,
      );
      setEvents(response.data);
      setTotalEvents(response.data.length);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = async (data: EventInput) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const response = await axios.post<AppEvent>(
      `${import.meta.env.VITE_API_URL}/events/`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setEvents((prev) => [...prev, response.data]);
    setTotalEvents((prev) => prev + 1);
  };

  const editEvent = async (id: number, data: EventInput) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const response = await axios.put<AppEvent>(
      `${import.meta.env.VITE_API_URL}/events/${id}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setEvents((prev) => prev.map((e) => (e.id === id ? response.data : e)));
  };

  const deleteEvent = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    await axios.delete(`${import.meta.env.VITE_API_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEvents((prev) => prev.filter((e) => e.id !== id));
    setTotalEvents((prev) => prev - 1);
  };

  const getEventById = useCallback(
    async (id: number): Promise<AppEvent> => {
      const existing = events.find((e) => e.id === id);
      if (existing) return existing;

      const res = await axios.get<AppEvent>(
        `${import.meta.env.VITE_API_URL}/events/${id}`,
      );
      return res.data;
    },
    [events],
  );

  return {
    events,
    loading,
    error,
    totalEvents,
    addEvent,
    editEvent,
    deleteEvent,
    getEventById,
    refetch: fetchEvents,
  };
};
