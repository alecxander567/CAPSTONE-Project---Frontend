import React, { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import "./AddEventsModal.css";

export interface EventData {
  title: string;
  event_date: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  program_id: number | null;
}

export interface StoredEvent extends EventData {
  id: number;
}

interface Program {
  id: number;
  name: string;
  code: string;
}

interface AddEventModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: EventData) => void | Promise<void>;
  initialData?: EventData | null;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  show,
  onClose,
  onSave,
  initialData = null,
}) => {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [eventDate, setEventDate] = useState(initialData?.event_date || "");
  const [startTime, setStartTime] = useState(initialData?.start_time || "");
  const [endTime, setEndTime] = useState(initialData?.end_time || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [programId, setProgramId] = useState<number | null>(
    initialData?.program_id ?? null,
  );
  const [programs, setPrograms] = useState<Program[]>([]);

  // Compute today's date in LOCAL time as YYYY-MM-DD. We use local
  // components instead of toISOString() because the latter returns UTC.
  const [minDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // In edit mode, if the existing event_date is already in the past,
  // don't raise `min` above it — otherwise the existing value becomes
  // invalid and the user can't save unrelated edits to that record.
  const effectiveMinDate =
    initialData?.event_date && initialData.event_date < minDate ?
      initialData.event_date
    : minDate;

  React.useEffect(() => {
    axios
      .get<Program[]>(`${import.meta.env.VITE_API_URL}/programs/`)
      .then((res) => setPrograms(res.data))
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    let showTimeout: number;
    let activeTimeout: number;
    let deactivateTimeout: number;
    let hideTimeout: number;

    if (show) {
      showTimeout = window.setTimeout(() => setVisible(true), 0);
      activeTimeout = window.setTimeout(() => setActive(true), 10);
    } else {
      deactivateTimeout = window.setTimeout(() => setActive(false), 0);
      hideTimeout = window.setTimeout(() => setVisible(false), 300);
    }

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(activeTimeout);
      clearTimeout(deactivateTimeout);
      clearTimeout(hideTimeout);
    };
  }, [show]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    // Client-side past-date guard.
    if (eventDate && eventDate < minDate) {
      setFormError("Event date cannot be in the past.");
      return;
    }

    // Client-side time-order guard.
    if (startTime && endTime && endTime <= startTime) {
      setFormError("End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        title,
        description: description || "",
        event_date: eventDate || "",
        start_time: startTime || "",
        end_time: endTime || "",
        location: location || "",
        program_id: programId,
      });
    } catch (err) {
      // The parent (Events.tsx) already shows an ErrorAlert for us,
      // so we just log here.
      console.error("Failed to save event:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`custom-modal ${active ? "active" : ""}`}
      onClick={submitting ? undefined : onClose}>
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content modal-content-enhanced">
          <div className="modal-header modal-header-enhanced">
            <div className="modal-header-content">
              <div className="modal-icon">
                <i
                  className={`bi ${initialData ? "bi-pencil-square" : "bi-calendar-plus"}`}
                />
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
              onClick={onClose}
              disabled={submitting}
            />
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-body modal-body-enhanced">
              {formError && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle me-2" />
                  {formError}
                </div>
              )}

              <div className="form-row-2col">
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-card-heading" /> Event Title
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-enhanced"
                    placeholder="Enter event title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-calendar3" /> Event Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-enhanced"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    disabled={submitting}
                    min={effectiveMinDate}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-clock" /> Start Time
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-enhanced"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-clock-fill" /> End Time
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-enhanced"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-geo-alt" /> Location
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-enhanced"
                    placeholder="Enter event location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-diagram-3" /> Program
                  </label>
                  <select
                    className="form-control form-control-enhanced"
                    value={programId ?? ""}
                    onChange={(e) =>
                      setProgramId(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    disabled={submitting}>
                    <option value="">All Programs</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-enhanced mb-0">
                <label className="form-label-enhanced">
                  <i className="bi bi-text-paragraph" /> Description
                </label>
                <textarea
                  className="form-control form-control-enhanced"
                  placeholder="Describe your event"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="modal-footer modal-footer-enhanced">
              <button
                type="button"
                className="btn btn-secondary btn-secondary-enhanced"
                onClick={onClose}
                disabled={submitting}>
                <i className="bi bi-x-circle me-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-primary-enhanced"
                disabled={submitting}>
                {submitting ?
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    {initialData ? "Updating..." : "Saving..."}
                  </>
                : <>
                    <i
                      className={`bi ${initialData ? "bi-save" : "bi-check-circle"} me-2`}
                    />
                    {initialData ? "Update Event" : "Save Event"}
                  </>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
