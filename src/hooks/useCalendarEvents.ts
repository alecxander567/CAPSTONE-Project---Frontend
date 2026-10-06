import { useState, useCallback } from "react";
import axios from "axios";
import type { EventStatus } from "./useEvents";

export interface CalendarEvent {
  id: number;
  title_id: number;
  location_id: number;
  title: string;
  location: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  program_id?: number | null;
  created_by: number;
  created_at: string;
  status: EventStatus;
  // New per-day fields from backend expansion
  calendar_date: string;
  day_start_time: string | null;
  day_end_time: string | null;
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
