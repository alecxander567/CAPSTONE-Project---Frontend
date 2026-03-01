import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { usePrograms } from "../../hooks/useProgram";
import type { AppEvent } from "../../hooks/useEvents";
import { useEvents } from "../../hooks/useEvents";
import "./Attendance.css";
import { useNavigate } from "react-router-dom";
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

function Attendance() {
  const navigate = useNavigate();
  const { programs, loading: loadingPrograms, error } = usePrograms();
  const { eventId } = useParams();
  const { getEventById } = useEvents();
  const {
    startAttendance,
    stopAttendance,
    loading: attendanceLoading,
  } = useAttendance();

  const [attendanceActive, setAttendanceActive] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentStatus, setStudentStatus] = useState<Record<string, string>>(
    {},
  );
  const [studentTime, setStudentTime] = useState<Record<string, string>>({});

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

        const mappedEvent: Event = {
          id: data.id,
          title: data.title,
          date: data.event_date,
          program_id: data.program_id ?? null,
        };

        setEvent(mappedEvent);
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

  const programsToShow =
    event?.program_id ?
      programs.filter((p) => p.id === event.program_id)
    : programs;

  const filteredPrograms = programsToShow
    .map((program) => {
      if (!searchQuery.trim()) return program;
      const filteredStudents = (program.studentList || []).filter((student) => {
        const fullName =
          `${student.first_name} ${student.last_name}`.toLowerCase();
        const id = student.student_id_no.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || id.includes(query);
      });
      return { ...program, studentList: filteredStudents };
    })
    .filter(
      (program) =>
        !searchQuery.trim() ||
        (program.studentList && program.studentList.length > 0),
    );

  useEffect(() => {
    if (programs.length === 0) return;

    setStudentStatus((prevStatus) => {
      const statusMap: Record<string, string> = { ...prevStatus };

      programs.forEach((program) => {
        (program.studentList || []).forEach((student) => {
          if (!statusMap[student.student_id_no]) {
            statusMap[student.student_id_no] = "Not Marked";
          }
        });
      });

      return statusMap;
    });
  }, [programs]);

  useEffect(() => {
    if (!attendanceActive || !eventId) return;

    const interval = setInterval(async () => {
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

        console.log("Poll response:", JSON.stringify(data)); // ← debug log

        setStudentStatus((prevStatus) => {
          const updatedStatus = { ...prevStatus };
          data.forEach((item) => {
            updatedStatus[item.student_id_no] = item.status;
          });
          return updatedStatus;
        });

        setStudentTime((prevTime) => {
          const updatedTime = { ...prevTime };
          data.forEach((item) => {
            if (item.attendance_time) {
              updatedTime[item.student_id_no] = item.attendance_time;
            }
          });
          return updatedTime;
        });
      } catch (err) {
        console.error("Failed to fetch attendance updates:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [attendanceActive, eventId]);

  return (
    <div className="attendance-layout">
      <Sidebar />

      <div className="content-area">
        <header className="dashboard-header">
          <div className="wave"></div>

          <button
            className="btn-back-header fade-up"
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
            <i className="bi bi-arrow-left"></i>
            <span>Back to Events</span>
          </button>

          <div className="dashboard-header-content fade-up center-content">
            <div className="dashboard-header-icon mb-3">
              <i className="bi bi-calendar-check"></i>
            </div>
            <div className="dashboard-header-text">
              <h1>Attendance</h1>
              <p>Track student participation</p>
            </div>
          </div>
        </header>

        <div className="content-wrapper p-4">
          {/* Header Controls */}
          <div className="attendance-header-section mb-4 fade-up delay-1">
            <div className="header-text-group">
              <h2 className="event-page-title">
                {loadingEvent ?
                  <span className="text-muted">Loading...</span>
                : <>
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    {event?.title || "Event Details"}
                  </>
                }
              </h2>
              <p className="event-page-subtitle">
                {event?.program_id ?
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-diagram-3 me-1"></i>
                    Program-specific event
                  </span>
                : "View student lists by program below."}
              </p>
            </div>

            <div className="attendance-controls-right">
              <div className="student-search-container">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="student-search-input"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {!attendanceActive ?
                <button
                  className="btn-attendance-action btn-start"
                  disabled={attendanceLoading}
                  onClick={async () => {
                    try {
                      await startAttendance();
                      setAttendanceActive(true);
                    } catch (err) {
                      console.error("Failed to start attendance:", err);
                    }
                  }}>
                  <i className="bi bi-play-circle me-2"></i>
                  Start Attendance
                </button>
              : <button
                  className="btn-attendance-action btn-stop"
                  disabled={attendanceLoading}
                  onClick={async () => {
                    try {
                      await stopAttendance();
                      setAttendanceActive(false);
                    } catch (err) {
                      console.error("Failed to stop attendance:", err);
                    }
                  }}>
                  <i className="bi bi-stop-circle me-2"></i>
                  Stop Attendance
                </button>
              }
            </div>
          </div>

          {/* Loading/Error States */}
          {loadingPrograms && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading programs...</p>
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Program Tables List */}
          {!loadingPrograms && (
            <div className="programs-list-container fade-up delay-2">
              {filteredPrograms.length > 0 ?
                filteredPrograms.map((program) => {
                  const students = program.studentList || [];
                  const studentCount = students.length;

                  return (
                    <div key={program.code} className="program-table-card mb-5">
                      <div className="program-table-header">
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge-program-code-large">
                            {program.code}
                          </span>
                          <h3 className="program-table-title">
                            {program.name}
                          </h3>
                        </div>
                        <div className="program-meta">
                          <i className="bi bi-people-fill text-muted me-2"></i>
                          <strong>{studentCount}</strong> Students Enrolled
                        </div>
                      </div>

                      <div className="table-responsive student-table-wrapper">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th scope="col" style={{ width: "60px" }}>
                                #
                              </th>
                              <th scope="col" style={{ width: "150px" }}>
                                ID Number
                              </th>
                              <th scope="col">Student Name</th>
                              <th scope="col" style={{ width: "120px" }}>
                                Year Level
                              </th>
                              <th
                                scope="col"
                                className="text-center"
                                style={{ width: "150px" }}>
                                Status
                              </th>
                              <th
                                scope="col"
                                className="text-center"
                                style={{ width: "180px" }}>
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.length > 0 ?
                              students.map((student, idx) => (
                                <tr key={student.id || idx}>
                                  <td className="text-muted small">
                                    {idx + 1}
                                  </td>
                                  <td className="fw-bold text-primary">
                                    {student.student_id_no}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="avatar-circle-sm me-3">
                                        {student.first_name.charAt(0)}
                                      </div>
                                      <span className="fw-semibold text-dark">
                                        {student.last_name},{" "}
                                        {student.first_name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    {student.year_level ?
                                      <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                                        {student.year_level}
                                      </span>
                                    : <span className="text-muted">—</span>}
                                  </td>
                                  <td className="text-center">
                                    <span
                                      className={`badge ${
                                        (
                                          studentStatus[
                                            student.student_id_no
                                          ]?.toLowerCase() === "present"
                                        ) ?
                                          "bg-success"
                                        : "bg-light text-secondary border"
                                      }`}>
                                      {studentStatus[student.student_id_no] ||
                                        "Not Marked"}
                                    </span>
                                  </td>
                                  <td className="text-center text-muted small">
                                    {studentTime[student.student_id_no] ?
                                      new Date(
                                        studentTime[student.student_id_no],
                                      ).toLocaleDateString()
                                    : <span className="text-secondary">—</span>}
                                  </td>
                                </tr>
                              ))
                            : <tr>
                                <td
                                  colSpan={5}
                                  className="text-center py-4 text-muted">
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
              : <div className="text-center py-5 text-muted">
                  <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
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
