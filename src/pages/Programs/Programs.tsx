import Sidebar from "../../components/Sidebar/Sidebar";
import AddProgramModal from "../../components/AddProgramModal/AddProgramModal";
import DeleteProgramModal from "../../components/DeleteProgramModal/DeleteProgramModal";
import "./Programs.css";
import { usePrograms, useDeleteProgram } from "../../hooks/useProgram";
import type { ProgramData } from "../../hooks/useProgram";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";

const Programs = () => {
  const { programs, loading, error } = usePrograms();
  const { deleteProgram } = useDeleteProgram();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [programList, setProgramList] = useState<ProgramData[]>([]);

  const [editTarget, setEditTarget] = useState<ProgramData | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ProgramData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [programList, loading]);

  useEffect(() => {
    setProgramList(programs.filter((p) => p.code !== "OSA"));
  }, [programs]);

  const handleProgramAdded = (newProgram: ProgramData) => {
    setProgramList((prev) => [
      ...prev,
      { ...newProgram, students: 0, studentList: [] },
    ]);
  };

  const handleProgramEdited = (updated: ProgramData) => {
    setProgramList((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteProgram(deleteTarget.id);
      setProgramList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setAlertMessage("Program deleted successfully!");
      setShowSuccess(true);
    } catch (err: any) {
      setAlertMessage(
        err?.response?.data?.detail ?? "Failed to delete program.",
      );
      setShowError(true);
    }
  };

  return (
    <div className="programs-layout">
      <Sidebar />

      <SuccessAlert
        show={showSuccess}
        message={alertMessage}
        onClose={() => setShowSuccess(false)}
      />
      <ErrorAlert
        show={showError}
        message={alertMessage}
        onClose={() => setShowError(false)}
      />

      <main className="programs-content">
        {/* Header */}
        <header className="programs-header">
          <div className="wave"></div>
          <div className="header-content fade-up">
            <div className="header-icon">
              <i className="bi bi-building"></i>
            </div>
            <div className="header-text">
              <h1>College Departments</h1>
              <p>Explore our academic programs and student communities</p>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-container">
          {["Departments", "Total Students", "Active Programs"].map(
            (label, i) => (
              <div key={i} className={`stat-card fade-up fade-delay-${i + 1}`}>
                <i
                  className={`bi stat-icon ${["bi-mortarboard-fill", "bi-people-fill", "bi-graph-up-arrow"][i]}`}></i>
                <div className="stat-info">
                  <h3>
                    {i === 0 ?
                      programList.length
                    : i === 1 ?
                      programList.reduce((acc, p) => acc + (p.students ?? 0), 0)
                    : "Active"}
                  </h3>
                  <p>{label}</p>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Program List */}
        <div className="programs-section">
          <div className="section-header fade-up">
            <div className="section-header-row">
              <div>
                <h2>
                  <i className="bi bi-building me-2 text-primary"></i>All
                  Departments
                </h2>
                <p>Click on any department to view enrolled students</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditTarget(null);
                  setShowAddModal(true);
                }}>
                <i className="bi bi-plus-lg me-2"></i>Add Program
              </button>
            </div>
          </div>

          <div className="programs-list">
            {!loading &&
              !error &&
              programList.map((program) => (
                <div key={program.code} className="program-card fade-up">
                  {/* Clickable area */}
                  <div
                    className="program-card-clickable"
                    onClick={() =>
                      navigate(`/programs/${program.code}/students`)
                    }>
                    <div className="program-icon-wrapper">
                      <i className="bi bi-mortarboard-fill"></i>
                    </div>
                    <div className="program-details">
                      <h3>{program.name}</h3>
                      <div className="program-meta">
                        <span className="program-code">{program.code}</span>
                        <span className="program-students">
                          <i className="bi bi-people-fill"></i>
                          {program.students ?? 0} Students
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons — bottom right */}
                  <div
                    className="program-actions"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-program-action btn-program-edit"
                      onClick={() => {
                        setEditTarget(program);
                        setShowAddModal(true);
                      }}>
                      <i className="bi bi-pencil-fill me-1"></i>Edit
                    </button>
                    <button
                      className="btn-program-action btn-program-delete"
                      onClick={() => {
                        setDeleteTarget(program);
                        setShowDeleteModal(true);
                      }}>
                      <i className="bi bi-trash-fill me-1"></i>Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Add / Edit Modal */}
        <AddProgramModal
          show={showAddModal}
          handleClose={() => {
            setShowAddModal(false);
            setEditTarget(null);
          }}
          onProgramAdded={handleProgramAdded}
          editProgram={editTarget}
          onProgramEdited={handleProgramEdited}
        />

        {/* Delete Modal */}
        <DeleteProgramModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          programName={deleteTarget?.name ?? ""}
        />
      </main>
    </div>
  );
};

export default Programs;
