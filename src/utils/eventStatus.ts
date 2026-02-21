import type { AppEvent, EventStatus } from "../hooks/useEvents";

export function computeEventStatus(event: AppEvent): EventStatus {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const eventDateStr = event.event_date;

  if (eventDateStr < todayStr) return "done";

  if (eventDateStr === todayStr) {
    const [sh, sm] = event.start_time.split(":").map(Number);
    const [eh, em] = event.end_time.split(":").map(Number);

    const start = new Date(now);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(now);
    end.setHours(eh, em, 0, 0);

    if (now >= start && now <= end) return "ongoing";
    if (now > end) return "done";
    return "upcoming";
  }

  return "upcoming";
}
