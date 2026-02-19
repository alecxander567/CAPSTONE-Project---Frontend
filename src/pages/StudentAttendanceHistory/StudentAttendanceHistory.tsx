import { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "../../components/StudentSidebar/StudentSidebar";
import { useEvents } from "../../hooks/useEvents";
import type { Event } from "../../hooks/useEvents";
import "./StudentAttendanceHistory.css";

interface MyAttendance {
  event_id: number;
  status: "present" | "absent";
  attendance_time: string | null;
}

function StudentAttendanceHistory() {
  const { events, loading: eventsLoading } = useEvents();
  const [myAttendance, setMyAttendance] = useState<MyAttendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, []);

  const fetchAllAttendance = async (
    evts: Event[],
    studentId: string,
    token: string,
  ) => {
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
  };

  useEffect(() => {
    if (!eventsLoading && events.length > 0 && myAttendance.length === 0) {
      const token = localStorage.getItem("token");
      const studentId = localStorage.getItem("student_id_no");
      if (token && studentId) {
        setLoadingAttendance(true);
        fetchAllAttendance(events, studentId, token);
      }
    }
  }, [eventsLoading, events]);

  const getStatusForEvent = (eventId: number) => {
    return myAttendance.find((a) => a.event_id === eventId) ?? null;
  };

  const pastAndOngoingEvents = events
    .filter((e) => e.status === "done" || e.status === "ongoing")
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    );

  const filteredEvents = pastAndOngoingEvents.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const presentCount = filteredEvents.filter((e) => {
    const rec = getStatusForEvent(e.id);
    return rec?.status === "present";
  }).length;

  const isLoading = eventsLoading || loadingAttendance;

  return (
    <div className="att-layout">
      <StudentSidebar />

      <main className="att-main">
        {/* Header */}
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
          {/* Summary + Search */}
          <div className="att-toolbar fade-up delay-1">
            <div className="att-summary">
              <div className="summary-chip present">
                <i className="bi bi-check-circle-fill"></i>
                <span>
                  <strong>{presentCount}</strong> Present
                </span>
              </div>
              <div className="summary-chip absent">
                <i className="bi bi-x-circle-fill"></i>
                <span>
                  <strong>{filteredEvents.length - presentCount}</strong> Absent
                </span>
              </div>
              <div className="summary-chip total">
                <i className="bi bi-calendar-event-fill"></i>
                <span>
                  <strong>{filteredEvents.length}</strong> Events
                </span>
              </div>
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

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading your attendance...</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && filteredEvents.length === 0 && (
            <div className="att-empty fade-up delay-2">
              <i className="bi bi-calendar-x"></i>
              <h5>No events found</h5>
              <p>
                Your attendance records will appear here once events are
                completed.
              </p>
            </div>
          )}

          {/* Event Cards */}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="att-cards-grid fade-up delay-2">
              {filteredEvents.map((event) => {
                const rec = getStatusForEvent(event.id);
                const isPresent = rec?.status === "present";

                return (
                  <div
                    key={event.id}
                    className={`att-event-card ${isPresent ? "card-present" : "card-absent"}`}>
                    {/* Card header */}
                    <div className="att-card-header">
                      <div className="event-header-wave"></div>
                      <div className="att-date-badge">
                        <div className="att-date-month">
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            { month: "short" },
                          )}
                        </div>
                        <div className="att-date-day">
                          {new Date(event.event_date).getDate()}
                        </div>
                      </div>
                      <h5 className="att-card-title">{event.title}</h5>
                    </div>

                    {/* Card body */}
                    <div className="att-card-body">
                      <p className="att-card-desc">
                        {event.description || "No description provided."}
                      </p>

                      <div className="att-card-meta">
                        <div className="att-meta-row">
                          <i className="bi bi-clock"></i>
                          <span>
                            {event.start_time} – {event.end_time}
                          </span>
                        </div>
                        <div className="att-meta-row">
                          <i className="bi bi-geo-alt"></i>
                          <span>{event.location}</span>
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

                    {/* Status footer */}
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
