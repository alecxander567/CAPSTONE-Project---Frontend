import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { usePrograms } from "../../hooks/useProgram";
import type { Event as MyEvent } from "../../hooks/useEvents";
import { useEvents } from "../../hooks/useEvents";
import "./Attendance.css";
import { useNavigate } from "react-router-dom";

interface Event {
  id: number;
  title: string;
  date: string;
}

function Attendance() {
  const navigate = useNavigate();
  const { programs, loading: loadingPrograms, error } = usePrograms();
  const { eventId } = useParams();
  const { getEventById } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);

  const [loadingEvent, setLoadingEvent] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      setLoadingEvent(true);
      try {
        const data: MyEvent = await getEventById(Number(eventId));

        const mappedEvent: Event = {
          id: data.id,
          title: data.title,
          date: data.event_date,
        };

        setEvent(mappedEvent);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const filteredPrograms = programs
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

  return (
    <div className="attendance-layout">
      <Sidebar />

      <div className="content-area">
        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div className="wave"></div>

          <button
            className="btn-back-header fade-up"
            onClick={() =>
              navigate("/events", { state: { fromAttendance: true } })
            }>
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
                View student lists by program below.
              </p>
            </div>

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
                      {/* Program Header */}
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
                              <th
                                scope="col"
                                className="text-center"
                                style={{ width: "150px" }}>
                                Status
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
                                    <span className="badge bg-light text-secondary border">
                                      Not Marked
                                    </span>
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
