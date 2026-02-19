import { useState } from "react";
import StudentSidebar from "../../components/StudentSidebar/StudentSidebar";
import { useEvents } from "../../hooks/useEvents";
import type { Event } from "../../hooks/useEvents";
import "./StudentEvents.css";

function StudentEvents() {
  const { events, totalEvents, loading, error } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ongoing":
        return "badge bg-warning";
      case "upcoming":
        return "badge bg-secondary";
      case "done":
        return "badge bg-success";
      default:
        return "badge bg-dark";
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="events-layout">
      <StudentSidebar />

      <div className="content-area">
        {/* Header */}
        <header className="dashboard-header">
          <div className="wave"></div>
          <div className="dashboard-header-content fade-up">
            <div className="dashboard-header-icon">
              <i className="bi bi-calendar-event"></i>
            </div>
            <div className="dashboard-header-text">
              <h1>Events</h1>
              <p>View upcoming events and details</p>
            </div>
          </div>
        </header>

        <div className="content-wrapper p-4">
          <div className="events-header-controls fade-up delay-1 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
            <div>
              <h2 className="events-section-title mb-1">
                <i className="bi bi-calendar-event me-2 text-primary"></i>
                Upcoming Events
              </h2>
              <p className="text-muted mb-2 mb-md-0">
                Total Events:{" "}
                <span className="fw-bold text-primary">{totalEvents}</span>
              </p>
            </div>

            {/* Search only — no Create button */}
            <div className="search-wrapper">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bi bi-search search-icon"></i>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading events...</p>
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          {events.length === 0 && !loading && !error && (
            <div className="empty-state text-center py-5">
              <div className="empty-state-icon mb-3">
                <i className="bi bi-calendar-x"></i>
              </div>
              <h4 className="text-muted">No Events Yet</h4>
              <p className="text-muted mb-4">
                There are no events scheduled at the moment.
              </p>
            </div>
          )}

          {filteredEvents.length > 0 && !loading && (
            <div className="events-grid fade-up delay-2">
              {filteredEvents.map((event: Event) => (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <div className="event-header-wave"></div>
                    <div className="event-date-badge">
                      <div className="event-date-month">
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          { month: "short" },
                        )}
                      </div>
                      <div className="event-date-day">
                        {new Date(event.event_date).getDate()}
                      </div>
                    </div>
                    <h5 className="event-card-title">{event.title}</h5>
                  </div>

                  <div className="event-card-body">
                    <p className="event-description">
                      {event.description || "No description provided."}
                    </p>
                    <div className="event-details-list">
                      <div className="detail-row">
                        <i className="bi bi-clock"></i>
                        <span>
                          {event.start_time} - {event.end_time}
                        </span>
                      </div>
                      <div className="detail-row">
                        <i className="bi bi-geo-alt"></i>
                        <span>{event.location}</span>
                      </div>
                      {event.program_id && (
                        <div className="detail-row">
                          <i className="bi bi-diagram-3"></i>
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            Program-specific
                          </span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span
                          className={`event-status-badge ${getStatusBadgeClass(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* No footer / action buttons for students */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentEvents;
