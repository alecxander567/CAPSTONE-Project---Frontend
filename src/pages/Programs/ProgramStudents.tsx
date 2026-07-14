import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useProgramStudents } from "../../hooks/useProgramStudents";
import { useEnrollFingerprint } from "../../hooks/useEnrollFingerprint";
import EnrollmentModal from "../../components/EnrollmentModal/EnrollmentModal";
import DeleteFingerprintModal from "../../components/DeleteFingerprintModal/DeleteFingerprintModal";
import RecognitionModal from "../../components/RecognitionModal/RecognitionModal";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";
import { useState, useEffect, useRef } from "react";
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

  const { enrollFingerprint, isLoading } = useEnrollFingerprint();
  const isProcessingRecognitionRef = useRef(false);
  const isProcessingEnrollmentRef = useRef(false);
  // NodeJS.Timeout isn't available in a browser/Vite project (it's a Node
  // type). ReturnType<typeof setTimeout> resolves correctly in both
  // browser and Node typings.
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
    document
      .querySelectorAll(".students-pg-fade-up")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [students, loading]);

  // FIXED: previously this only checked first_name and last_name
  // *separately*, so typing a full name like "Juan Dela Cruz" never
  // matched anything (neither field alone contains the whole string).
  // It also called .toLowerCase() directly on possibly-undefined fields,
  // which throws and can blank out the whole list if any student record
  // is missing a name/ID. Both are fixed below.
  const filteredStudents = students.filter((student: Student) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const firstName = student.first_name?.toLowerCase() ?? "";
    const lastName = student.last_name?.toLowerCase() ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    const idNo = student.student_id_no?.toLowerCase() ?? "";

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      fullName.includes(query) ||
      idNo.includes(query)
    );
  });

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

  const confirmUnenroll = async () => {
    if (!selectedStudentId) return;
    const studentId = selectedStudentId;
    setUnenrollingStudentId(studentId);

    // find the finger_id we need to poll on
    const student = students.find((s) => s.id === studentId);
    const fingerId = student?.finger_id;

    try {
      await axios.post(
        `${API_BASE_URL}/fingerprints/unenroll-fingerprint/${studentId}`,
        {},
        { headers: { "Content-Type": "application/json" }, timeout: 10000 },
      );

      if (!fingerId) {
        // no finger_id to poll on, fall back to old behavior
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

      // poll get-status until the device confirms the delete
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
              `${API_BASE_URL}/fingerprints/get-status?finger_id=${fingerId}`,
            );
            const { status, step, message } = res.data;

            // After delete_success, the backend clears the user's finger_id,
            // so looking them up by the OLD finger_id will start failing
            // with "User not found" — that failure IS the success signal.
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
    // NOTE: `useProgramStudents` returns its own `Student` type that
    // doesn't include `year_level` / `finger_id`, so it doesn't structurally
    // match this file's local `Student` interface. Normalizing here keeps
    // the page working, but the real fix is to have both files import one
    // shared `Student` type (e.g. from a `types/student.ts`) so they can't
    // drift apart like this again.
    setStudents(
      fetchedStudents.map((s) => {
        const partial = s as Partial<Student>;
        return {
          ...s,
          year_level: partial.year_level ?? null,
          finger_id: partial.finger_id ?? null,
        } as Student;
      }),
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
                      <div className="students-pg-avatar">
                        {student.profile_image ?
                          <img
                            src={
                              student.profile_image.startsWith("http") ?
                                student.profile_image
                              : `${import.meta.env.VITE_API_URL}/${student.profile_image.replace(/^\//, "")}`
                            }
                            alt={`${student.first_name} ${student.last_name}`}
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "3px solid #fff",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                          />
                        : <div
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.25rem",
                              fontWeight: "700",
                              color: "#fff",
                              flexShrink: 0,
                            }}>
                            {getInitials(student.first_name, student.last_name)}
                          </div>
                        }
                      </div>

                      <div className="students-pg-info">
                        <h3>
                          {student.first_name} {student.last_name}
                        </h3>
                        <FingerprintStatusBadge
                          status={student.fingerprint_status}
                        />
                        <div className="students-pg-details">
                          <span className="students-pg-detail-item">
                            <i className="bi bi-hash"></i>
                            {student.student_id_no}
                          </span>
                          <span className="students-pg-detail-item">
                            <i className="bi bi-calendar3"></i>
                            {student.year_level ?? "No year level"}
                          </span>
                        </div>
                      </div>

                      <div className="students-pg-actions">
                        {student.fingerprint_status === "enrolled" ?
                          <>
                            <button
                              className="students-pg-action-btn students-pg-btn-recognize mb-2"
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
