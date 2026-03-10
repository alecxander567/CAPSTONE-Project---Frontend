import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { usePrograms } from "../../hooks/useProgram";
import { useEvents } from "../../hooks/useEvents";
import type { AppEvent as Event } from "../../hooks/useEvents";

interface AttendanceRecord {
  student_id_no: string;
  first_name: string;
  last_name: string;
  program_id: number;
  status: string;
  attendance_time: string | null;
}

// ── Responsive helper ─────────────────────────────────────────────────────────
const injectResponsiveStyles = () => {
  if (document.getElementById("ah-responsive")) return;
  const style = document.createElement("style");
  style.id = "ah-responsive";
  style.textContent = `
    @keyframes wave {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ah-fade-up { animation: fadeUp 0.5s ease-out forwards; opacity: 0; }
    .ah-delay-1 { animation-delay: 0.1s; }
    .ah-delay-2 { animation-delay: 0.2s; }

    .ah-content-area {
      margin-left: 260px;
      width: calc(100% - 260px);
      min-width: 0;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    @media (max-width: 768px) {
      .ah-content-area {
        margin-left: 0 !important;
        width: 100% !important;
      }
    }
    @media (max-width: 960px) {
      .ah-controls-bar {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .ah-controls-right {
        flex-wrap: wrap !important;
        width: 100% !important;
      }
      .ah-controls-right > * {
        flex: 1 1 160px !important;
        min-width: 0 !important;
      }
    }
    @media (max-width: 640px) {
      .ah-content-wrapper {
        padding: 1.25rem 1rem 1.5rem !important;
      }
    }
    .ah-table-wrapper { overflow-x: auto !important; }
  `;
  document.head.appendChild(style);
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    overflowX: "hidden",
  },
  header: {
    position: "relative",
    background: "linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%)",
    color: "#fff",
    padding: "3rem 2rem",
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "40%",
    top: "-60%",
    left: "-50%",
    animation: "wave 15s linear infinite",
    pointerEvents: "none",
  },
  headerContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    maxWidth: 1400,
    margin: "0 auto",
  },
  headerIcon: {
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(5px)",
    width: 64,
    height: 64,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    flexShrink: 0,
  },
  headerTitle: {
    margin: "0 0 0.25rem 0",
    fontSize: "1.75rem",
    fontWeight: 700,
  },
  headerSubtitle: { margin: 0, opacity: 0.85, fontSize: "0.95rem" },
  content: {
    padding: "2rem 2rem 3rem",
    maxWidth: 1600,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  controlsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1.5rem",
    flexWrap: "wrap" as const,
    paddingTop: "1.5rem",
    marginBottom: "2rem",
  },
  eventTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 0.35rem 0",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  eventSubtitle: { fontSize: "0.9rem", color: "#64748b", margin: 0 },
  controlsRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexShrink: 0,
    flexWrap: "wrap" as const,
  },
  selectWrapper: { position: "relative" as const, minWidth: 260 },
  selectIcon: {
    position: "absolute" as const,
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#0d6efd",
    fontSize: "0.9rem",
    pointerEvents: "none" as const,
    zIndex: 1,
  },
  selectChevron: {
    position: "absolute" as const,
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6c757d",
    fontSize: "0.75rem",
    pointerEvents: "none" as const,
  },
  select: {
    width: "100%",
    height: 42,
    padding: "0 2rem 0 2.25rem",
    borderRadius: 12,
    border: "1.5px solid #e0e7ff",
    background: "white",
    color: "#1a1a1a",
    fontSize: "0.875rem",
    fontWeight: 500,
    appearance: "none" as const,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(13,110,253,0.07)",
    outline: "none",
  },
  yearLevelSelect: {
    height: 42,
    minWidth: 150,
    padding: "0 2rem 0 0.85rem",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontSize: "0.875rem",
    backgroundColor: "#fff",
    cursor: "pointer",
    appearance: "auto" as const,
    outline: "none",
  },
  searchWrapper: { position: "relative" as const, width: 240 },
  searchIconStyle: {
    position: "absolute" as const,
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "0.9rem",
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    height: 42,
    padding: "0 1rem 0 2.5rem",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: "0.875rem",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  programCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    marginBottom: "2rem",
  },
  programCardHeader: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "0.75rem",
  },
  programHeaderLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
  programCodeBadge: {
    background: "#e0e7ff",
    color: "#4338ca",
    fontWeight: 800,
    fontSize: "0.85rem",
    padding: "0.35rem 0.75rem",
    borderRadius: 8,
    letterSpacing: "0.5px",
    whiteSpace: "nowrap" as const,
  },
  programCardTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#1e293b",
  },
  programMeta: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#64748b",
    fontSize: "0.875rem",
    background: "#f8fafc",
    padding: "0.35rem 0.85rem",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    whiteSpace: "nowrap" as const,
  },
  presentCount: { color: "#198754", fontWeight: 700 },
  btnPrint: {
    background: "#0d6efd",
    color: "white",
    border: "none",
    padding: "0 0.9rem",
    borderRadius: 8,
    fontSize: "0.85rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    cursor: "pointer",
    height: 36,
    whiteSpace: "nowrap" as const,
    transition: "background 0.2s ease",
  },
  tableWrapper: {
    overflowX: "auto" as const,
    overflowY: "auto" as const,
    maxHeight: 520,
  },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: 560 },
  th: {
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    fontSize: "0.72rem",
    letterSpacing: "0.05em",
    padding: "0.9rem 1.25rem",
    borderBottom: "2px solid #e2e8f0",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    textAlign: "left" as const,
    whiteSpace: "nowrap" as const,
  },
  thCenter: {
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    fontSize: "0.72rem",
    letterSpacing: "0.05em",
    padding: "0.9rem 1.25rem",
    borderBottom: "2px solid #e2e8f0",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "0.8rem 1.25rem",
    verticalAlign: "middle" as const,
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "0.875rem",
  },
  tdCenter: {
    padding: "0.8rem 1.25rem",
    verticalAlign: "middle" as const,
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "0.875rem",
    textAlign: "center" as const,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#c7d2fe",
    color: "#3730a3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.8rem",
    flexShrink: 0,
    marginRight: "0.75rem",
  },
  badgePresent: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "0.3rem 0.75rem",
    borderRadius: 6,
    fontSize: "0.78rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeAbsent: {
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    padding: "0.3rem 0.75rem",
    borderRadius: 6,
    fontSize: "0.78rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeYearLevel: {
    background: "rgba(100,116,139,0.1)",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: "0.78rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
    color: "#94a3b8",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getRecentEvent = (events: Event[]) => {
  if (!events.length) return null;
  const ongoing = events.find((e) => e.status === "ongoing");
  if (ongoing) return ongoing;
  const done = events
    .filter((e) => e.status === "done")
    .sort(
      (a, b) =>
        new Date(`${b.event_date}T${b.end_time}`).getTime() -
        new Date(`${a.event_date}T${a.end_time}`).getTime(),
    );
  if (done.length) return done[0];
  const upcoming = events
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(`${a.event_date}T${a.start_time}`).getTime() -
        new Date(`${b.event_date}T${b.start_time}`).getTime(),
    );
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
    injectResponsiveStyles();
  }, []);

  useEffect(() => {
    if (!events.length) return;
    const recent = getRecentEvent(events);
    if (recent) setSelectedEventId(recent.id);
  }, [events]);

  useEffect(() => {
    if (!selectedEventId) {
      setAttendanceRecords([]);
      return;
    }
    setLoadingAttendance(true);
    axios
      .get<AttendanceRecord[]>(
        `${import.meta.env.VITE_API_URL}/attendance/by-event/${selectedEventId}`,
      )
      .then((res) => setAttendanceRecords(res.data))
      .catch(console.error)
      .finally(() => setLoadingAttendance(false));
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  const uniqueYears = Array.from(
    new Set(events.map((e) => new Date(e.event_date).getFullYear())),
  ).sort((a, b) => b - a);

  const yearFilteredEvents = events.filter(
    (e) => new Date(e.event_date).getFullYear() === Number(selectedYear),
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
          <h3>${programCode} – ${programName} &nbsp;|&nbsp; ${selectedEvent ? new Date(selectedEvent.event_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}</h3>
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
      <div style={S.layout}>
        <Sidebar />
        <main
          className="ah-content-area"
          style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center", color: "#94a3b8" }}>
            <div className="spinner-border text-primary" role="status" />
            <p style={{ marginTop: "0.75rem" }}>
              Loading attendance history...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={S.layout}>
      <Sidebar />

      <main className="ah-content-area">
        {/* ── Header ── */}
        <header style={S.header}>
          <div style={S.wave} />
          <div style={S.headerContent} className="ah-fade-up">
            <div style={S.headerIcon}>
              <i className="bi bi-clipboard-check" />
            </div>
            <div>
              <h1 style={S.headerTitle}>Attendance History</h1>
              <p style={S.headerSubtitle}>Past event attendance records</p>
            </div>
          </div>
        </header>

        <div className="ah-content-wrapper" style={S.content}>
          {/* ── Controls Bar ── */}
          <div
            className="ah-controls-bar ah-fade-up ah-delay-1"
            style={S.controlsBar}>
            <div>
              <h2 style={S.eventTitle}>
                <i
                  className="bi bi-calendar-event"
                  style={{ color: "#4f46e5", fontSize: "1.4rem" }}
                />
                {selectedEvent ? selectedEvent.title : "No Event Selected"}
              </h2>
              <p style={S.eventSubtitle}>
                {selectedEvent ?
                  <>
                    {new Date(selectedEvent.event_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                    {" · "}
                    <span style={{ textTransform: "capitalize" }}>
                      {selectedEvent.status}
                    </span>
                    {selectedEvent.program_id && (
                      <span
                        style={{
                          background: "rgba(79,70,229,0.1)",
                          color: "#4f46e5",
                          borderRadius: 6,
                          padding: "2px 8px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          marginLeft: 8,
                        }}>
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

            <div className="ah-controls-right" style={S.controlsRight}>
              {/* Event dropdown */}
              <div style={S.selectWrapper}>
                <i className="bi bi-calendar-event" style={S.selectIcon} />
                <select
                  value={selectedEventId ?? ""}
                  onChange={(e) =>
                    setSelectedEventId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  style={S.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#0d6efd";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(13,110,253,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e7ff";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(13,110,253,0.07)";
                  }}>
                  <option value="">Select an event</option>
                  {[...yearFilteredEvents]
                    .sort(
                      (a, b) =>
                        new Date(`${b.event_date}T${b.start_time}`).getTime() -
                        new Date(`${a.event_date}T${a.start_time}`).getTime(),
                    )
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} —{" "}
                        {new Date(e.event_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </option>
                    ))}
                </select>
                <i className="bi bi-chevron-down" style={S.selectChevron} />
              </div>

              {/* Year filter (event year) */}
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
                  style={{ ...S.select, minWidth: 130 }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#0d6efd";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(13,110,253,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e7ff";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(13,110,253,0.07)";
                  }}>
                  {uniqueYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <i className="bi bi-chevron-down" style={S.selectChevron} />
              </div>

              {/* Year level filter */}
              <select
                style={S.yearLevelSelect}
                value={yearLevelFilter}
                onChange={(e) => setYearLevelFilter(e.target.value)}>
                <option value="ALL">All Year Levels</option>
                <option value="1st year">1st Year</option>
                <option value="2nd year">2nd Year</option>
                <option value="3rd year">3rd Year</option>
                <option value="4th year">4th Year</option>
              </select>

              {/* Search */}
              <div style={S.searchWrapper}>
                <i className="bi bi-search" style={S.searchIconStyle} />
                <input
                  type="text"
                  style={S.searchInput}
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#4f46e5";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(79,70,229,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Loading ── */}
          {loadingAttendance && (
            <div style={{ textAlign: "center", padding: "3rem" }}>
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
                    <div key={program.code} style={S.programCard}>
                      <div style={S.programCardHeader}>
                        <div style={S.programHeaderLeft}>
                          <span style={S.programCodeBadge}>{program.code}</span>
                          <h3 style={S.programCardTitle}>{program.name}</h3>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap" as const,
                          }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}>
                            <div
                              style={{
                                width: 80,
                                height: 6,
                                background: "#e2e8f0",
                                borderRadius: 99,
                                overflow: "hidden",
                              }}>
                              <div
                                style={{
                                  height: "100%",
                                  width: `${pct}%`,
                                  background: pctColor,
                                  borderRadius: 99,
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
                          <div style={S.programMeta}>
                            <i
                              className="bi bi-people-fill"
                              style={{ color: "#94a3b8" }}
                            />
                            <span style={S.presentCount}>{presentCount}</span>
                            <span style={{ color: "#94a3b8" }}>
                              / {totalCount} present
                            </span>
                          </div>
                          <button
                            style={S.btnPrint}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.background = "#0a58ca";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.background = "#0d6efd";
                            }}
                            onClick={() =>
                              handlePrint(program.code, program.name)
                            }>
                            <i className="bi bi-printer" />
                            Print
                          </button>
                        </div>
                      </div>

                      <div id={`print-section-${program.code}`}>
                        <div
                          className="ah-table-wrapper"
                          style={S.tableWrapper}>
                          <table style={S.table}>
                            <thead>
                              <tr>
                                <th style={{ ...S.th, width: 50 }}>#</th>
                                <th style={{ ...S.th, width: 150 }}>
                                  ID Number
                                </th>
                                <th style={S.th}>Student Name</th>
                                <th style={{ ...S.thCenter, width: 100 }}>
                                  Year
                                </th>
                                <th style={{ ...S.thCenter, width: 130 }}>
                                  Status
                                </th>
                                <th style={{ ...S.thCenter, width: 160 }}>
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
                                    style={{
                                      borderBottom: "1px solid #f1f5f9",
                                      background:
                                        idx % 2 === 0 ? "#fff" : "#fafafa",
                                      transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                      (
                                        e.currentTarget as HTMLTableRowElement
                                      ).style.background = "#f0f4ff";
                                    }}
                                    onMouseLeave={(e) => {
                                      (
                                        e.currentTarget as HTMLTableRowElement
                                      ).style.background =
                                        idx % 2 === 0 ? "#fff" : "#fafafa";
                                    }}>
                                    <td
                                      style={{
                                        ...S.td,
                                        color: "#94a3b8",
                                        fontSize: "0.8rem",
                                      }}>
                                      {idx + 1}
                                    </td>
                                    <td
                                      style={{
                                        ...S.td,
                                        fontWeight: 700,
                                        color: "#4f46e5",
                                      }}>
                                      {student.student_id_no}
                                    </td>
                                    <td style={S.td}>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}>
                                        <div
                                          style={{
                                            ...S.avatarCircle,
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
                                    <td style={S.tdCenter}>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}>
                                        {student.year_level ?
                                          <span style={S.badgeYearLevel}>
                                            {student.year_level}
                                          </span>
                                        : <span style={{ color: "#cbd5e1" }}>
                                            —
                                          </span>
                                        }
                                      </div>
                                    </td>
                                    <td style={S.tdCenter}>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}>
                                        {isPresent ?
                                          <span style={S.badgePresent}>
                                            ✓ Present
                                          </span>
                                        : <span style={S.badgeAbsent}>
                                            Absent
                                          </span>
                                        }
                                      </div>
                                    </td>
                                    <td
                                      style={{
                                        ...S.tdCenter,
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
              : <div style={S.emptyState}>
                  <i
                    className="bi bi-search"
                    style={{
                      fontSize: "2.5rem",
                      display: "block",
                      marginBottom: "0.75rem",
                      opacity: 0.35,
                    }}
                  />
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
