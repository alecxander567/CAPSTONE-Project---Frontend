import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useProgramStudents } from "../../hooks/useProgramStudents";
import { useEnrollFingerprint } from "../../hooks/useEnrollFingerprint";
import EnrollmentModal from "../../components/EnrollmentModal/EnrollmentModal";
import DeleteFingerprintModal from "../../components/DeleteFingerprintModal/DeleteFingerprintModal";
import RecognitionModal from "../../components/RecognitionModal/RecognitionModal";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import "./Students.css";

interface Student {
  id: number;
  student_id_no: string;
  first_name: string;
  last_name: string;
  program: string;
  year_level: string | null;
  fingerprint_status: "not_enrolled" | "pending" | "enrolled" | "failed";
  finger_id: number | null;
  profile_image?: string | null;
}

type FingerprintStatus = "not_enrolled" | "pending" | "enrolled" | "failed";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const DEFAULT_DEVICE_ID = "esp32-default";

const FingerprintStatusBadge = ({ status }: { status: FingerprintStatus }) => {
  const statusMap: Record<
    FingerprintStatus,
    { label: string; className: string }
  > = {
    not_enrolled: {
      label: "Not Enrolled",
      className: "students-pg-status-not",
    },
    pending: { label: "Pending", className: "students-pg-status-pending" },
    enrolled: { label: "Enrolled", className: "students-pg-status-enrolled" },
    failed: { label: "Failed", className: "students-pg-status-failed" },
  };
  const safeStatus = status || "not_enrolled";
  const { label, className } =
    statusMap[safeStatus as FingerprintStatus] || statusMap.not_enrolled;

  return (
    <span className={`students-pg-fingerprint-status ${className}`}>
      <i className="bi bi-fingerprint"></i>
      {label}
    </span>
  );
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

const ProgramStudents = () => {
  const { programCode } = useParams();
  const navigate = useNavigate();
  const {
    students: fetchedStudents,
    loading,
    error,
  } = useProgramStudents(programCode || "");
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [selectedFingerId, setSelectedFingerId] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [recognitionModalOpen, setRecognitionModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [unenrollingStudentId, setUnenrollingStudentId] = useState<
    number | null
  >(null);
  const [clearingPendingId, setClearingPendingId] = useState<number | null>(
    null,
  );

  const { enrollFingerprint, isLoading } = useEnrollFingerprint();
  const isProcessingRecognitionRef = useRef(false);
  const isProcessingEnrollmentRef = useRef(false);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (message: string, isSuccess: boolean) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertMessage(message);
    if (isSuccess) {
      setShowSuccessAlert(true);
      alertTimeoutRef.current = setTimeout(
        () => setShowSuccessAlert(false),
        3000,
      );
    } else {
      setShowErrorAlert(true);
      alertTimeoutRef.current = setTimeout(
        () => setShowErrorAlert(false),
        4000,
      );
    }
  };

  // Normalize string for search (remove accents, trim, lowercase)
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Memoized filtered students with improved search logic
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;

    const normalizedQuery = normalizeString(query);

    return students.filter((student: Student) => {
      const firstName = normalizeString(student.first_name || "");
      const lastName = normalizeString(student.last_name || "");
      const fullName = normalizeString(
        `${student.first_name} ${student.last_name}`,
      );
      const idNo = normalizeString(student.student_id_no || "");

      return (
        firstName.includes(normalizedQuery) ||
        lastName.includes(normalizedQuery) ||
        fullName.includes(normalizedQuery) ||
        idNo.includes(normalizedQuery)
      );
    });
  }, [students, searchQuery]);

  const handleEnrollClick = async (studentId: number) => {
    try {
      const data = await enrollFingerprint(studentId);
      if (!data) {
        showAlert("Failed to start enrollment. Please try again.", false);
        return;
      }
      if (!data.finger_id) {
        showAlert("Invalid enrollment response. Please try again.", false);
        return;
      }
      setSelectedStudentId(studentId);
      setSelectedFingerId(data.finger_id);
      setShowEnrollmentModal(true);
    } catch (err) {
      const message =
        axios.isAxiosError(err) ?
          err.response?.data?.detail || err.message || "Unknown error"
        : "Unknown error";
      showAlert(`Failed to start enrollment: ${message}`, false);
    }
  };

  const handleRecognizeClick = (student: Student) => {
    if (recognitionModalOpen) return;
    setCurrentStudent(student);
    setRecognitionModalOpen(true);
  };

  const handleRecognitionResult = (studentId: number, success: boolean) => {
    if (isProcessingRecognitionRef.current) return;
    isProcessingRecognitionRef.current = true;
    showAlert(
      success ? "Fingerprint recognized!" : "Recognition failed.",
      success,
    );
    setTimeout(() => {
      isProcessingRecognitionRef.current = false;
    }, 1000);
  };

  const handleUnenrollClick = (student: Student) => {
    setSelectedStudentId(student.id);
    setSelectedStudentName(`${student.first_name} ${student.last_name}`);
    setShowDeleteModal(true);
  };

  const handleClearPending = async (student: Student) => {
    setClearingPendingId(student.id);
    try {
      await axios.post(
        `${API_BASE_URL}/fingerprints/reset-enrollment/${student.id}`,
        {},
        { headers: { "Content-Type": "application/json" }, timeout: 10000 },
      );

      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ?
            { ...s, fingerprint_status: "not_enrolled", finger_id: null }
          : s,
        ),
      );
      showAlert(
        `Cleared stuck enrollment for ${student.first_name} ${student.last_name}.`,
        true,
      );
    } catch (err) {
      const message =
        axios.isAxiosError(err) ?
          err.response?.data?.detail || err.message || "Unknown error"
        : "Unknown error";
      showAlert(`Failed to clear pending enrollment: ${message}`, false);
    } finally {
      setClearingPendingId(null);
    }
  };

  const confirmUnenroll = async () => {
    if (!selectedStudentId) return;
    const studentId = selectedStudentId;
    setUnenrollingStudentId(studentId);

    const student = students.find((s) => s.id === studentId);
    const fingerId = student?.finger_id;

    try {
      await axios.post(
        `${API_BASE_URL}/fingerprints/unenroll-fingerprint/${studentId}`,
        {},
        { headers: { "Content-Type": "application/json" }, timeout: 10000 },
      );

      if (!fingerId) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId ?
              { ...s, fingerprint_status: "not_enrolled" }
            : s,
          ),
        );
        showAlert("Fingerprint unenrolled successfully!", true);
        return;
      }

      const POLL_INTERVAL = 500;
      const TIMEOUT = 10000;
      const startTime = Date.now();

      await new Promise<void>((resolve, reject) => {
        const poll = setInterval(async () => {
          if (Date.now() - startTime > TIMEOUT) {
            clearInterval(poll);
            reject(new Error("Delete timed out. Check device connection."));
            return;
          }
          try {
            const res = await axios.get(
              `${API_BASE_URL}/fingerprints/get-status?finger_id=${fingerId}&device_id=${DEFAULT_DEVICE_ID}`,
            );
            const { status, step, message } = res.data;

            const deletedAlready =
              status === "failed" &&
              step === "error" &&
              message === "User not found";

            if (status === "not_enrolled" || deletedAlready) {
              clearInterval(poll);
              resolve();
            }
          } catch {
            // ignore transient network errors, keep polling until timeout
          }
        }, POLL_INTERVAL);
      });

      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, fingerprint_status: "not_enrolled" } : s,
        ),
      );
      showAlert("Fingerprint unenrolled successfully!", true);
    } catch (err) {
      let errorMessage = "Failed to unenroll fingerprint";
      if (axios.isAxiosError(err)) {
        if (err.response)
          errorMessage =
            err.response.data?.detail || `Server error: ${err.response.status}`;
        else if (err.request)
          errorMessage =
            "No response from server. Check if backend is running.";
        else errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showAlert(errorMessage, false);
    } finally {
      setUnenrollingStudentId(null);
      setSelectedStudentId(null);
      setSelectedStudentName("");
    }
  };

  useEffect(() => {
    setStudents(
      fetchedStudents.map((s) => ({
        ...s,
        year_level: s.year_level ?? null,
        finger_id: s.finger_id ?? null,
      })),
    );
  }, [fetchedStudents]);

  const updateStudentStatus = (
    studentId: number,
    status: FingerprintStatus,
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, fingerprint_status: status } : s,
      ),
    );
    if (isProcessingEnrollmentRef.current) return;
    if (status === "enrolled" || status === "failed") {
      isProcessingEnrollmentRef.current = true;
      showAlert(
        status === "enrolled" ?
          "Fingerprint enrolled successfully!"
        : "Fingerprint enrollment failed. Please try again.",
        status === "enrolled",
      );
      setTimeout(() => {
        isProcessingEnrollmentRef.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    setTimeout(() => {
      document
        .querySelectorAll(".students-pg-fade-up:not(.show)")
        .forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [filteredStudents, loading]);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  return (
    <div className="students-pg-layout">
      <Sidebar />

      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        userId={selectedStudentId || 0}
        fingerId={selectedFingerId || 0}
        updateStatus={updateStudentStatus}
      />
      <RecognitionModal
        isOpen={recognitionModalOpen}
        onClose={() => {
          setRecognitionModalOpen(false);
          setCurrentStudent(null);
          setTimeout(() => {
            isProcessingRecognitionRef.current = false;
          }, 100);
        }}
        userId={currentStudent?.id}
        fingerId={currentStudent?.finger_id}
        onRecognized={handleRecognitionResult}
      />
      <DeleteFingerprintModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmUnenroll}
        studentName={selectedStudentName}
      />
      <SuccessAlert
        show={showSuccessAlert}
        message={alertMessage}
        onClose={() => setShowSuccessAlert(false)}
      />
      <ErrorAlert
        show={showErrorAlert}
        message={alertMessage}
        onClose={() => setShowErrorAlert(false)}
      />

      <main className="students-pg-content">
        <header className="students-pg-header students-pg-fade-up">
          <div className="students-pg-wave"></div>

          <button
            className="students-pg-btn-back"
            onClick={() => navigate("/programs")}>
            <i className="bi bi-arrow-left"></i>
            <span className="btn-back-label">Back to Programs</span>
          </button>

          <div className="students-pg-header-content">
            <div className="d-flex flex-column align-items-center justify-content-center gap-2">
              <i className="bi bi-people fs-2"></i>
              <div>
                <h1>{programCode} Students</h1>
                <p>List of enrolled students in {programCode} program</p>
              </div>
            </div>
          </div>
        </header>

        <div className="students-pg-list">
          {loading ?
            <div className="students-pg-loading-state students-pg-fade-up">
              <div className="students-pg-spinner"></div>
              <p>Loading students...</p>
            </div>
          : error ?
            <div className="students-pg-error-state students-pg-fade-up">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <p>{error}</p>
            </div>
          : students.length === 0 ?
            <div className="students-pg-empty-state">
              <i className="bi bi-inbox"></i>
              <p>No students enrolled yet</p>
            </div>
          : <>
              <div className="students-pg-controls students-pg-fade-up">
                <div className="students-pg-header-info">
                  <h2>All Students ({filteredStudents.length})</h2>
                  <p>Total enrolled students in this program</p>
                </div>
                <div className="students-pg-search-bar">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search students"
                  />
                  {searchQuery && (
                    <button
                      className="students-pg-clear-search"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search">
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>

              {filteredStudents.length === 0 ?
                <div className="students-pg-empty-state students-pg-fade-up">
                  <i className="bi bi-search"></i>
                  <p>No students found matching "{searchQuery}"</p>
                </div>
              : <div className="students-pg-grid">
                  {filteredStudents.map((student: Student, index: number) => (
                    <div
                      key={student.id}
                      className={`students-pg-card students-pg-fade-up students-pg-fade-delay-${Math.min((index % 4) + 1, 4)}`}>
                      <div className="students-pg-avatar-wrapper">
                        {student.profile_image ?
                          <img
                            src={
                              student.profile_image.startsWith("http") ?
                                student.profile_image
                              : `${import.meta.env.VITE_API_URL}/${student.profile_image.replace(/^\//, "")}`
                            }
                            alt={`${student.first_name} ${student.last_name}`}
                            className="students-pg-avatar-image"
                          />
                        : <div className="students-pg-avatar-initials">
                            {getInitials(student.first_name, student.last_name)}
                          </div>
                        }
                      </div>

                      <div className="students-pg-info">
                        <h3 className="students-pg-student-name">
                          {student.first_name} {student.last_name}
                        </h3>
                        <FingerprintStatusBadge
                          status={student.fingerprint_status}
                        />
                        <div className="students-pg-details">
                          <span className="students-pg-detail-item">
                            <i className="bi bi-hash"></i>
                            <span className="students-pg-detail-text">
                              {student.student_id_no}
                            </span>
                          </span>
                          <span className="students-pg-detail-item">
                            <i className="bi bi-calendar3"></i>
                            <span className="students-pg-detail-text">
                              {student.year_level ?? "No year level"}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="students-pg-actions">
                        {student.fingerprint_status === "enrolled" ?
                          <>
                            <button
                              className="students-pg-action-btn students-pg-btn-recognize"
                              onClick={() => handleRecognizeClick(student)}
                              title="Test Fingerprint Recognition">
                              <i className="bi bi-search"></i>
                              Recognize
                            </button>
                            <button
                              className="students-pg-action-btn students-pg-delete-btn"
                              onClick={() => handleUnenrollClick(student)}
                              disabled={unenrollingStudentId === student.id}
                              title="Unenroll Fingerprint">
                              <i className="bi bi-fingerprint"></i>
                              <span>
                                {unenrollingStudentId === student.id ?
                                  "Unenrolling..."
                                : "Unenroll"}
                              </span>
                            </button>
                          </>
                        : student.fingerprint_status === "pending" ?
                          <button
                            className="students-pg-action-btn students-pg-delete-btn"
                            onClick={() => handleClearPending(student)}
                            disabled={clearingPendingId === student.id}
                            title="Clear stuck pending enrollment (e.g. after a dropped connection)">
                            <i className="bi bi-x-circle"></i>
                            <span>
                              {clearingPendingId === student.id ?
                                "Clearing..."
                              : "Clear Pending"}
                            </span>
                          </button>
                        : <button
                            className="students-pg-action-btn students-pg-btn-primary"
                            onClick={() => handleEnrollClick(student.id)}
                            disabled={isLoading}>
                            <i className="bi bi-fingerprint"></i>
                            Enroll
                          </button>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              }
            </>
          }
        </div>
      </main>
    </div>
  );
};

export default ProgramStudents;
