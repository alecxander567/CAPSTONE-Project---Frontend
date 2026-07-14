import React, { useState, useEffect } from "react";
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
  onSave: (data: EventData) => void;
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

  // These initializers only run once per mount. Because the parent now
  // passes a `key` tied to initialData (see usage note below), React
  // remounts this component fresh whenever you switch between "add" and
  // "edit <specific event>", so these always start with the right values
  // without needing an effect to reset them.
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

  useEffect(() => {
    axios
      .get<Program[]>(`${import.meta.env.VITE_API_URL}/programs/`)
      .then((res) => setPrograms(res.data))
      .catch(console.error);
  }, []);

  // NOTE: the old "reset form fields from initialData" effect has been
  // removed. That responsibility now lives in the `key` prop the parent
  // passes to this component (see usage note at the bottom of this file).

  useEffect(() => {
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || "",
      event_date: eventDate || "",
      start_time: startTime || "",
      end_time: endTime || "",
      location: location || "",
      program_id: programId,
    });
  };

  if (!visible) return null;

  return (
    <div className={`custom-modal ${active ? "active" : ""}`} onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content modal-content-enhanced">
          {/* Header */}
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
            />
          </div>

          {/* Form */}
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-body modal-body-enhanced">
              {/* Row 1: Title + Date */}
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
                    required
                  />
                </div>
              </div>

              {/* Row 2: Start Time + End Time */}
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
                    required
                  />
                </div>
              </div>

              {/* Row 3: Location + Program */}
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
                    }>
                    <option value="">All Programs</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Description — full width */}
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
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer modal-footer-enhanced">
              <button
                type="button"
                className="btn btn-secondary btn-secondary-enhanced"
                onClick={onClose}>
                <i className="bi bi-x-circle me-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-primary-enhanced">
                <i
                  className={`bi ${initialData ? "bi-save" : "bi-check-circle"} me-2`}
                />
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

/*
USAGE NOTE — required change in the parent component:

Give the modal a `key` derived from which record it's editing (or "new"
when adding). This tells React to treat "editing event 5" and "editing
event 8" (or "adding a new event") as different component instances, so
it unmounts/remounts and re-runs the useState initializers with fresh
values — replacing the old effect-based reset:

  <AddEventModal
    key={initialData?.id ?? "new"}
    show={show}
    onClose={onClose}
    onSave={onSave}
    initialData={initialData}
  />

Without this key, switching between editing different events (or from
edit back to add) will keep showing stale field values, since there's no
longer an effect syncing state from props.
*/