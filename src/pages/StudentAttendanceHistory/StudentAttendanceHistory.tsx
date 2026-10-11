import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import StudentSidebar from "../../components/StudentSidebar/StudentSidebar";
import { useEvents } from "../../hooks/useEvents";
import type { AppEvent } from "../../hooks/useEvents";
import "./StudentAttendanceHistory.css";

interface MyAttendance {
  event_id: number;
  status: "present" | "absent";
  attendance_time: string | null;
}

type FilterType = "all" | "present" | "absent";

// Safely render "HH:MM – HH:MM" using event.days[0] (matches what the API actually returns)
function formatEventTime(event: AppEvent): string {
  if (!event.days || event.days.length === 0) return "—";
  const first = event.days[0];
  if (!first.start_time || !first.end_time) return "—";
  if (event.days.length === 1) {
    return `${first.start_time.slice(0, 5)} – ${first.end_time.slice(0, 5)}`;
  }
  return "Varies per day";
}

// Safe date parse — returns null if the value is missing/invalid
function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function StudentAttendanceHistory() {
  const { events, loading: eventsLoading } = useEvents();
  const [myAttendance, setMyAttendance] = useState<MyAttendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const fetchAllAttendance = useCallback(
    async (evts: AppEvent[], studentId: string, token: string) => {
      const results: MyAttendance[] = [];
      for (const event of evts) {
        try {
          const res = await axios.get<
            {
              student_id_no: string;
              status: string;
              attendance_time: string | null;
            }[]
          >(`${import.meta.env.VITE_API_URL}/attendance/by-event/${event.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const mine = res.data.find((r) => r.student_id_no === studentId);
          results.push({
            event_id: event.id,
            status: mine ? (mine.status as "present" | "absent") : "absent",
            attendance_time: mine?.attendance_time ?? null,
          });
        } catch {
          results.push({
            event_id: event.id,
            status: "absent",
            attendance_time: null,
          });
        }
      }
      setMyAttendance(results);
      setLoadingAttendance(false);
    },
    [],
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const studentId = localStorage.getItem("student_id_no");
    if (!token || !studentId) return;

    axios
      .get<
        {
          event_id: number;
          student_id_no: string;
          status: string;
          attendance_time: string | null;
        }[]
      >(`${import.meta.env.VITE_API_URL}/attendance/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyAttendance(res.data as MyAttendance[]))
      .catch(() => {
        fetchAllAttendance(events, studentId, token);
      })
      .finally(() => setLoadingAttendance(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!eventsLoading && events.length > 0 && myAttendance.length === 0) {
      const token = localStorage.getItem("token");
      const studentId = localStorage.getItem("student_id_no");
      if (token && studentId) {
        setLoadingAttendance(true);
        fetchAllAttendance(events, studentId, token);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsLoading, events]);

  const getStatusForEvent = (eventId: number) => {
    return myAttendance.find((a) => a.event_id === eventId) ?? null;
  };

  // CHANGED: event_date → start_date, plus null-safe sort
  const pastAndOngoingEvents = events
    .filter((e) => e.status === "done" || e.status === "ongoing")
    .sort((a, b) => {
      const at = parseDate(a.start_date)?.getTime() ?? 0;
      const bt = parseDate(b.start_date)?.getTime() ?? 0;
      return bt - at;
    });

  const searchedEvents = pastAndOngoingEvents.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const presentCount = searchedEvents.filter(
    (e) => getStatusForEvent(e.id)?.status === "present",
  ).length;
  const absentCount = searchedEvents.length - presentCount;

  const filteredEvents = searchedEvents.filter((e) => {
    if (activeFilter === "all") return true;
    return getStatusForEvent(e.id)?.status === activeFilter;
  });

  const isLoading = eventsLoading || loadingAttendance;

  return (
    <div className="att-layout">
      <StudentSidebar />

      <main className="att-main">
        <header className="att-header">
          <div className="wave"></div>
          <div className="att-header-content fade-up">
            <div className="att-header-icon">
              <i className="bi bi-clipboard-check"></i>
            </div>
            <div>
              <h1>Attendance History</h1>
              <p>Your attendance record across all events</p>
            </div>
          </div>
        </header>

        <div className="att-content">
          <div className="att-toolbar fade-up delay-1">
            <div className="att-summary">
              <button
                className={`summary-chip total ${activeFilter === "all" ? "chip-active" : ""}`}
                onClick={() => setActiveFilter("all")}>
                <i className="bi bi-calendar-event-fill"></i>
                <span>
                  <strong>{searchedEvents.length}</strong> All
                </span>
              </button>
              <button
                className={`summary-chip present ${activeFilter === "present" ? "chip-active" : ""}`}
                onClick={() => setActiveFilter("present")}>
                <i className="bi bi-check-circle-fill"></i>
                <span>
                  <strong>{presentCount}</strong> Present
                </span>
              </button>
              <button
                className={`summary-chip absent ${activeFilter === "absent" ? "chip-active" : ""}`}
                onClick={() => setActiveFilter("absent")}>
                <i className="bi bi-x-circle-fill"></i>
                <span>
                  <strong>{absentCount}</strong> Absent
                </span>
              </button>
            </div>

            <div className="att-search-wrapper">
              <i className="bi bi-search att-search-icon"></i>
              <input
                className="att-search-input"
                placeholder="Search event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading your attendance...</p>
            </div>
          )}

          {!isLoading && filteredEvents.length === 0 && (
            <div className="att-empty fade-up delay-2">
              <i className="bi bi-calendar-x"></i>
              <h5>No events found</h5>
              <p>
                {activeFilter === "all" ?
                  "Your attendance records will appear here once events are completed."
                : `No ${activeFilter} events match your search.`}
              </p>
            </div>
          )}

          {!isLoading && filteredEvents.length > 0 && (
            <div className="att-cards-grid fade-up delay-2">
              {filteredEvents.map((event) => {
                const rec = getStatusForEvent(event.id);
                const isPresent = rec?.status === "present";

                // CHANGED: build a safe Date once
                const parsed = parseDate(event.start_date);
                const monthLabel =
                  parsed ?
                    parsed.toLocaleDateString("en-US", { month: "short" })
                  : "—";
                const dayLabel = parsed ? parsed.getDate() : "?";

                return (
                  <div
                    key={event.id}
                    className={`att-event-card ${isPresent ? "card-present" : "card-absent"}`}>
                    <div className="att-card-header">
                      <div className="event-header-wave"></div>
                      <div className="att-date-badge">
                        <div className="att-date-month">{monthLabel}</div>
                        <div className="att-date-day">{dayLabel}</div>
                      </div>
                      <h5 className="att-card-title">{event.title}</h5>
                    </div>

                    <div className="att-card-body">
                      <p className="att-card-desc">
                        {event.description || "No description provided."}
                      </p>
                      <div className="att-card-meta">
                        <div className="att-meta-row">
                          <i className="bi bi-clock"></i>
                          {/* CHANGED: use formatEventTime(event) */}
                          <span>{formatEventTime(event)}</span>
                        </div>
                        <div className="att-meta-row">
                          <i className="bi bi-geo-alt"></i>
                          <span>{event.location || "—"}</span>
                        </div>
                        {rec?.attendance_time && (
                          <div className="att-meta-row">
                            <i className="bi bi-check2-circle"></i>
                            <span>
                              Scanned at{" "}
                              {new Date(rec.attendance_time).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`att-card-footer ${isPresent ? "footer-present" : "footer-absent"}`}>
                      {isPresent ?
                        <>
                          <i className="bi bi-check-circle-fill"></i>
                          <span>Present</span>
                        </>
                      : <>
                          <i className="bi bi-x-circle-fill"></i>
                          <span>Absent</span>
                        </>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentAttendanceHistory;
