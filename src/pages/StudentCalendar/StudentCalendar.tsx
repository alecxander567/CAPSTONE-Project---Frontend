import { useState, useEffect } from "react";
import StudentSidebar from "../../components/StudentSidebar/StudentSidebar";
import { useCalendarEvents } from "../../hooks/useCalendarEvents";
import "./StudentCalendar.css";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function StudentCalendar() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const { events, loading, error, fetchCalendarEvents } = useCalendarEvents();

  useEffect(() => {
    fetchCalendarEvents(year, month);
  }, [year, month, fetchCalendarEvents]);

  return (
    <>
      <StudentSidebar />
      <div className="sc-page-wrapper">
        <header className="sc-header">
          <div className="sc-wave" />
          <div className="sc-header-content">
            <div className="sc-header-icon">
              <i className="bi bi-calendar-month" />
            </div>
            <div className="sc-header-text">
              <h1 className="sc-header-title">Calendar</h1>
              <p className="sc-header-subtitle">
                View scheduled events by month
              </p>
            </div>
          </div>
        </header>

        <div className="sc-content-wrapper">
          <div className="sc-controls">
            <select
              className="sc-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="sc-year-input"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div className="sc-events-list">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Loading events...</p>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && events.length === 0 && (
              <div className="sc-empty-state">
                <i className="bi bi-calendar-x sc-empty-icon" />
                <p className="sc-empty-text">
                  No events scheduled for this month.
                </p>
              </div>
            )}

            {!loading &&
              events.map((event, i) => {
                const date = new Date(event.event_date);
                const statusClass = `sc-status-badge sc-status-${event.status}`;
                return (
                  <div
                    key={event.id}
                    className="sc-event-card"
                    style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="sc-event-stripe" />

                    <div className="sc-date-badge">
                      <span className="sc-date-day">{date.getDate()}</span>
                      <span className="sc-date-month">
                        {date.toLocaleString("default", { month: "short" })}
                      </span>
                    </div>

                    <div className="sc-event-info">
                      <div className="sc-event-header">
                        <h5 className="sc-event-title">
                          <i className="bi bi-calendar-event-fill sc-event-title-icon" />
                          {event.title}
                        </h5>
                        <span className={statusClass}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>

                      {event.description && (
                        <p className="sc-event-description">
                          {event.description}
                        </p>
                      )}

                      <div className="sc-event-meta">
                        <span className="sc-meta-item">
                          <i className="bi bi-clock" />
                          {event.start_time} – {event.end_time}
                        </span>
                        <span className="sc-meta-item">
                          <i className="bi bi-geo-alt" />
                          {event.location}
                        </span>
                        {event.program_id && (
                          <span className="sc-meta-item sc-meta-program">
                            <i className="bi bi-diagram-3" />
                            Program-specific
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentCalendar;
