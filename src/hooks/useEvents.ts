import { useState, useEffect } from "react";
import axios from "axios";

export interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  created_by: number;
  created_at: string;
}

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  addEvent: (
    data: Omit<Event, "id" | "created_by" | "created_at">,
  ) => Promise<void>;
  editEvent: (
    id: number,
    data: Omit<Event, "id" | "created_by" | "created_at">,
  ) => Promise<void>;
}

export const useEvents = (): UseEventsResult => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Event[]>(
          "http://127.0.0.1:8000/events/",
        );
        setEvents(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const addEvent = async (
    data: Omit<Event, "id" | "created_by" | "created_at">,
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.post<Event>(
        "http://127.0.0.1:8000/events/",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setEvents((prev) => [...prev, response.data]);
    } catch (err) {
      console.error(err);
      throw new Error("Failed to add event.");
    }
  };

  const editEvent = async (
    id: number,
    data: Omit<Event, "id" | "created_by" | "created_at">,
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.put<Event>(
        `http://127.0.0.1:8000/events/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setEvents((prev) =>
        prev.map((evt) => (evt.id === id ? response.data : evt)),
      );
    } catch (err) {
      console.error(err);
      throw new Error("Failed to edit event.");
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      await axios.delete(`http://127.0.0.1:8000/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error(err);
      throw new Error("Failed to delete event.");
    }
  };

  return { events, loading, error, addEvent, editEvent, deleteEvent };
};
