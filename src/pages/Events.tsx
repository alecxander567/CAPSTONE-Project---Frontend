import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useEvents } from "../hooks/useEvents";
import type { Event } from "../hooks/useEvents";
import AddEventModal from "../components/AddEventsModal";
import DeleteEventModal from "../components/deleteEventModal";
import SuccessAlert from "../components/SuccessAlert";
import "./Events/Events.css";

function Events() {
  const { events, loading, error, addEvent, editEvent, deleteEvent } =
    useEvents();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async (data: any) => {
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
    } catch (err) {
      alert("Failed to save event. Check console.");
      console.error(err);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDeleteEvent = async (event: Event) => {
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
    } catch (err) {
      alert("Failed to delete event. Check console.");
      console.error(err);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 content-area">
        <div className="content-wrapper">
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

          {/* Main Content */}
          <div className="events-container p-4">
            {/* Add Event Button */}
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h2 className="events-section-title mb-0">
                <i className="bi bi-calendar-check me-2 text-primary"></i>
                Upcoming Events & Highlights
              </h2>
              <button
                className="btn btn-primary btn-add-event shadow-sm"
                onClick={handleOpenModal}>
                <i className="bi bi-plus-circle me-2"></i>
                Add New Event
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading events...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div
                className="alert alert-danger d-flex align-items-center"
                role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Empty State */}
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

            {/* Events Grid */}
            {events.length > 0 && !loading && (
              <div className="events-grid">
                {events.map((event: Event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-card-header">
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
                      <p className="event-description">{event.description}</p>

                      <div className="event-details">
                        <div className="event-detail-item">
                          <i className="bi bi-clock"></i>
                          <span>
                            {event.start_time} - {event.end_time}
                          </span>
                        </div>
                        <div className="event-detail-item">
                          <i className="bi bi-geo-alt"></i>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="event-card-footer d-flex flex-wrap gap-2">
                      <button className="btn btn-sm btn-view shadow-sm d-flex align-items-center">
                        <i className="bi bi-eye me-2"></i>
                        <span>View</span>
                      </button>

                      <button
                        className="btn btn-sm btn-edit shadow-sm d-flex align-items-center"
                        onClick={() => handleEditEvent(event)}>
                        <i className="bi bi-pencil-square me-2"></i>
                        <span>Edit</span>
                      </button>

                      <button
                        className="btn btn-sm btn-delete shadow-sm d-flex align-items-center"
                        onClick={() => handleDeleteEvent(event)}>
                        <i className="bi bi-trash3-fill me-2"></i>
                        <span>Delete</span>
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
        </div>
      </div>
    </div>
  );
}

export default Events;
