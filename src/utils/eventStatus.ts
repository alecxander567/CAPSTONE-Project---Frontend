import type { AppEvent, EventStatus } from "../hooks/useEvents";

/**
 * Client-side fallback status computation.
 * NOTE: the backend already computes `status` in Asia/Manila — prefer using
 * `event.status` directly. This is only used when a local recompute is needed.
 */
export function computeEventStatus(event: AppEvent): EventStatus {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (event.end_date < todayStr) return "done";
  if (event.start_date > todayStr) return "upcoming";

  // Today is inside [start_date, end_date]
  const todayWindow = event.days?.find((d) => d.day_date === todayStr);
  if (!todayWindow) return "ongoing";

  const [sh, sm] = todayWindow.start_time.split(":").map(Number);
  const [eh, em] = todayWindow.end_time.split(":").map(Number);

  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(now);
  end.setHours(eh, em, 0, 0);

  if (now < start) return "upcoming";
  if (now > end) return "ongoing";
  return "ongoing";
}
