import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import "./AddEventsModal.css";

interface AddEventModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any | null;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  show,
  onClose,
  onSave,
  initialData = null,
}) => {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setEventDate(initialData.event_date || "");
      setStartTime(initialData.start_time || "");
      setEndTime(initialData.end_time || "");
      setLocation(initialData.location || "");
    } else {
      setTitle("");
      setDescription("");
      setEventDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
    }
  }, [initialData, show]);

  useEffect(() => {
    let timeout: number;

    if (show) {
      setVisible(true);
      timeout = window.setTimeout(() => setActive(true), 20);
    } else {
      setActive(false);
      timeout = window.setTimeout(() => setVisible(false), 300);
    }

    return () => clearTimeout(timeout);
  }, [show]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      location,
    });
  };

  if (!visible) return null;

  return (
    <div className={`custom-modal ${active ? "active" : ""}`} onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content modal-content-enhanced">
          <div className="modal-header modal-header-enhanced">
            <div className="modal-header-content">
              <div className="modal-icon">
                <i
                  className={`bi ${
                    initialData ? "bi-pencil-square" : "bi-calendar-plus"
                  }`}></i>
              </div>
              <div>
                <h5 className="modal-title">
                  {initialData ? "Edit Event" : "Add New Event"}
                </h5>
                <p className="modal-subtitle">
                  {initialData ?
                    "Update event information"
                  : "Create a new event for your calendar"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body modal-body-enhanced">
              <div className="form-group-enhanced">
                <label className="form-label-enhanced">
                  <i className="bi bi-card-heading"></i>
                  Event Title
                </label>
                <input
                  type="text"
                  className="form-control form-control-enhanced"
                  placeholder="Enter event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-enhanced">
                <label className="form-label-enhanced">
                  <i className="bi bi-text-paragraph"></i>
                  Description
                </label>
                <textarea
                  className="form-control form-control-enhanced"
                  placeholder="Describe your event"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required></textarea>
              </div>

              <div className="form-row-2col">
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-calendar3"></i>
                    Event Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-enhanced"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-geo-alt"></i>
                    Location
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-enhanced"
                    placeholder="Enter event location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-clock"></i>
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-enhanced"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-clock-fill"></i>
                    End Time
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-enhanced"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer modal-footer-enhanced">
              <button
                type="button"
                className="btn btn-secondary btn-secondary-enhanced"
                onClick={onClose}>
                <i className="bi bi-x-circle me-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-primary-enhanced">
                <i
                  className={`bi ${
                    initialData ? "bi-save" : "bi-check-circle"
                  } me-2`}></i>
                {initialData ? "Update Event" : "Save Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
