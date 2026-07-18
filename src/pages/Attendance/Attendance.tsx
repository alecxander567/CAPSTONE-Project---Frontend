import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { usePrograms } from "../../hooks/useProgram";
import type { AppEvent } from "../../hooks/useEvents";
import { useEvents } from "../../hooks/useEvents";
import { useAttendance } from "../../hooks/useAttendance";
import "./Attendance.css";

interface Event {
  id: number;
  title: string;
  date: string;
  program_id?: number | null;
}

// ── Fetch attendance records and update state ─────────────────────────────────
async function fetchAttendanceRecords(
  eventId: string,
  setStudentStatus: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >,
  setStudentTime: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/attendance/by-event/${eventId}`,
    );
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} ${res.statusText}`);
      return;
    }
    const data: {
      student_id_no: string;
      status: string;
      attendance_time?: string;
    }[] = await res.json();

    console.log("Attendance data:", data);

    setStudentStatus((prev) => {
      const updated = { ...prev };
      data.forEach((item) => {
        updated[item.student_id_no] = item.status;
      });
      return updated;
    });
    setStudentTime((prev) => {
      const updated = { ...prev };
      data.forEach((item) => {
        if (item.attendance_time)
          updated[item.student_id_no] = item.attendance_time;
      });
      return updated;
    });
  } catch (err) {
    console.error("Failed to fetch attendance updates:", err);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
function Attendance() {
  const navigate = useNavigate();
  const { programs, loading: loadingPrograms, error } = usePrograms();
  const { eventId } = useParams();
  const { getEventById } = useEvents();
  const {
    startAttendance,
    stopAttendance,
    loading: attendanceLoading,
    error: attendanceError,
  } = useAttendance();

  const [attendanceActive, setAttendanceActive] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentStatus, setStudentStatus] = useState<Record<string, string>>(
    {},
  );
  const [studentTime, setStudentTime] = useState<Record<string, string>>({});
  const [yearLevelFilter, setYearLevelFilter] = useState<string>("ALL");
  const attendanceActiveRef = useRef(false);

  useEffect(() => {
    attendanceActiveRef.current = attendanceActive;
  }, [attendanceActive]);

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      setLoadingEvent(true);
      try {
        const data: AppEvent = await getEventById(Number(eventId));
        setEvent({
          id: data.id,
          title: data.title,
          date: data.event_date,
          program_id: data.program_id ?? null,
        });
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
        stopAttendance().catch((err) =>
          console.error("Failed to stop attendance on unmount:", err),
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (programs.length === 0) return;
    setStudentStatus((prevStatus) => {
      const statusMap: Record<string, string> = { ...prevStatus };
      programs.forEach((program) => {
        (program.studentList || []).forEach((student) => {
          if (!(student.student_id_no in statusMap)) {
            statusMap[student.student_id_no] = "Not Marked";
          }
        });
      });
      return statusMap;
    });
  }, [programs]);

  useEffect(() => {
    if (!eventId) return;
    fetchAttendanceRecords(eventId, setStudentStatus, setStudentTime);
    const interval = setInterval(() => {
      fetchAttendanceRecords(eventId, setStudentStatus, setStudentTime);
    }, 3000);
    return () => clearInterval(interval);
  }, [eventId]);

  const programsToShow =
    event?.program_id ?
      programs.filter((p) => p.id === event.program_id)
    : programs;

  const filteredPrograms = programsToShow
    .map((program) => {
      const filteredStudents = (program.studentList || []).filter((student) => {
        const fullName =
          `${student.first_name} ${student.last_name}`.toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery.trim() ||
          fullName.includes(query) ||
          student.student_id_no.toLowerCase().includes(query);
        const matchesYear =
          yearLevelFilter === "ALL" ||
          String(student.year_level) === yearLevelFilter;
        return matchesSearch && matchesYear;
      });
      return { ...program, studentList: filteredStudents };
    })
    .filter((program) => program.studentList && program.studentList.length > 0);

  return (
    <div className="attendance-layout">
      <Sidebar />
      <div className="attendance-content-area">
        <header className="attendance-header">
          <div className="attendance-wave" />
          <button
            className="attendance-btn-back"
            onClick={async () => {
              if (attendanceActive) {
                try {
                  await stopAttendance();
                  setAttendanceActive(false);
                } catch (err) {
                  console.error("Failed to stop attendance:", err);
                }
              }
              navigate("/events", { state: { fromAttendance: true } });
            }}>
            <i className="bi bi-arrow-left" />
            <span className="attendance-btn-back-label">Back to Events</span>
          </button>
          <div className="attendance-header-content">
            <div className="attendance-header-icon">
              <i className="bi bi-calendar-check" />
            </div>
            <div>
              <h1 className="attendance-header-title">Attendance</h1>
              <p className="attendance-header-subtitle">
                Track student participation
              </p>
            </div>
          </div>
        </header>

        <div className="attendance-content-wrapper">
          <div className="attendance-header-section">
            <div className="attendance-header-text-group">
              <h2 className="attendance-event-page-title">
                {loadingEvent ?
                  <span style={{ color: "#94a3b8" }}>Loading...</span>
                : <>
                    <i
                      className="bi bi-calendar-event"
                      style={{ marginRight: "0.5rem", color: "#4f46e5" }}
                    />
                    {event?.title || "Event Details"}
                  </>
                }
              </h2>
              <p className="attendance-event-page-subtitle">
                {event?.program_id ?
                  <span
                    style={{
                      background: "rgba(79,70,229,0.1)",
                      color: "#4f46e5",
                      padding: "0.25rem 0.65rem",
                      borderRadius: 6,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}>
                    <i
                      className="bi bi-diagram-3"
                      style={{ marginRight: "0.3rem" }}
                    />
                    Program-specific event
                  </span>
                : "View student lists by program below."}
              </p>
            </div>

            <div className="attendance-controls-right">
              <div className="attendance-controls-row">
                <select
                  className="attendance-year-select"
                  value={yearLevelFilter}
                  onChange={(e) => setYearLevelFilter(e.target.value)}>
                  <option value="ALL">All Year Levels</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                  <option value="4th year">4th Year</option>
                </select>
                <div className="attendance-search-wrapper">
                  <i className="bi bi-search attendance-search-icon" />
                  <input
                    type="text"
                    className="attendance-search-input"
                    placeholder="Search student or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {!attendanceActive ?
                <button
                  className="attendance-btn-start"
                  style={{
                    opacity: attendanceLoading ? 0.6 : 1,
                    cursor: attendanceLoading ? "not-allowed" : "pointer",
                  }}
                  disabled={attendanceLoading}
                  onClick={async () => {
                    if (!eventId) return;
                    try {
                      await startAttendance(Number(eventId));
                      setAttendanceActive(true);
                    } catch (err) {
                      console.error("Failed to start attendance:", err);
                    }
                  }}>
                  <i
                    className="bi bi-play-circle"
                    style={{ marginRight: "0.5rem" }}
                  />
                  Start Attendance
                </button>
              : <button
                  className="attendance-btn-stop"
                  style={{
                    opacity: attendanceLoading ? 0.6 : 1,
                    cursor: attendanceLoading ? "not-allowed" : "pointer",
                  }}
                  disabled={attendanceLoading}
                  onClick={async () => {
                    try {
                      await stopAttendance();
                      setAttendanceActive(false);
                    } catch (err) {
                      console.error("Failed to stop attendance:", err);
                    }
                  }}>
                  <i
                    className="bi bi-stop-circle"
                    style={{ marginRight: "0.5rem" }}
                  />
                  Stop Attendance
                </button>
              }
            </div>
          </div>

          {attendanceError && (
            <div
              className="attendance-alert-danger"
              style={{ marginBottom: "1rem" }}>
              <i
                className="bi bi-exclamation-triangle-fill"
                style={{ marginRight: "0.5rem" }}
              />
              {attendanceError}
            </div>
          )}

          {loadingPrograms && (
            <div className="attendance-loading-state">
              <div className="spinner-border text-primary" role="status" />
              <p style={{ marginTop: "0.5rem", color: "#94a3b8" }}>
                Loading programs...
              </p>
            </div>
          )}
          {error && <div className="attendance-alert-danger">{error}</div>}

          {!loadingPrograms && (
            <div>
              {filteredPrograms.length > 0 ?
                filteredPrograms.map((program) => {
                  const students = program.studentList || [];
                  return (
                    <div key={program.code} className="attendance-program-card">
                      <div className="attendance-program-card-header">
                        <div className="attendance-program-header-left">
                          <span className="attendance-program-code-badge">
                            {program.code}
                          </span>
                          <h3 className="attendance-program-card-title">
                            {program.name}
                          </h3>
                        </div>
                        <div className="attendance-program-meta">
                          <i
                            className="bi bi-people-fill"
                            style={{ marginRight: "0.4rem", color: "#94a3b8" }}
                          />
                          <strong>{students.length}</strong> Students Enrolled
                        </div>
                      </div>
                      <div className="attendance-table-wrapper">
                        <table className="attendance-table">
                          <thead>
                            <tr>
                              <th
                                className="attendance-th"
                                style={{ width: 60 }}>
                                #
                              </th>
                              <th
                                className="attendance-th"
                                style={{ width: 150 }}>
                                ID Number
                              </th>
                              <th className="attendance-th">Student Name</th>
                              <th
                                className="attendance-th-center"
                                style={{ width: 130 }}>
                                Year Level
                              </th>
                              <th
                                className="attendance-th-center"
                                style={{ width: 150 }}>
                                Status
                              </th>
                              <th
                                className="attendance-th-center"
                                style={{ width: 170 }}>
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.length > 0 ?
                              students.map((student, idx) => (
                                <tr
                                  key={student.id || idx}
                                  onMouseEnter={(e) => {
                                    (
                                      e.currentTarget as HTMLTableRowElement
                                    ).style.background = "#f8fafc";
                                  }}
                                  onMouseLeave={(e) => {
                                    (
                                      e.currentTarget as HTMLTableRowElement
                                    ).style.background = "transparent";
                                  }}>
                                  <td
                                    className="attendance-td"
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "0.85rem",
                                    }}>
                                    {idx + 1}
                                  </td>
                                  <td
                                    className="attendance-td"
                                    style={{
                                      fontWeight: 700,
                                      color: "#4f46e5",
                                    }}>
                                    {student.student_id_no}
                                  </td>
                                  <td className="attendance-td">
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}>
                                      <div className="attendance-avatar-circle">
                                        {student.first_name.charAt(0)}
                                      </div>
                                      <span
                                        style={{
                                          fontWeight: 600,
                                          color: "#1e293b",
                                        }}>
                                        {student.last_name},{" "}
                                        {student.first_name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="attendance-td-center">
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}>
                                      {student.year_level ?
                                        <span className="attendance-badge-year-level">
                                          {student.year_level}
                                        </span>
                                      : <span style={{ color: "#cbd5e1" }}>
                                          —
                                        </span>
                                      }
                                    </div>
                                  </td>
                                  <td className="attendance-td-center">
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}>
                                      <span
                                        className={
                                          (
                                            studentStatus[
                                              student.student_id_no
                                            ]?.toLowerCase() === "present"
                                          ) ?
                                            "attendance-badge-present"
                                          : "attendance-badge-not-marked"
                                        }>
                                        {studentStatus[student.student_id_no] ||
                                          "Not Marked"}
                                      </span>
                                    </div>
                                  </td>
                                  <td
                                    className="attendance-td-center"
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "0.85rem",
                                    }}>
                                    {studentTime[student.student_id_no] ?
                                      new Date(
                                        studentTime[student.student_id_no],
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : <span style={{ color: "#cbd5e1" }}>
                                        —
                                      </span>
                                    }
                                  </td>
                                </tr>
                              ))
                            : <tr>
                                <td
                                  colSpan={6}
                                  className="attendance-td-center"
                                  style={{ padding: "2rem", color: "#94a3b8" }}>
                                  No students found in this program.
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              : <div className="attendance-empty-state">
                  <i
                    className="bi bi-search"
                    style={{
                      fontSize: "2.5rem",
                      display: "block",
                      marginBottom: "0.5rem",
                      opacity: 0.4,
                    }}
                  />
                  No programs or students match your search.
                </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Attendance;
