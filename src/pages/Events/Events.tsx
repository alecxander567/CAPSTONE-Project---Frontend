import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useEvents } from "../../hooks/useEvents";
import type { AppEvent } from "../../hooks/useEvents";
import AddEventModal from "../../components/AddEventsModal/AddEventsModal";
import type { EventData } from "../../components/AddEventsModal/AddEventsModal";
import DeleteEventModal from "../../components/DeleteEventModal/deleteEventModal";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";
import "./Events.css";

interface StoredEvent extends EventData {
  id: number;
}

interface AxiosError {
  response?: {
    status?: number;
    data?: {
      detail?: unknown;
    };
  };
}

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === "object" && error !== null && "response" in error;
}

function Events() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    events,
    totalEvents,
    loading,
    error,
    addEvent,
    editEvent,
    deleteEvent,
    refetch,
  } = useEvents();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StoredEvent | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<AppEvent | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    if (location.state?.fromAttendance) {
      refetch();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, refetch, navigate]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async (data: EventData) => {
    try {
      if (editingEvent) {
        await editEvent(editingEvent.id, data);
        setSuccessMessage("Event updated successfully!");
      } else {
        await addEvent(data);
        setSuccessMessage("Event created successfully!");
      }

      setShowSuccess(true);
      handleCloseModal();
    } catch (err: unknown) {
      console.error(err);

      let message = "Failed to save event. Please try again.";

      if (isAxiosError(err)) {
        const status = err.response?.status;
        const validationErrors = err.response?.data?.detail;

        if (status === 422) {
          if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            const firstError = validationErrors[0];
            if (
              typeof firstError === "object" &&
              firstError !== null &&
              "msg" in firstError
            ) {
              message = String(firstError.msg) || "Invalid input.";
            } else {
              message = "Invalid input.";
            }
          } else if (typeof validationErrors === "string") {
            message = validationErrors;
          } else {
            message = "Invalid input. Please check your data.";
          }
        } else if (status === 403) {
          message = "You don't have permission to perform this action.";
        }
      }

      setErrorMessage(message);
      setShowError(true);
    }
  };

  const handleEditEvent = (event: AppEvent) => {
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description || "",
      event_date: event.event_date,
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      location: event.location || "",
      program_id: event.program_id ?? null,
    });
    setShowModal(true);
  };

  const handleDeleteEvent = async (event: AppEvent) => {
    setDeletingEvent(event);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;

    try {
      await deleteEvent(deletingEvent.id);
      setSuccessMessage("Event deleted successfully!");
      setShowSuccess(true);
      setDeletingEvent(null);
      setShowDeleteModal(false);
    } catch (err: unknown) {
      console.error(err);

      let message = "Failed to delete event. Please try again.";

      if (isAxiosError(err) && err.response?.status === 403) {
        message = "You don't have permission to delete this event.";
      }

      setErrorMessage(message);
      setShowError(true);
      setShowDeleteModal(false);
    }
  };

  const handleViewAttendance = (eventId: number) => {
    navigate(`/attendance/${eventId}`);
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="events-layout">
      <Sidebar />

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

            <div className="d-flex gap-2 flex-wrap align-items-center">
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

              <button
                className="btn btn-primary btn-add-event shadow-sm"
                onClick={handleOpenModal}>
                <i className="bi bi-plus-lg me-2"></i>
                Create Event
              </button>
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
                Get started by adding your first event
              </p>
            </div>
          )}

          {filteredEvents.length > 0 && !loading && (
            <div className="events-grid fade-up delay-2">
              {filteredEvents.map((event: AppEvent) => (
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
                    <div className="header-overlay"></div>
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

                  <div className="event-card-footer">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewAttendance(event.id)}
                      title="View Attendance">
                      <i className="bi bi-eye"></i> View
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditEvent(event)}
                      title="Edit Event">
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteEvent(event)}
                      title="Delete Event">
                      <i className="bi bi-trash3"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AddEventModal
          show={showModal}
          onClose={() => {
            handleCloseModal();
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          initialData={editingEvent}
        />

        <DeleteEventModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingEvent(null);
          }}
          onConfirm={handleConfirmDelete}
          eventTitle={deletingEvent?.title || ""}
        />

        <SuccessAlert
          show={showSuccess}
          message={successMessage}
          onClose={() => setShowSuccess(false)}
          duration={3000}
        />

        <ErrorAlert
          show={showError}
          message={errorMessage}
          onClose={() => setShowError(false)}
          duration={3000}
        />
      </div>
    </div>
  );
}

export default Events;
