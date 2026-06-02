import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useCalendarEvents } from "../../hooks/useCalendarEvents";
import "./Calendar.css";

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

function Calendar() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const { events, loading, error, fetchCalendarEvents } = useCalendarEvents();

  useEffect(() => {
    fetchCalendarEvents(year, month);
  }, [year, month, fetchCalendarEvents]);

  return (
    <>
      <Sidebar />
      <div className="calendar-page-wrapper">
        <header className="calendar-header">
          <div className="calendar-wave" />
          <div className="calendar-header-content">
            <div className="calendar-header-icon">
              <i className="bi bi-calendar-month" />
            </div>
            <div>
              <h1 className="calendar-header-title">Calendar</h1>
              <p className="calendar-header-subtitle">
                View scheduled events by month
              </p>
            </div>
          </div>
        </header>

        <div className="calendar-content-wrapper">
          {/* Controls */}
          <div className="calendar-controls">
            <select
              className="calendar-select"
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
              className="calendar-year-input"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          {/* Events */}
          <div className="calendar-events-list">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Loading events...</p>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && events.length === 0 && (
              <div className="calendar-empty-state">
                <i className="bi bi-calendar-x calendar-empty-icon" />
                <p className="calendar-empty-text">
                  No events scheduled for this month.
                </p>
              </div>
            )}

            {!loading &&
              events.map((event, i) => {
                const date = new Date(event.event_date);
                return (
                  <div
                    key={event.id}
                    className="calendar-event-card"
                    style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="calendar-event-stripe" />
                    <div className="calendar-date-badge">
                      <span className="calendar-date-day">
                        {date.getDate()}
                      </span>
                      <span className="calendar-date-month">
                        {date.toLocaleString("default", { month: "short" })}
                      </span>
                    </div>
                    <div className="calendar-event-info">
                      <h5 className="calendar-event-title">
                        <i className="bi bi-calendar-event-fill calendar-event-title-icon" />
                        {event.title}
                      </h5>
                      <div className="calendar-event-meta">
                        <span className="calendar-meta-item">
                          <i className="bi bi-clock" />
                          {event.start_time} – {event.end_time}
                        </span>
                        <span className="calendar-meta-item">
                          <i className="bi bi-geo-alt" />
                          {event.location}
                        </span>
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

export default Calendar;
