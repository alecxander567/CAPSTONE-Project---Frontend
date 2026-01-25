import Sidebar from "../../components/Sidebar/Sidebar";
import "./Programs.css";
import { usePrograms } from "../../hooks/useProgram";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Programs = () => {
  const { programs, loading, error } = usePrograms();
  const navigate = useNavigate();

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
  }, [programs, loading]);

  return (
    <div className="programs-layout">
      <Sidebar />

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
                  className={`bi stat-icon ${
                    [
                      "bi-mortarboard-fill",
                      "bi-people-fill",
                      "bi-graph-up-arrow",
                    ][i]
                  }`}></i>
                <div className="stat-info">
                  <h3>
                    {i === 0 ?
                      programs.length
                    : i === 1 ?
                      programs.reduce((acc, p) => acc + p.students, 0)
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
            <h2>
              {" "}
              <i className="bi bi-building me-2 text-primary"></i>All
              Departments
            </h2>
            <p>Click on any department to view enrolled students</p>
          </div>

          <div className="programs-list">
            {!loading &&
              !error &&
              programs.map((program, index) => (
                <div
                  key={program.code}
                  className="program-card fade-up"
                  onClick={() =>
                    navigate(`/programs/${program.code}/students`)
                  }>
                  <div className="program-icon-wrapper">
                    <i className="bi bi-mortarboard-fill"></i>{" "}
                  </div>
                  <div className="program-details">
                    <h3>{program.name}</h3>
                    <div className="program-meta">
                      <span className="program-code">{program.code}</span>
                      <span className="program-students">
                        <i className="bi bi-people-fill"></i>
                        {program.students} Students
                      </span>
                    </div>
                  </div>
                  <div className="program-arrow">
                    <i className="bi bi-chevron-right"></i>{" "}
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
