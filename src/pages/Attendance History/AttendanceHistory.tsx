import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { usePrograms } from "../../hooks/useProgram";
import { useEvents } from "../../hooks/useEvents";
import type { AppEvent as Event } from "../../hooks/useEvents";
import "./AttendanceHistory.css";

interface AttendanceRecord {
  student_id_no: string;
  first_name: string;
  last_name: string;
  program_id: number;
  status: string;
  attendance_time: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Safe date parse — returns null for missing/invalid values
function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// Sort events newest-first by their start_date
function sortByStartDateDesc(a: Event, b: Event): number {
  const at = parseDate(a.start_date)?.getTime() ?? 0;
  const bt = parseDate(b.start_date)?.getTime() ?? 0;
  return bt - at;
}

// Sort events oldest-first by their start_date
function sortByStartDateAsc(a: Event, b: Event): number {
  const at = parseDate(a.start_date)?.getTime() ?? 0;
  const bt = parseDate(b.start_date)?.getTime() ?? 0;
  return at - bt;
}

// Get the last day's end for sorting "done" events; fall back to start_date
function getEventEndTime(e: Event): number {
  if (e.days && e.days.length > 0) {
    const lastDay = e.days[e.days.length - 1];
    const dt = parseDate(`${lastDay.day_date}T${lastDay.end_time}`);
    if (dt) return dt.getTime();
  }
  return parseDate(e.start_date)?.getTime() ?? 0;
}

const getRecentEvent = (events: Event[]) => {
  if (!events.length) return null;
  const ongoing = events.find((e) => e.status === "ongoing");
  if (ongoing) return ongoing;
  const done = events
    .filter((e) => e.status === "done")
    .sort((a, b) => getEventEndTime(b) - getEventEndTime(a));
  if (done.length) return done[0];
  const upcoming = events
    .filter((e) => e.status === "upcoming")
    .sort(sortByStartDateAsc);
  return upcoming[0] ?? null;
};

// ── Component ─────────────────────────────────────────────────────────────────
function AttendanceHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearLevelFilter, setYearLevelFilter] = useState<string>("ALL");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const { programs, loading: programsLoading } = usePrograms();
  const { events, loading: eventsLoading } = useEvents();

  useEffect(() => {
    if (!events.length) return;
    const recent = getRecentEvent(events);
    if (!recent) return;

    const id = window.setTimeout(() => {
      setSelectedEventId(recent.id);
    }, 0);

    return () => clearTimeout(id);
  }, [events]);

  useEffect(() => {
    if (!selectedEventId) {
      const id = window.setTimeout(() => {
        setAttendanceRecords([]);
      }, 0);
      return () => clearTimeout(id);
    }

    let cancelled = false;

    const id = window.setTimeout(() => {
      if (cancelled) return;
      setLoadingAttendance(true);
      axios
        .get<AttendanceRecord[]>(
          `${import.meta.env.VITE_API_URL}/attendance/by-event/${selectedEventId}`,
        )
        .then((res) => {
          if (!cancelled) setAttendanceRecords(res.data);
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setLoadingAttendance(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  // CHANGED: use start_date
  const uniqueYears = Array.from(
    new Set(
      events
        .map((e) => parseDate(e.start_date)?.getFullYear())
        .filter((y): y is number => typeof y === "number"),
    ),
  ).sort((a, b) => b - a);

  const yearFilteredEvents = events.filter(
    (e) => parseDate(e.start_date)?.getFullYear() === Number(selectedYear),
  );

  const presentIds = new Set(
    attendanceRecords
      .filter((r) => r.status === "present")
      .map((r) => r.student_id_no),
  );

  const programsToShow =
    selectedEvent?.program_id ?
      programs.filter((p) => p.id === selectedEvent.program_id)
    : programs;

  const filteredPrograms = programsToShow
    .map((program) => {
      const students = program.studentList ?? [];
      const filtered = students.filter((s) => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const matchesSearch =
          !searchQuery.trim() ||
          fullName.includes(searchQuery.toLowerCase()) ||
          s.student_id_no.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear =
          yearLevelFilter === "ALL" || String(s.year_level) === yearLevelFilter;
        return matchesSearch && matchesYear;
      });
      return { ...program, students: filtered };
    })
    .filter((p) => p.students.length > 0);

  const handlePrint = (programCode: string, programName: string) => {
    const tableEl = document.getElementById(`print-section-${programCode}`);
    if (!tableEl) return;
    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    // CHANGED: use start_date for the printed header
    const printedDate =
      selectedEvent ?
        (parseDate(selectedEvent.start_date)?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) ?? "")
      : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Report – ${programCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 2px; }
            h3 { margin: 0 0 16px 0; color: #555; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
            th { background-color: #f2f2f2; font-weight: 600; }
          </style>
        </head>
        <body>
          <h2>${selectedEvent?.title || "Event"}</h2>
          <h3>${programCode} – ${programName} &nbsp;|&nbsp; ${printedDate}</h3>
          ${tableEl.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (programsLoading || eventsLoading) {
    return (
      <div className="ah-layout">
        <Sidebar />
        <main
          className="ah-content-area"
          style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="ah-loading">
            <div className="spinner-border text-primary" role="status" />
            <p style={{ marginTop: "0.75rem", color: "#94a3b8" }}>
              Loading attendance history...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // CHANGED: subtitle date now reads start_date
  const selectedEventDateLabel =
    selectedEvent ?
      (parseDate(selectedEvent.start_date)?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) ?? "—")
    : "";

  return (
    <div className="ah-layout">
      <Sidebar />

      <main className="ah-content-area">
        {/* ── Header ── */}
        <header className="ah-header">
          <div className="ah-header-wave" />
          <div className="ah-header-content ah-fade-up">
            <div className="ah-header-icon">
              <i className="bi bi-clipboard-check" />
            </div>
            <div className="ah-header-text">
              <h1>Attendance History</h1>
              <p>Past event attendance records</p>
            </div>
          </div>
        </header>

        <div className="ah-content-wrapper">
          {/* ── Controls Bar ── */}
          <div className="ah-controls-bar ah-fade-up ah-delay-1">
            <div>
              <h2 className="ah-event-title">
                <i
                  className="bi bi-calendar-event"
                  style={{ color: "#4f46e5", fontSize: "1.4rem" }}
                />
                {selectedEvent ? selectedEvent.title : "No Event Selected"}
              </h2>
              <p className="ah-event-subtitle">
                {selectedEvent ?
                  <>
                    {selectedEventDateLabel}
                    {" · "}
                    <span style={{ textTransform: "capitalize" }}>
                      {selectedEvent.status}
                    </span>
                    {selectedEvent.program_id && (
                      <span className="ah-program-specific-badge">
                        <i
                          className="bi bi-diagram-3"
                          style={{ marginRight: 4 }}
                        />
                        Program-specific
                      </span>
                    )}
                  </>
                : "—"}
              </p>
            </div>

            <div className="ah-controls-right">
              {/* Event dropdown */}
              <div className="ah-select-wrapper">
                <i className="bi bi-calendar-event ah-select-icon" />
                <select
                  value={selectedEventId ?? ""}
                  onChange={(e) =>
                    setSelectedEventId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="ah-select">
                  <option value="">Select an event</option>
                  {[...yearFilteredEvents]
                    .sort(sortByStartDateDesc)
                    .map((e) => {
                      const d = parseDate(e.start_date);
                      const label =
                        d ?
                          d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "No date";
                      return (
                        <option key={e.id} value={e.id}>
                          {e.title} — {label}
                        </option>
                      );
                    })}
                </select>
                <i className="bi bi-chevron-down ah-select-chevron" />
              </div>

              {/* Year filter */}
              <div style={{ position: "relative", minWidth: 130 }}>
                <i
                  className="bi bi-calendar3"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6c757d",
                    fontSize: "0.9rem",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedEventId(null);
                  }}
                  className="ah-select-year">
                  {uniqueYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <i className="bi bi-chevron-down ah-select-chevron" />
              </div>

              {/* Year level filter */}
              <select
                className="ah-year-level-select"
                value={yearLevelFilter}
                onChange={(e) => setYearLevelFilter(e.target.value)}>
                <option value="ALL">All Year Levels</option>
                <option value="1st year">1st Year</option>
                <option value="2nd year">2nd Year</option>
                <option value="3rd year">3rd Year</option>
                <option value="4th year">4th Year</option>
              </select>

              {/* Search */}
              <div className="ah-search-wrapper">
                <i className="bi bi-search ah-search-icon" />
                <input
                  type="text"
                  className="ah-search-input"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Loading ── */}
          {loadingAttendance && (
            <div className="ah-loading">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              />
              <p
                style={{
                  marginTop: "0.5rem",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                }}>
                Loading attendance...
              </p>
            </div>
          )}

          {/* ── Program Tables ── */}
          {!loadingAttendance && (
            <div className="ah-fade-up ah-delay-2">
              {filteredPrograms.length > 0 ?
                filteredPrograms.map((program) => {
                  const presentCount = program.students.filter((s) =>
                    presentIds.has(s.student_id_no),
                  ).length;
                  const totalCount = program.students.length;
                  const pct =
                    totalCount > 0 ?
                      Math.round((presentCount / totalCount) * 100)
                    : 0;
                  const pctColor =
                    pct === 100 ? "#198754"
                    : pct >= 75 ? "#0d6efd"
                    : pct >= 50 ? "#856404"
                    : "#dc3545";

                  return (
                    <div key={program.code} className="ah-program-card">
                      <div className="ah-program-card-header">
                        <div className="ah-program-header-left">
                          <span className="ah-program-code-badge">
                            {program.code}
                          </span>
                          <h3 className="ah-program-card-title">
                            {program.name}
                          </h3>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                          }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}>
                            <div className="ah-progress-track">
                              <div
                                className="ah-progress-fill"
                                style={{
                                  width: `${pct}%`,
                                  background: pctColor,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: pctColor,
                              }}>
                              {pct}%
                            </span>
                          </div>
                          <div className="ah-program-meta">
                            <i
                              className="bi bi-people-fill"
                              style={{ color: "#94a3b8" }}
                            />
                            <span className="ah-present-count">
                              {presentCount}
                            </span>
                            <span style={{ color: "#94a3b8" }}>
                              / {totalCount} present
                            </span>
                          </div>
                          <button
                            className="ah-btn-print"
                            onClick={() =>
                              handlePrint(program.code, program.name)
                            }>
                            <i className="bi bi-printer" />
                            Print
                          </button>
                        </div>
                      </div>

                      <div id={`print-section-${program.code}`}>
                        <div className="ah-table-wrapper">
                          <table className="ah-table">
                            <thead>
                              <tr>
                                <th className="ah-th" style={{ width: 50 }}>
                                  #
                                </th>
                                <th className="ah-th" style={{ width: 150 }}>
                                  ID Number
                                </th>
                                <th className="ah-th">Student Name</th>
                                <th
                                  className="ah-th-center"
                                  style={{ width: 100 }}>
                                  Year
                                </th>
                                <th
                                  className="ah-th-center"
                                  style={{ width: 130 }}>
                                  Status
                                </th>
                                <th
                                  className="ah-th-center"
                                  style={{ width: 160 }}>
                                  Time
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {program.students.map((student, idx) => {
                                const isPresent = presentIds.has(
                                  student.student_id_no,
                                );
                                const record = attendanceRecords.find(
                                  (r) =>
                                    r.student_id_no === student.student_id_no,
                                );
                                return (
                                  <tr
                                    key={student.id}
                                    className="ah-table-row"
                                    style={{
                                      background:
                                        idx % 2 === 0 ? "#fff" : "#fafafa",
                                    }}>
                                    <td
                                      className="ah-td"
                                      style={{
                                        color: "#94a3b8",
                                        fontSize: "0.8rem",
                                      }}>
                                      {idx + 1}
                                    </td>
                                    <td
                                      className="ah-td"
                                      style={{
                                        fontWeight: 700,
                                        color: "#4f46e5",
                                      }}>
                                      {student.student_id_no}
                                    </td>
                                    <td className="ah-td">
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}>
                                        <div
                                          className="ah-avatar-circle"
                                          style={{
                                            background:
                                              isPresent ? "#dcfce7" : "#f1f5f9",
                                            color:
                                              isPresent ? "#166534" : "#64748b",
                                          }}>
                                          {student.first_name.charAt(0)}
                                        </div>
                                        <div>
                                          <div
                                            style={{
                                              fontWeight: 600,
                                              color: "#1e293b",
                                            }}>
                                            {student.last_name},{" "}
                                            {student.first_name}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="ah-td-center">
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}>
                                        {student.year_level ?
                                          <span className="ah-badge-year-level">
                                            {student.year_level}
                                          </span>
                                        : <span style={{ color: "#cbd5e1" }}>
                                            —
                                          </span>
                                        }
                                      </div>
                                    </td>
                                    <td className="ah-td-center">
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}>
                                        {isPresent ?
                                          <span className="ah-badge-present">
                                            ✓ Present
                                          </span>
                                        : <span className="ah-badge-absent">
                                            Absent
                                          </span>
                                        }
                                      </div>
                                    </td>
                                    <td
                                      className="ah-td-center"
                                      style={{
                                        color: "#94a3b8",
                                        fontSize: "0.82rem",
                                      }}>
                                      {record?.attendance_time ?
                                        new Date(
                                          record.attendance_time,
                                        ).toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : <span style={{ color: "#cbd5e1" }}>
                                          —
                                        </span>
                                      }
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })
              : <div className="ah-empty-state">
                  <i className="bi bi-search ah-empty-icon" />
                  <p style={{ fontSize: "0.95rem", margin: 0 }}>
                    {selectedEventId ?
                      "No students match your search."
                    : "Select an event to view attendance."}
                  </p>
                </div>
              }
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AttendanceHistory;
