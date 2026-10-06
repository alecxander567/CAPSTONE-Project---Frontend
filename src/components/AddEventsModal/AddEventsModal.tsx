import React, { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import "./AddEventsModal.css";
import SearchableSelect from "../SearchableSelect/SearchableSelect";
import { useEventTitles } from "../../hooks/useEventTitles";
import { useLocations } from "../../hooks/useLocations";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface EventDayInput {
  day_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
}

export interface EventData {
  title_id: number;
  location_id: number;
  description: string;
  start_date: string;
  end_date: string;
  program_id: number | null;
  days: EventDayInput[];
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
  initialData?: StoredEvent | null;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function daysBetween(startISO: string, endISO: string): string[] {
  if (!startISO || !endISO) return [];
  if (endISO < startISO) return [];
  const out: string[] = [];
  let cur = startISO;
  while (cur <= endISO) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
  }
  return out;
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const AddEventModal: React.FC<AddEventModalProps> = ({
  show,
  onClose,
  onSave,
  initialData = null,
}) => {
  // Anim state
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [titleId, setTitleId] = useState<number | null>(
    initialData?.title_id ?? null,
  );
  const [locationId, setLocationId] = useState<number | null>(
    initialData?.location_id ?? null,
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [programId, setProgramId] = useState<number | null>(
    initialData?.program_id ?? null,
  );
  const [days, setDays] = useState<EventDayInput[]>(initialData?.days || []);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Dropdown data
  const { titles, loading: titlesLoading, createTitle } = useEventTitles();
  const {
    locations,
    loading: locationsLoading,
    createLocation,
  } = useLocations();

  const minDate = useMemo(() => todayLocalISO(), []);

  // Effective min date for edit mode (so past events can still be edited)
  const effectiveMinDate =
    initialData?.start_date && initialData.start_date < minDate ?
      initialData.start_date
    : minDate;

  // ─────────────────────────────────────────────
  // Load programs
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/programs/`)
      .then((res) => res.json())
      .then((data: Program[]) => setPrograms(data))
      .catch(console.error);
  }, []);

  // ─────────────────────────────────────────────
  // Auto-sync days array whenever start/end dates change
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!startDate || !endDate || endDate < startDate) {
      setDays([]);
      return;
    }
    const dates = daysBetween(startDate, endDate);
    setDays((prev) => {
      // Preserve existing times where dates match
      const prevMap = new Map(prev.map((d) => [d.day_date, d]));
      return dates.map((d) => {
        const existing = prevMap.get(d);
        return (
          existing || {
            day_date: d,
            start_time: DEFAULT_START_TIME,
            end_time: DEFAULT_END_TIME,
          }
        );
      });
    });
  }, [startDate, endDate]);

  // ─────────────────────────────────────────────
  // Modal fade in/out
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Day row updater
  // ─────────────────────────────────────────────
  const updateDay = (
    dayDate: string,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    setDays((prev) =>
      prev.map((d) => (d.day_date === dayDate ? { ...d, [field]: value } : d)),
    );
  };

  const applyTimeToAll = (field: "start_time" | "end_time", value: string) => {
    setDays((prev) => prev.map((d) => ({ ...d, [field]: value })));
  };

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    if (!titleId) {
      setFormError("Please select an event title.");
      return;
    }
    if (!locationId) {
      setFormError("Please select a location.");
      return;
    }
    if (!startDate || !endDate) {
      setFormError("Please set both start and end dates.");
      return;
    }
    if (endDate < startDate) {
      setFormError("End date must be on or after start date.");
      return;
    }
    if (startDate < effectiveMinDate) {
      setFormError("Start date cannot be in the past.");
      return;
    }
    if (days.length === 0) {
      setFormError("No days in range.");
      return;
    }
    for (const d of days) {
      if (!d.start_time || !d.end_time) {
        setFormError(`Missing time for ${prettyDate(d.day_date)}.`);
        return;
      }
      if (d.end_time <= d.start_time) {
        setFormError(
          `End time must be after start time on ${prettyDate(d.day_date)}.`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSave({
        title_id: titleId,
        location_id: locationId,
        description: description || "",
        start_date: startDate,
        end_date: endDate,
        program_id: programId,
        days,
      });
    } catch (err) {
      console.error("Failed to save event:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  const titleOptions = titles.map((t) => ({ id: t.id, name: t.name }));
  const locationOptions = locations.map((l) => ({ id: l.id, name: l.name }));

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

              {/* ── Title + Location ── */}
              <div className="form-row-2col">
                <div className="form-group-enhanced">
                  <SearchableSelect
                    label="Event Title"
                    icon="bi-card-heading"
                    options={titleOptions}
                    value={titleId}
                    onChange={setTitleId}
                    placeholder={titlesLoading ? "Loading..." : "Select title"}
                    disabled={submitting || titlesLoading}
                    required
                    onAddNew={async (name) => {
                      try {
                        return await createTitle(name);
                      } catch (err) {
                        console.error(err);
                        setFormError("Failed to add new title.");
                        return null;
                      }
                    }}
                    addNewLabel="Add title"
                  />
                </div>

                <div className="form-group-enhanced">
                  <SearchableSelect
                    label="Location"
                    icon="bi-geo-alt"
                    options={locationOptions}
                    value={locationId}
                    onChange={setLocationId}
                    placeholder={
                      locationsLoading ? "Loading..." : "Select location"
                    }
                    disabled={submitting || locationsLoading}
                    required
                    onAddNew={async (name) => {
                      try {
                        return await createLocation(name);
                      } catch (err) {
                        console.error(err);
                        setFormError("Failed to add new location.");
                        return null;
                      }
                    }}
                    addNewLabel="Add location"
                  />
                </div>
              </div>

              {/* ── Date range ── */}
              <div className="form-row-2col">
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-calendar3" /> Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-enhanced"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={submitting}
                    min={effectiveMinDate}
                    required
                  />
                </div>
                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">
                    <i className="bi bi-calendar-check" /> End Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-enhanced"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={submitting}
                    min={startDate || effectiveMinDate}
                    required
                  />
                </div>
              </div>

              {/* ── Days table ── */}
              {days.length > 0 && (
                <div className="days-editor">
                  <div className="days-editor-header">
                    <label className="form-label-enhanced mb-0">
                      <i className="bi bi-clock-history" /> Daily Time Windows
                      <span className="days-count">
                        {days.length} day{days.length !== 1 ? "s" : ""}
                      </span>
                    </label>
                    <div className="days-quick-apply">
                      <button
                        type="button"
                        className="btn-quick"
                        onClick={() =>
                          applyTimeToAll("start_time", DEFAULT_START_TIME)
                        }
                        disabled={submitting}
                        title="Reset all start times to 08:00">
                        Reset starts
                      </button>
                      <button
                        type="button"
                        className="btn-quick"
                        onClick={() =>
                          applyTimeToAll("end_time", DEFAULT_END_TIME)
                        }
                        disabled={submitting}
                        title="Reset all end times to 17:00">
                        Reset ends
                      </button>
                    </div>
                  </div>

                  <div className="days-list">
                    {days.map((d) => (
                      <div key={d.day_date} className="day-row">
                        <div className="day-label">
                          <i className="bi bi-calendar-event me-2" />
                          {prettyDate(d.day_date)}
                        </div>
                        <div className="day-time-inputs">
                          <input
                            type="time"
                            className="form-control form-control-enhanced day-time"
                            value={d.start_time}
                            onChange={(e) =>
                              updateDay(
                                d.day_date,
                                "start_time",
                                e.target.value,
                              )
                            }
                            disabled={submitting}
                            required
                          />
                          <span className="day-time-sep">to</span>
                          <input
                            type="time"
                            className="form-control form-control-enhanced day-time"
                            value={d.end_time}
                            onChange={(e) =>
                              updateDay(d.day_date, "end_time", e.target.value)
                            }
                            disabled={submitting}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Program + Description ── */}
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
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
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
