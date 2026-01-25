import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useProgramStudents } from "../../hooks/useProgramStudents";
import { useEnrollFingerprint } from "../../hooks/useEnrollFingerprint";
import EnrollmentModal from "../../components/EnrollmentModal/EnrollmentModal";
import { useState, useEffect } from "react";
import "./Students.css";

interface Student {
  id: number;
  student_id_no: string;
  first_name: string;
  last_name: string;
  program: string;
  email: string;
  fingerprint_status: "not_enrolled" | "pending" | "enrolled" | "failed";
}

type FingerprintStatus = "not_enrolled" | "pending" | "enrolled" | "failed";

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

  const { label, className } = statusMap[status];

  return (
    <span className={`fingerprint-status ${className}`}>
      <i className="bi bi-fingerprint"></i>
      {label}
    </span>
  );
};

const ProgramStudents = () => {
  const { programCode } = useParams();
  const navigate = useNavigate();
  const { students, loading, error } = useProgramStudents(programCode || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  const {
    enrollFingerprint,
    isLoading,
    error: enrollError,
  } = useEnrollFingerprint();

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
      student.student_id_no.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const handleEnrollClick = async (studentId: number) => {
    try {
      setSelectedStudentId(studentId);
      setShowEnrollmentModal(true);
      await enrollFingerprint(studentId);
    } catch {
      setShowEnrollmentModal(false);
    }
  };

  const handleDeleteStudent = (studentId: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      console.log("Delete student:", studentId);
    }
  };

  return (
    <div className="students-layout">
      <Sidebar />

      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        userId={selectedStudentId || 0}
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
                            <i className="bi bi-envelope"></i>
                            {student.email}
                          </span>
                        </div>
                      </div>
                      <div className="student-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEnrollClick(student.id)}
                          disabled={isLoading}>
                          <i className="bi bi-fingerprint"></i>
                          Enroll
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Delete Student">
                          <i className="bi bi-trash"></i>
                          <span>Delete</span>
                        </button>
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
