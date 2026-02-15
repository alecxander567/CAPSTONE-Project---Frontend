import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export type EventStatus = "upcoming" | "ongoing" | "done";

export interface Event {
  id: number;
  title: string;
  description?: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  created_by: number;
  created_at: string;
  status: EventStatus;
  program_id?: number | null; 
}

export type EventInput = Omit<
  Event,
  "id" | "created_by" | "created_at" | "status"
>;

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  totalEvents: number;
  addEvent: (data: EventInput) => Promise<void>;
  editEvent: (id: number, data: EventInput) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  getEventById: (id: number) => Promise<Event>;
  refetch: () => Promise<void>;
}

export const useEvents = (): UseEventsResult => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<Event[]>(
        "http://127.0.0.1:8000/events/",
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

    const response = await axios.post<Event>(
      "http://127.0.0.1:8000/events/",
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setEvents((prev) => [...prev, response.data]);
    setTotalEvents((prev) => prev + 1);
  };

  const editEvent = async (id: number, data: EventInput) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const response = await axios.put<Event>(
      `http://127.0.0.1:8000/events/${id}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? response.data : evt)),
    );
  };

  const deleteEvent = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      await axios.delete(`http://127.0.0.1:8000/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents((prev) => prev.filter((event) => event.id !== id));
      setTotalEvents((prev) => prev - 1);
    } catch (err) {
      console.error(err);
      throw new Error("Failed to delete event.");
    }
  };

  const getEventById = useCallback(
    async (id: number): Promise<Event> => {
      try {
        const existingEvent = events.find((e) => e.id === id);
        if (existingEvent) return existingEvent;

        const response = await axios.get<Event>(
          `http://127.0.0.1:8000/events/${id}`,
        );
        return response.data;
      } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch event details.");
      }
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
