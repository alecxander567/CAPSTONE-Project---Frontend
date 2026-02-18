import { useState, useCallback } from "react";
import axios from "axios";

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  created_by: number;
  created_at: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarEvents = useCallback(
    async (year: number, month: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<{ events: CalendarEvent[] }>(
          `${import.meta.env.VITE_API_URL}/events/calendar`,
          { params: { year, month } },
        );

        setEvents(response.data.events || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch events for this month.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { events, loading, error, fetchCalendarEvents };
};
