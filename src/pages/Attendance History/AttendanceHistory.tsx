import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./AttendanceHistory.css";
import { usePrograms } from "../../hooks/useProgram";
import { useEvents } from "../../hooks/useEvents";
import type { Event } from "../../hooks/useEvents";

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

  if (doneEvents.length > 0) {
    return doneEvents[0];
  }

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

  const { programs, loading: programsLoading } = usePrograms();
  const { events, loading: eventsLoading } = useEvents();

  const currentEvent = getRecentEvent(events);

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

  const filteredPrograms = programs
    .map((program) => {
      const students = program.studentList ?? [];

      if (!searchQuery.trim()) {
        return { ...program, students };
      }

      const filteredStudents = students.filter((s) => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          s.student_id_no.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      return { ...program, students: filteredStudents };
    })
    .filter((program) => program.students.length > 0);

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

        {/* Content */}
        <div className="attendance-content">
          <div className="attendance-header-section fade-up delay-1">
            <div>
              <h2 className="event-page-title">
                <i className="bi bi-calendar-event me-2 text-primary"></i>
                {currentEvent ? currentEvent.title : "No Active Event"}
              </h2>

              <p className="event-page-subtitle">
                {currentEvent ?
                  <>
                    {new Date(currentEvent.event_date).toLocaleDateString()} •{" "}
                    <span className="text-capitalize">
                      {currentEvent.status}
                    </span>
                  </>
                : "—"}
              </p>
            </div>

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

          {/* Program Tables */}
          <div className="programs-list-container fade-up delay-2">
            {filteredPrograms.length > 0 ?
              filteredPrograms.map((program) => (
                <div key={program.code} className="program-table-card mb-5">
                  {/* Program Header */}
                  <div className="program-table-header">
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge-program-code-large">
                        {program.code}
                      </span>
                      <h3 className="program-table-title">{program.name}</h3>
                    </div>

                    <div className="program-meta">
                      <i className="bi bi-people-fill me-2"></i>
                      {program.students.length} Students
                    </div>
                  </div>

                  {/* Table */}
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
                        </tr>
                      </thead>
                      <tbody>
                        {program.students.map((student, idx) => (
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
                                  {student.last_name}, {student.first_name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-success-subtle text-success border">
                                Present
                              </span>
                            </td>
                          </tr>
                        ))}

                        {program.students.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-4 text-muted">
                              No students found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            : <div className="text-center py-5 text-muted">
                <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                No students match your search.
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  );
}

export default AttendanceHistory;
