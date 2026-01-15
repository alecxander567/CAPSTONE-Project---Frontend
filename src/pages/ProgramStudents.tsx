import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useProgramStudents } from "../hooks/useProgramStudents";
import { useState } from "react";
import "./Programs/Students.css";

interface Student {
  id: number;
  student_id_no: string;
  first_name: string;
  last_name: string;
  program: string;
  email: string;
}

const ProgramStudents = () => {
  const { programCode } = useParams();
  const navigate = useNavigate();
  const { students, loading, error } = useProgramStudents(programCode || "");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter((student: Student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.student_id_no.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const handleEnrollFingerprint = (studentId: number) => {
    console.log("Enroll fingerprint for student:", studentId);
  };

  const handleDeleteStudent = (studentId: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      console.log("Delete student:", studentId);
    }
  };

  return (
    <div className="students-layout">
      <Sidebar />

      <main className="students-content fade-up">
        <header className="students-header fade-up">
          <div className="wave"></div>
          <div className="header-content">
            <button
              className="back-button"
              onClick={() => navigate("/programs")}
              aria-label="Back to programs">
              <i className="bi bi-arrow-left"></i>
            </button>
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
          {loading ? (
            <div className="loading-state fade-up">
              <div className="spinner"></div>
              <p>Loading students...</p>
            </div>
          ) : error ? (
            <div className="error-state fade-up">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <p>{error}</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>No students enrolled yet</p>
            </div>
          ) : (
            <>
              <div className="students-controls">
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

              {filteredStudents.length === 0 ? (
                <div className="empty-state fade-up">
                  <i className="bi bi-search"></i>
                  <p>No students found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="students-grid">
                  {filteredStudents.map((student: Student) => (
                    <div key={student.id} className="student-card fade-up">
                      <div className="student-avatar">
                        <i className="bi bi-person-circle"></i>
                      </div>
                      <div className="student-info">
                        <h3>
                          {student.first_name} {student.last_name}
                        </h3>
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
                          className="action-btn enroll-btn"
                          onClick={() => handleEnrollFingerprint(student.id)}
                          title="Enroll Fingerprint">
                          <i className="bi bi-fingerprint"></i>
                          <span>Enroll</span>
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
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgramStudents;
