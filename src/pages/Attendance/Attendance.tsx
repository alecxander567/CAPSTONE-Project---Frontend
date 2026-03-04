import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { usePrograms } from "../../hooks/useProgram";
import type { AppEvent } from "../../hooks/useEvents";
import { useEvents } from "../../hooks/useEvents";
import { useAttendance } from "../../hooks/useAttendance";

interface Event {
  id: number;
  title: string;
  date: string;
  program_id?: number | null;
}

interface StudentWithStatus {
  id: number;
  student_id_no: string;
  first_name: string;
  last_name: string;
  status?: string;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  // Layout
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    overflowX: "hidden",
  },
  contentArea: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    marginLeft: "260px",
  },
  contentWrapper: {
    maxWidth: 1600,
    margin: "0 auto",
    width: "100%",
    padding: "0 1.5rem 2rem",
  },

  // Header
  header: {
    position: "relative",
    background: "linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%)",
    color: "#fff",
    padding: "3rem 2rem",
    overflow: "hidden",
    marginBottom: "-2rem",
    paddingBottom: "3rem",
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: "0.75rem",
    position: "relative",
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
    margin: "0 auto 0.5rem",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 700,
  },
  headerSubtitle: {
    margin: 0,
    opacity: 0.85,
    fontSize: "0.95rem",
  },

  // Back button
  btnBack: {
    position: "absolute",
    top: "2rem",
    left: "2rem",
    zIndex: 10,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "0.6rem 1.2rem",
    borderRadius: 30,
    fontWeight: 600,
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Attendance header section
  attendanceHeaderSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1.5rem",
    flexWrap: "wrap" as const,
    paddingTop: "1.5rem",
    marginBottom: "1.5rem",
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 280,
  },
  eventPageTitle: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 0.4rem 0",
    display: "flex",
    alignItems: "center",
  },
  eventPageSubtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: 0,
  },

  // Controls right
  controlsRight: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    alignItems: "flex-end",
    flexShrink: 0,
  },
  controlsRow: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: "0.75rem",
  },
  yearSelect: {
    width: 160,
    height: 42,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    padding: "0 2rem 0 0.85rem",
    backgroundColor: "#fff",
    cursor: "pointer",
    appearance: "auto" as const,
  },
  searchWrapper: {
    position: "relative" as const,
    width: 280,
  },
  searchIcon: {
    position: "absolute" as const,
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "1rem",
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    height: 42,
    padding: "0 1rem 0 2.5rem",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: "0.9rem",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
  },

  // Attendance buttons
  btnStart: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.65rem 1.5rem",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    color: "white",
    background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
    width: "100%",
    transition: "all 0.3s ease",
  },
  btnStop: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.65rem 1.5rem",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    color: "white",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    width: "100%",
    transition: "all 0.3s ease",
  },

  // Program card
  programCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    marginBottom: "2rem",
  },
  programCardHeader: {
    padding: "1rem 1.5rem",
    background: "#fff",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "0.75rem",
  },
  programHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
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
  programHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexShrink: 0,
  },
  programMeta: {
    color: "#64748b",
    fontSize: "0.875rem",
    background: "#f8fafc",
    padding: "0.35rem 0.75rem",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    whiteSpace: "nowrap" as const,
  },
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

  // Table
  tableWrapper: {
    maxHeight: 800,
    overflowY: "auto" as const,
    position: "relative" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: 0,
  },
  th: {
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    fontSize: "0.72rem",
    letterSpacing: "0.04em",
    padding: "0.9rem 1.25rem",
    borderBottom: "2px solid #e2e8f0",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    textAlign: "left" as const,
  },
  thCenter: {
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    fontSize: "0.72rem",
    letterSpacing: "0.04em",
    padding: "0.9rem 1.25rem",
    borderBottom: "2px solid #e2e8f0",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    textAlign: "center" as const,
  },
  td: {
    padding: "0.75rem 1.25rem",
    verticalAlign: "middle" as const,
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "0.9rem",
  },
  tdCenter: {
    padding: "0.75rem 1.25rem",
    verticalAlign: "middle" as const,
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "0.9rem",
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
    background: "#22c55e",
    color: "#fff",
    padding: "0.3rem 0.65rem",
    borderRadius: 6,
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  badgeNotMarked: {
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    padding: "0.3rem 0.65rem",
    borderRadius: 6,
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  badgeYearLevel: {
    background: "rgba(100,116,139,0.1)",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "0.25rem 0.6rem",
    borderRadius: 6,
    fontSize: "0.8rem",
    fontWeight: 500,
  },

  // Empty / loading states
  emptyState: {
    textAlign: "center" as const,
    padding: "3rem 1rem",
    color: "#94a3b8",
  },
  loadingState: {
    textAlign: "center" as const,
    padding: "3rem 1rem",
  },

  // Alert
  alertDanger: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 12,
    padding: "0.85rem 1.25rem",
    marginBottom: "1rem",
  },
};

// Keyframes injected once
const injectKeyframes = () => {
  if (document.getElementById("attendance-keyframes")) return;
  const style = document.createElement("style");
  style.id = "attendance-keyframes";
  style.textContent = `
    @keyframes wave {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
};

// ── Component ─────────────────────────────────────────────────────────────────
function Attendance() {
  const navigate = useNavigate();
  const { programs, loading: loadingPrograms, error } = usePrograms();
  const { eventId } = useParams();
  const { getEventById } = useEvents();
  const { startAttendance, stopAttendance, loading: attendanceLoading } = useAttendance();

  const [attendanceActive, setAttendanceActive] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentStatus, setStudentStatus] = useState<Record<string, string>>({});
  const [studentTime, setStudentTime] = useState<Record<string, string>>({});
  const [yearLevelFilter, setYearLevelFilter] = useState<string>("ALL");

  const attendanceActiveRef = useRef(false);

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    attendanceActiveRef.current = attendanceActive;
  }, [attendanceActive]);

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      setLoadingEvent(true);
      try {
        const data: AppEvent = await getEventById(Number(eventId));
        setEvent({ id: data.id, title: data.title, date: data.event_date, program_id: data.program_id ?? null });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvent(false);
      }
    };
    fetchEvent();
  }, [eventId, getEventById]);

  useEffect(() => {
    return () => {
      if (attendanceActiveRef.current) {
        stopAttendance().catch((err) => console.error("Failed to stop attendance on unmount:", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const programsToShow = event?.program_id
    ? programs.filter((p) => p.id === event.program_id)
    : programs;

  const filteredPrograms = programsToShow
    .map((program) => {
      const filteredStudents = (program.studentList || []).filter((student) => {
        const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
        const id = student.student_id_no.toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery.trim() || fullName.includes(query) || id.includes(query);
        const matchesYear = yearLevelFilter === "ALL" || String(student.year_level) === yearLevelFilter;
        return matchesSearch && matchesYear;
      });
      return { ...program, studentList: filteredStudents };
    })
    .filter((program) => program.studentList && program.studentList.length > 0);

  useEffect(() => {
    if (programs.length === 0) return;
    setStudentStatus((prevStatus) => {
      const statusMap: Record<string, string> = { ...prevStatus };
      programs.forEach((program) => {
        (program.studentList || []).forEach((student) => {
          if (!statusMap[student.student_id_no]) statusMap[student.student_id_no] = "Not Marked";
        });
      });
      return statusMap;
    });
  }, [programs]);

  useEffect(() => {
    if (!attendanceActive || !eventId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/attendance/by-event/${eventId}`);
        if (!res.ok) { console.error(`HTTP Error: ${res.status} ${res.statusText}`); return; }
        const data: { student_id_no: string; status: string; attendance_time?: string }[] = await res.json();
        setStudentStatus((prev) => {
          const updated = { ...prev };
          data.forEach((item) => { updated[item.student_id_no] = item.status; });
          return updated;
        });
        setStudentTime((prev) => {
          const updated = { ...prev };
          data.forEach((item) => { if (item.attendance_time) updated[item.student_id_no] = item.attendance_time; });
          return updated;
        });
      } catch (err) {
        console.error("Failed to fetch attendance updates:", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [attendanceActive, eventId]);

  const handlePrint = (programCode: string) => {
    const tableElement = document.getElementById(`print-section-${programCode}`);
    if (!tableElement) return;
    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>${event?.title || "Event"}</h2>
          ${tableElement.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div style={S.layout}>
      <Sidebar />

      <div style={S.contentArea}>
        {/* ── Page Header ── */}
        <header style={S.header}>
          <div style={S.wave} />

          <button
            style={S.btnBack}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)"; }}
            onClick={async () => {
              if (attendanceActive) {
                try { await stopAttendance(); setAttendanceActive(false); }
                catch (err) { console.error("Failed to stop attendance:", err); }
              }
              navigate("/events", { state: { fromAttendance: true } });
            }}>
            <i className="bi bi-arrow-left" />
            <span>Back to Events</span>
          </button>

          <div style={S.headerContent}>
            <div style={S.headerIcon}>
              <i className="bi bi-calendar-check" />
            </div>
            <div>
              <h1 style={S.headerTitle}>Attendance</h1>
              <p style={S.headerSubtitle}>Track student participation</p>
            </div>
          </div>
        </header>

        <div style={S.contentWrapper}>
          {/* ── Controls Row ── */}
          <div style={S.attendanceHeaderSection}>
            <div style={S.headerTextGroup}>
              <h2 style={S.eventPageTitle}>
                {loadingEvent ? (
                  <span style={{ color: "#94a3b8" }}>Loading...</span>
                ) : (
                  <>
                    <i className="bi bi-calendar-event" style={{ marginRight: "0.5rem", color: "#4f46e5" }} />
                    {event?.title || "Event Details"}
                  </>
                )}
              </h2>
              <p style={S.eventPageSubtitle}>
                {event?.program_id ? (
                  <span style={{ background: "rgba(79,70,229,0.1)", color: "#4f46e5", padding: "0.25rem 0.65rem", borderRadius: 6, fontSize: "0.85rem", fontWeight: 600 }}>
                    <i className="bi bi-diagram-3" style={{ marginRight: "0.3rem" }} />
                    Program-specific event
                  </span>
                ) : (
                  "View student lists by program below."
                )}
              </p>
            </div>

            <div style={S.controlsRight}>
              {/* Search + Year Level — same row */}
              <div style={S.controlsRow}>
                <select
                  style={S.yearSelect}
                  value={yearLevelFilter}
                  onChange={(e) => setYearLevelFilter(e.target.value)}>
                  <option value="ALL">All Year Levels</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                  <option value="4th year">4th Year</option>
                </select>

                <div style={S.searchWrapper}>
                  <i className="bi bi-search" style={S.searchIcon} />
                  <input
                    type="text"
                    style={S.searchInput}
                    placeholder="Search student or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Attendance toggle */}
              {!attendanceActive ? (
                <button
                  style={{ ...S.btnStart, opacity: attendanceLoading ? 0.6 : 1, cursor: attendanceLoading ? "not-allowed" : "pointer" }}
                  disabled={attendanceLoading}
                  onClick={async () => {
                    try { await startAttendance(); setAttendanceActive(true); }
                    catch (err) { console.error("Failed to start attendance:", err); }
                  }}>
                  <i className="bi bi-play-circle" style={{ marginRight: "0.5rem" }} />
                  Start Attendance
                </button>
              ) : (
                <button
                  style={{ ...S.btnStop, opacity: attendanceLoading ? 0.6 : 1, cursor: attendanceLoading ? "not-allowed" : "pointer" }}
                  disabled={attendanceLoading}
                  onClick={async () => {
                    try { await stopAttendance(); setAttendanceActive(false); }
                    catch (err) { console.error("Failed to stop attendance:", err); }
                  }}>
                  <i className="bi bi-stop-circle" style={{ marginRight: "0.5rem" }} />
                  Stop Attendance
                </button>
              )}
            </div>
          </div>

          {/* ── Loading / Error ── */}
          {loadingPrograms && (
            <div style={S.loadingState}>
              <div className="spinner-border text-primary" role="status" />
              <p style={{ marginTop: "0.5rem", color: "#94a3b8" }}>Loading programs...</p>
            </div>
          )}

          {error && <div style={S.alertDanger}>{error}</div>}

          {/* ── Program Tables ── */}
          {!loadingPrograms && (
            <div>
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((program) => {
                  const students = program.studentList || [];
                  const studentCount = students.length;

                  return (
                    <div key={program.code} style={S.programCard}>

                      {/* Card Header */}
                      <div style={S.programCardHeader}>
                        <div style={S.programHeaderLeft}>
                          <span style={S.programCodeBadge}>{program.code}</span>
                          <h3 style={S.programCardTitle}>{program.name}</h3>
                        </div>
                        <div style={S.programHeaderRight}>
                          <div style={S.programMeta}>
                            <i className="bi bi-people-fill" style={{ marginRight: "0.4rem", color: "#94a3b8" }} />
                            <strong>{studentCount}</strong> Students Enrolled
                          </div>
                          <button
                            style={S.btnPrint}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#0a58ca"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#0d6efd"; }}
                            onClick={() => handlePrint(program.code)}>
                            <i className="bi bi-printer" />
                            Print
                          </button>
                        </div>
                      </div>

                      {/* Printable Table */}
                      <div id={`print-section-${program.code}`}>
                        <div style={S.tableWrapper}>
                          <table style={S.table}>
                            <thead>
                              <tr>
                                <th style={{ ...S.th, width: 60 }}>#</th>
                                <th style={{ ...S.th, width: 150 }}>ID Number</th>
                                <th style={S.th}>Student Name</th>
                                <th style={{ ...S.thCenter, width: 130 }}>Year Level</th>
                                <th style={{ ...S.thCenter, width: 150 }}>Status</th>
                                <th style={{ ...S.thCenter, width: 170 }}>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.length > 0 ? (
                                students.map((student, idx) => (
                                  <tr
                                    key={student.id || idx}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                                    <td style={{ ...S.td, color: "#94a3b8", fontSize: "0.85rem" }}>{idx + 1}</td>
                                    <td style={{ ...S.td, fontWeight: 700, color: "#4f46e5" }}>{student.student_id_no}</td>
                                    <td style={S.td}>
                                      <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={S.avatarCircle}>{student.first_name.charAt(0)}</div>
                                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                          {student.last_name}, {student.first_name}
                                        </span>
                                      </div>
                                    </td>
                                    <td style={S.tdCenter}>
                                      {student.year_level ? (
                                        <span style={S.badgeYearLevel}>{student.year_level}</span>
                                      ) : (
                                        <span style={{ color: "#cbd5e1" }}>—</span>
                                      )}
                                    </td>
                                    <td style={S.tdCenter}>
                                      <span style={
                                        studentStatus[student.student_id_no]?.toLowerCase() === "present"
                                          ? S.badgePresent
                                          : S.badgeNotMarked
                                      }>
                                        {studentStatus[student.student_id_no] || "Not Marked"}
                                      </span>
                                    </td>
                                    <td style={{ ...S.tdCenter, color: "#94a3b8", fontSize: "0.85rem" }}>
                                      {studentTime[student.student_id_no]
                                        ? new Date(studentTime[student.student_id_no]).toLocaleDateString()
                                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} style={{ ...S.tdCenter, padding: "2rem", color: "#94a3b8" }}>
                                    No students found in this program.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>{/* closes print-section */}

                    </div> /* closes program-table-card */
                  );
                })
              ) : (
                <div style={S.emptyState}>
                  <i className="bi bi-search" style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem", opacity: 0.4 }} />
                  No programs or students match your search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Attendance;