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
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const filteredStudents = students.filter((student: Student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.student_id_no.toLowerCase().includes(query)
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
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Unknown error";
      showAlert(`Failed to start enrollment: ${errorMessage}`, false);
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
    setUnenrollingStudentId(selectedStudentId);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/fingerprints/unenroll-fingerprint/${selectedStudentId}`,
        {},
        { headers: { "Content-Type": "application/json" }, timeout: 10000 },
      );
      if (response.status === 200) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudentId ?
              { ...s, fingerprint_status: "not_enrolled" }
            : s,
          ),
        );
        showAlert("Fingerprint unenrolled successfully!", true);
      }
    } catch (err: any) {
      let errorMessage = "Failed to unenroll fingerprint";
      if (axios.isAxiosError(err)) {
        if (err.response)
          errorMessage =
            err.response.data?.detail || `Server error: ${err.response.status}`;
        else if (err.request)
          errorMessage =
            "No response from server. Check if backend is running.";
        else errorMessage = err.message;
      }
      showAlert(errorMessage, false);
    } finally {
      setUnenrollingStudentId(null);
      setSelectedStudentId(null);
      setSelectedStudentName("");
    }
  };

  useEffect(() => {
    setStudents(fetchedStudents);
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

          {/* Back button — icon only on mobile via CSS */}
          <button
            className="students-pg-btn-back"
            onClick={() => navigate("/programs")}>
            <i className="bi bi-arrow-left"></i>
            <span className="btn-back-label">Back to Programs</span>
          </button>

          <div className="students-pg-header-content">
            <div className="d-flex align-items-center gap-3">
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
                    placeholder="Search by name, ID, or email..."
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
