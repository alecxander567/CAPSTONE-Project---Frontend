import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./AttendanceHistory.css";
import { usePrograms } from "../../hooks/useProgram";
import { useEvents } from "../../hooks/useEvents";
import type { Event } from "../../hooks/useEvents";

interface AttendanceRecord {
  student_id_no: string;
  first_name: string;
  last_name: string;
  program_id: number;
  status: string;
  attendance_time: string | null;
}

const getRecentEvent = (events: Event[]) => {
  if (!events.length) return null;

  const ongoing = events.find((e) => e.status === "ongoing");
  if (ongoing) return ongoing;

  const doneEvents = events
    .filter((e) => e.status === "done")
    .sort(
      (a, b) =>
        new Date(`${b.event_date}T${b.end_time}`).getTime() -
        new Date(`${a.event_date}T${a.end_time}`).getTime(),
    );

  if (doneEvents.length > 0) return doneEvents[0];

  const upcoming = events
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(`${a.event_date}T${a.start_time}`).getTime() -
        new Date(`${b.event_date}T${b.start_time}`).getTime(),
    )[0];

  return upcoming ?? null;
};

function AttendanceHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const { programs, loading: programsLoading } = usePrograms();
  const { events, loading: eventsLoading } = useEvents();

  useEffect(() => {
    if (events.length === 0) return;
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
        `http://127.0.0.1:8000/attendance/by-event/${selectedEventId}`,
      )
      .then((res) => setAttendanceRecords(res.data))
      .catch(console.error)
      .finally(() => setLoadingAttendance(false));
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

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
      const filtered =
        searchQuery.trim() ?
          students.filter((s) => {
            const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
            return (
              fullName.includes(searchQuery.toLowerCase()) ||
              s.student_id_no.toLowerCase().includes(searchQuery.toLowerCase())
            );
          })
        : students;
      return { ...program, students: filtered };
    })
    .filter((p) => p.students.length > 0);

  if (programsLoading || eventsLoading) {
    return (
      <div className="attendance-layout">
        <Sidebar />
        <main className="attendance-main d-flex justify-content-center align-items-center">
          <p className="text-muted">Loading attendance history...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="attendance-layout">
      <Sidebar />

      <main className="attendance-main">
        {/* Header */}
        <header className="attendance-header">
          <div className="wave"></div>
          <div className="attendance-header-content fade-up">
            <div className="attendance-header-icon">
              <i className="bi bi-clipboard-check"></i>
            </div>
            <div>
              <h1>Attendance History</h1>
              <p>Past event attendance records</p>
            </div>
          </div>
        </header>

        <div className="attendance-content">
          <div className="attendance-header-section fade-up delay-1">
            <div>
              <h2 className="event-page-title">
                <i className="bi bi-calendar-event me-2 text-primary"></i>
                {selectedEvent ? selectedEvent.title : "No Event Selected"}
              </h2>
              <p className="event-page-subtitle">
                {selectedEvent ?
                  <>
                    {new Date(selectedEvent.event_date).toLocaleDateString()} •{" "}
                    <span className="text-capitalize">
                      {selectedEvent.status}
                    </span>
                    {selectedEvent.program_id && (
                      <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                        <i className="bi bi-diagram-3 me-1"></i>
                        Program-specific
                      </span>
                    )}
                  </>
                : "—"}
              </p>
            </div>

            <div
              className="d-flex gap-2 align-items-center"
              style={{ paddingRight: "1.5rem" }}>
              {/* Event Selector */}
              <div style={{ position: "relative", minWidth: "260px" }}>
                <i
                  className="bi bi-calendar-event"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0d6efd",
                    fontSize: "0.95rem",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
                <select
                  value={selectedEventId ?? ""}
                  onChange={(e) =>
                    setSelectedEventId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem 0.5rem 2.25rem",
                    borderRadius: "12px",
                    border: "1.5px solid #e0e7ff",
                    background: "white",
                    color: "#1a1a1a",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    appearance: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(13,110,253,0.07)",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0d6efd";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(13,110,253,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e7ff";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(13,110,253,0.07)";
                  }}>
                  <option value="">Select an event</option>
                  {[...events]
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
                <i
                  className="bi bi-chevron-down"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6c757d",
                    fontSize: "0.8rem",
                    pointerEvents: "none",
                  }}
                />
              </div>
              {/* Search */}
              <div className="student-search-container">
                <i className="bi bi-search search-icon"></i>
                <input
                  className="student-search-input"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Loading attendance */}
          {loadingAttendance && (
            <div className="text-center py-4">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              />
              <p className="text-muted mt-2 small">Loading attendance...</p>
            </div>
          )}

          {/* Program Tables */}
          {!loadingAttendance && (
            <div className="programs-list-container fade-up delay-2">
              {filteredPrograms.length > 0 ?
                filteredPrograms.map((program) => {
                  const presentCount = program.students.filter((s) =>
                    presentIds.has(s.student_id_no),
                  ).length;

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
                          <i className="bi bi-people-fill me-2"></i>
                          <strong>{presentCount}</strong> /{" "}
                          {program.students.length} Present
                        </div>
                      </div>

                      <div className="table-responsive student-table-wrapper">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th style={{ width: "60px" }}>#</th>
                              <th style={{ width: "160px" }}>ID Number</th>
                              <th>Student Name</th>
                              <th
                                className="text-center"
                                style={{ width: "150px" }}>
                                Status
                              </th>
                              <th
                                className="text-center"
                                style={{ width: "180px" }}>
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
                                <tr key={student.id}>
                                  <td className="text-muted">{idx + 1}</td>
                                  <td className="fw-bold text-primary">
                                    {student.student_id_no}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="avatar-circle-sm me-3">
                                        {student.first_name.charAt(0)}
                                      </div>
                                      <span className="fw-semibold">
                                        {student.last_name},{" "}
                                        {student.first_name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    {isPresent ?
                                      <span className="badge bg-success-subtle text-success border">
                                        Present
                                      </span>
                                    : <span className="badge bg-light text-secondary border">
                                        Absent
                                      </span>
                                    }
                                  </td>
                                  <td className="text-center text-muted small">
                                    {record?.attendance_time ?
                                      new Date(
                                        record.attendance_time,
                                      ).toLocaleTimeString()
                                    : <span className="text-secondary">—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              : <div className="text-center py-5 text-muted">
                  <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                  {selectedEventId ?
                    "No students match your search."
                  : "Select an event to view attendance."}
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
