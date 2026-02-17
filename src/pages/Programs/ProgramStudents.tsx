import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useProgramStudents } from "../../hooks/useProgramStudents";
import { useEnrollFingerprint } from "../../hooks/useEnrollFingerprint";
import EnrollmentModal from "../../components/EnrollmentModal/EnrollmentModal";
import DeleteFingerprintModal from "../../components/DeleteFingerprintModal/DeleteFingerprintModal";
import RecognitionModal from "../../components/RecognitionModal/RecognitionModal";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";
import { useState, useEffect } from "react";
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
}

type FingerprintStatus = "not_enrolled" | "pending" | "enrolled" | "failed";

const API_BASE_URL = "http://192.168.1.99:8000";

const FingerprintStatusBadge = ({ status }: { status: FingerprintStatus }) => {
  const statusMap: Record<
    FingerprintStatus,
    { label: string; className: string }
  > = {
    not_enrolled: { label: "Not Enrolled", className: "status-not" },
    pending: { label: "Pending", className: "status-pending" },
    enrolled: { label: "Enrolled", className: "status-enrolled" },
    failed: { label: "Failed", className: "status-failed" },
  };

  const safeStatus = status || "not_enrolled";
  const statusInfo =
    statusMap[safeStatus as FingerprintStatus] || statusMap.not_enrolled;
  const { label, className } = statusInfo;

  return (
    <span className={`fingerprint_status ${className}`}>
      <i className="bi bi-fingerprint"></i>
      {label}
    </span>
  );
};

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
  const [currentStudent, setCurrentStudent] = useState<any>(null);

  const [unenrollingStudentId, setUnenrollingStudentId] = useState<
    number | null
  >(null);

  const { enrollFingerprint, isLoading } = useEnrollFingerprint();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const fadeElements = document.querySelectorAll(".fade-up");
    fadeElements.forEach((el) => observer.observe(el));

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
        console.error("No data returned from enrollFingerprint");
        setAlertMessage("Failed to start enrollment. Please try again.");
        setShowErrorAlert(true);
        return;
      }

      if (!data.finger_id) {
        console.error("No finger_id in response:", data);
        setAlertMessage("Invalid enrollment response. Please try again.");
        setShowErrorAlert(true);
        return;
      }

      setSelectedStudentId(studentId);
      setSelectedFingerId(data.finger_id);
      setShowEnrollmentModal(true);
    } catch (err: any) {
      console.error("Enrollment error:", err);
      const errorMessage =
        err.response?.data?.detail || err.message || "Unknown error";
      setAlertMessage(`Failed to start enrollment: ${errorMessage}`);
      setShowErrorAlert(true);
    }
  };

  const handleRecognizeClick = (student) => {
    setCurrentStudent(student);
    setRecognitionModalOpen(true);
  };

  const handleRecognitionResult = (studentId: number, success: boolean) => {
    setAlertMessage(
      success ? "Fingerprint recognized!" : "Recognition failed.",
    );
    if (success) setShowSuccessAlert(true);
    else setShowErrorAlert(true);
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
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        },
      );

      if (response.status === 200) {
        setStudents((prev: Student[]) =>
          prev.map((s) =>
            s.id === selectedStudentId ?
              { ...s, fingerprint_status: "not_enrolled" }
            : s,
          ),
        );
        setAlertMessage("Fingerprint unenrolled successfully!");
        setShowSuccessAlert(true);
      }
    } catch (err: any) {
      console.error("Unenrollment error:", err);

      let errorMessage = "Failed to unenroll fingerprint";
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage =
            err.response.data?.detail || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage =
            "No response from server. Check if backend is running.";
        } else {
          errorMessage = err.message;
        }
      }

      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
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
    setStudents((prev: Student[]) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, fingerprint_status: status } : s,
      ),
    );

    if (status === "enrolled") {
      setAlertMessage("Fingerprint enrolled successfully!");
      setShowSuccessAlert(true);
    } else if (status === "failed") {
      setAlertMessage("Fingerprint enrollment failed. Please try again.");
      setShowErrorAlert(true);
    }
  };

  return (
    <div className="students-layout">
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

      <main className="students-content">
        <header className="students-header fade-up">
          <div className="wave"></div>

          <button
            className="btn-back-header"
            onClick={() => navigate("/programs")}>
            <i className="bi bi-arrow-left"></i>
            <span>Back to Programs</span>
          </button>

          <div className="header-content">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-people fs-2"></i>
              <div>
                <h1>{programCode} Students</h1>
                <p>List of enrolled students in {programCode} program</p>
              </div>
            </div>
          </div>
        </header>

        <div className="students-list">
          {loading ?
            <div className="loading-state fade-up">
              <div className="spinner"></div>
              <p>Loading students...</p>
            </div>
          : error ?
            <div className="error-state fade-up">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <p>{error}</p>
            </div>
          : students.length === 0 ?
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>No students enrolled yet</p>
            </div>
          : <>
              <div className="students-controls fade-up">
                <div className="students-header-info">
                  <h2>All Students ({filteredStudents.length})</h2>
                  <p>Total enrolled students in this program</p>
                </div>
                <div className="search-bar">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="clear-search"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search">
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>

              {filteredStudents.length === 0 ?
                <div className="empty-state fade-up">
                  <i className="bi bi-search"></i>
                  <p>No students found matching "{searchQuery}"</p>
                </div>
              : <div className="students-grid">
                  {filteredStudents.map((student: Student, index: number) => (
                    <div
                      key={student.id}
                      className={`student-card fade-up fade-delay-${Math.min((index % 4) + 1, 4)}`}>
                      <div className="student-avatar">
                        <i className="bi bi-person-circle"></i>
                      </div>
                      <div className="student-info">
                        <h3>
                          {student.first_name} {student.last_name}
                        </h3>

                        <FingerprintStatusBadge
                          status={student.fingerprint_status}
                        />

                        <div className="student-details">
                          <span className="detail-item">
                            <i className="bi bi-hash"></i>
                            {student.student_id_no}
                          </span>
                          <span className="detail-item">
                            <i className="bi bi-calendar3"></i>
                            {student.year_level ?? "No year level"}
                          </span>
                        </div>
                      </div>
                      <div className="student-actions">
                        {student.fingerprint_status === "enrolled" ?
                          <>
                            <button
                              className="btn-recognize action-btn mb-2"
                              onClick={() => handleRecognizeClick(student)}
                              title="Test Fingerprint Recognition">
                              <i className="bi bi-search"></i>
                              Recognize
                            </button>

                            <button
                              className="action-btn delete-btn"
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
                            className="btn btn-primary"
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
