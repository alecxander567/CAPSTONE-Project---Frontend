import { useEffect, useState, type FormEvent } from "react";
import type { Student } from "../../hooks/useProgramStudents";
import { useUpdateStudent } from "../../hooks/useUpdateStudent";
import "./EditStudentModal.css";

interface EditStudentModalProps {
  show: boolean;
  student: Student | null;
  onClose: () => void;
  onUpdated: (updated: Partial<Student> & { id: number }) => void;
}

const YEAR_OPTIONS = ["1", "2", "3", "4"];

const normalizeYear = (year: string | null | undefined): string => {
  if (!year) return "";
  const map: Record<string, string> = {
    "1": "1",
    "1st year": "1",
    "1ST YEAR": "1",
    "2": "2",
    "2nd year": "2",
    "2ND YEAR": "2",
    "3": "3",
    "3rd year": "3",
    "3RD YEAR": "3",
    "4": "4",
    "4th year": "4",
    "4TH YEAR": "4",
  };
  return map[year] ?? "";
};

const EditStudentModal = ({
  show,
  student,
  onClose,
  onUpdated,
}: EditStudentModalProps) => {
  const { updateStudent, updating } = useUpdateStudent();
  const [form, setForm] = useState({
    student_id_no: "",
    first_name: "",
    last_name: "",
    middle_initial: "",
    email: "",
    year_level: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    setForm({
      student_id_no: student.student_id_no || "",
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      middle_initial: student.middle_initial || "",
      email: student.email || "",
      year_level: normalizeYear(student.year_level),
    });
    setError(null);
  }, [student]);

  if (!show || !student) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.student_id_no.trim()) {
      setError("Student ID cannot be empty");
      return;
    }
    if (!form.email.trim()) {
      setError("Email cannot be empty");
      return;
    }

    try {
      const updated = await updateStudent(student.id, {
        student_id_no: form.student_id_no.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        middle_initial: form.middle_initial.trim() || undefined,
        email: form.email.trim(),
        year_level: form.year_level || undefined,
      });

      onUpdated({
        id: student.id,
        student_id_no: updated.student_id_no ?? form.student_id_no,
        first_name: updated.first_name ?? form.first_name,
        last_name: updated.last_name ?? form.last_name,
        middle_initial: updated.middle_initial ?? form.middle_initial,
        email: updated.email ?? form.email,
        year_level: updated.year_level ?? student.year_level,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <>
      <div
        className="edit-student-modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true">
        <div
          className="edit-student-modal-dialog"
          onClick={(e) => e.stopPropagation()}>
          <div className="edit-student-modal-content">
            <form onSubmit={handleSubmit} className="edit-student-modal-form">
              {/* ── HEADER (fixed, never shrinks) ── */}
              <div className="edit-student-modal-header">
                <div className="edit-student-modal-title-wrap">
                  <div className="edit-student-modal-icon">
                    <i className="bi bi-pencil-square"></i>
                  </div>
                  <div>
                    <h5 className="edit-student-modal-title">Edit Student</h5>
                    <p className="edit-student-modal-subtitle">
                      Update ID, email, or name
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="edit-student-modal-close"
                  onClick={onClose}
                  aria-label="Close">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {/* ── BODY (only scrollable section) ── */}
              <div className="edit-student-modal-body">
                {error && (
                  <div className="edit-student-modal-error">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{error}</span>
                  </div>
                )}

                <div className="edit-student-modal-warning">
                  <i className="bi bi-info-circle-fill"></i>
                  <span>
                    Changing the <strong>Student ID</strong> changes what this
                    student uses to log in. Changing the <strong>email</strong>{" "}
                    only affects where password-reset links are sent.
                  </span>
                </div>

                <div className="edit-student-modal-field">
                  <label htmlFor="student_id_no">Student ID</label>
                  <input
                    id="student_id_no"
                    name="student_id_no"
                    type="text"
                    value={form.student_id_no}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="edit-student-modal-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="edit-student-modal-row">
                  <div className="edit-student-modal-field">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={form.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="edit-student-modal-field">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="edit-student-modal-row">
                  <div className="edit-student-modal-field">
                    <label htmlFor="middle_initial">Middle Initial</label>
                    <input
                      id="middle_initial"
                      name="middle_initial"
                      type="text"
                      maxLength={5}
                      value={form.middle_initial}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="edit-student-modal-field">
                    <label htmlFor="year_level">Year Level</label>
                    <select
                      id="year_level"
                      name="year_level"
                      value={form.year_level}
                      onChange={handleChange}>
                      <option value="">Select Year</option>
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                          {y === "1" ?
                            "st"
                          : y === "2" ?
                            "nd"
                          : y === "3" ?
                            "rd"
                          : "th"}{" "}
                          Year
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── FOOTER (fixed, never shrinks) ── */}
              <div className="edit-student-modal-footer">
                <button
                  type="button"
                  className="edit-student-modal-btn edit-student-modal-btn-cancel"
                  onClick={onClose}
                  disabled={updating}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-student-modal-btn edit-student-modal-btn-save"
                  disabled={updating}>
                  {updating ?
                    <>
                      <span
                        className="edit-student-modal-spinner"
                        role="status"
                      />
                      Saving...
                    </>
                  : <>
                      <i className="bi bi-check-lg"></i>Save Changes
                    </>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="edit-student-modal-backdrop" onClick={onClose} />
    </>
  );
};

export default EditStudentModal;
