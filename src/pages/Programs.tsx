import Sidebar from "../components/Sidebar";
import "./Programs/Programs.css";
import { usePrograms } from "../hooks/useProgram";
import { useNavigate } from "react-router-dom";

const Programs = () => {
  const { programs, loading, error } = usePrograms();
  const navigate = useNavigate(); 

  return (
    <div className="programs-layout">
      <Sidebar />

      <main className="programs-content">
        {/* Header */}
        <header className="programs-header">
          <div className="wave"></div>
          <div className="header-content">
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
          <div className="stat-card">
            <i className="bi bi-mortarboard-fill stat-icon"></i>
            <div className="stat-info">
              <h3>{programs.length}</h3>
              <p>Departments</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="bi bi-people-fill stat-icon"></i>
            <div className="stat-info">
              <h3>{programs.reduce((acc, p) => acc + p.students, 0)}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="bi bi-graph-up-arrow stat-icon"></i>
            <div className="stat-info">
              <h3>Active</h3>
              <p>All Programs</p>
            </div>
          </div>
        </div>

        {/* Program List */}
        <div className="programs-section">
          <div className="section-header">
            <h2>All Departments</h2>
            <p>Click on any department to view enrolled students</p>
          </div>

          <div className="programs-list">
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading departments...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <p>{error}</p>
              </div>
            )}

            {!loading &&
              !error &&
              programs.map((program) => (
                <div
                  key={program.code}
                  className="program-card"
                  onClick={() =>
                    navigate(`/programs/${program.code}/students`)
                  }>
                  <div className="program-icon-wrapper">
                    <i className="bi bi-mortarboard"></i>
                  </div>
                  <div className="program-details">
                    <h3>{program.name}</h3>
                    <div className="program-meta">
                      <span className="program-code">{program.code}</span>
                      <span className="program-students">
                        <i className="bi bi-people"></i>
                        {program.students} Students
                      </span>
                    </div>
                  </div>
                  <div className="program-arrow">
                    <i className="bi bi-arrow-right"></i>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Programs;
