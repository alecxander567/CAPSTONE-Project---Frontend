import Sidebar from "../../components/Sidebar/Sidebar";
import { useEffect, useState } from "react";
import { usePrograms } from "../../hooks/useProgram";
import { useEvents } from "../../hooks/useEvents";
import { useDeviceStatus } from "../../hooks/useDeviceStatus";
import { useAttendancePerEvent } from "../../hooks/useAttendancePerEvent";
import { useAttendancePerProgram } from "../../hooks/useAttendancePerProgram";
import { useStudentsPerProgram } from "../../hooks/useStudentsPerProgram";
import { requestDeviceToken, listenMessages } from "../../firebase";
import { useAllStudentsAttendance } from "../../hooks/useAllStudentAttendance";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

function Dashboard() {
  const [studentSearch, setStudentSearch] = useState("");
  const [absenceFilter, setAbsenceFilter] = useState<
    "all" | "atrisk" | "perfect"
  >("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [lineChartYear, setLineChartYear] = useState<string>("all");

  const {
    programs,
    loading: programsLoading,
    error: programsError,
  } = usePrograms();
  const { events, totalEvents } = useEvents();
  const { connected } = useDeviceStatus();
  const { data: eventAttendanceData } = useAttendancePerEvent(lineChartYear);
  const { data: studentsPerProgramData } = useStudentsPerProgram();
  const { data: programAttendanceData, loading: programAttendanceLoading } =
    useAttendancePerProgram();
  const { data: allStudents, loading: allStudentsLoading } =
    useAllStudentsAttendance();

  const programColors = [
    "#0d6efd",
    "#6f42c1",
    "#d63384",
    "#fd7e14",
    "#20c997",
    "#ffc107",
    "#dc3545",
    "#198754",
  ];

  const totalPrograms = programs.length;
  const totalStudents = programs.reduce((sum, prog) => sum + prog.students, 0);

  const availableYears = Array.from(
    new Set(events.map((e) => new Date(e.event_date).getFullYear())),
  ).sort((a, b) => b - a);

  const uniquePrograms = Array.from(
    new Set(allStudents.map((s) => s.program_code)),
  ).sort();

  const filteredStudents = allStudents.filter((s) => {
    const name =
      `${s.first_name} ${s.last_name} ${s.student_id_no}`.toLowerCase();
    const matchesSearch =
      !studentSearch || name.includes(studentSearch.toLowerCase());
    const matchesAbsence =
      absenceFilter === "all" ? true
      : absenceFilter === "atrisk" ? s.absences >= 3
      : s.absences === 0;
    const matchesProgram =
      programFilter === "all" || s.program_code === programFilter;
    return matchesSearch && matchesAbsence && matchesProgram;
  });

  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const calendarDays = [];

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const hasEvent = events.some((event) =>
        event.event_date.startsWith(dateStr),
      );
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isToday: day === today.getDate(),
        hasEvent,
      });
    }
    const remainingDays = 35 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
      });
    }
    return calendarDays;
  };

  const getCurrentMonthYear = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handlePrintAnalytics = () => {
    window.print();
  };

  const calendarDays = generateCalendar();

  useEffect(() => {
    const setupNotifications = async () => {
      const token = await requestDeviceToken();
      if (token) {
        const authToken = localStorage.getItem("token");
        await fetch(
          `${import.meta.env.VITE_API_URL}/notifications/save-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token }),
          },
        );
      }
    };
    setupNotifications();
    listenMessages((payload) => {
      alert(`Notification: ${payload.notification.title}`);
    });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div className="wave"></div>
          <div className="dashboard-header-content fade-up">
            <div className="dashboard-header-icon">
              <i className="bi bi-speedometer2"></i>
            </div>
            <div className="dashboard-header-text">
              <h1>Dashboard</h1>
              <p>Analytics overview and attendance insights</p>
            </div>
          </div>
        </header>

        <div className="dashboard-content" id="print-analytics">
          {/* Print Header */}
          <div className="print-header">
            <h2>ARA Biometric Attendance System</h2>
            <h4>Analytics Report</h4>
            <p>
              Printed on:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <hr />
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card fade-up delay-1">
              <div className="stat-icon bg-primary">
                <i className="bi bi-diagram-3-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Programs</h4>
                <span>{totalPrograms}</span>
              </div>
            </div>
            <div className="stat-card fade-up delay-2">
              <div className="stat-icon bg-success">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Total Students</h4>
                <span>{totalStudents}</span>
              </div>
            </div>
            <div className="stat-card fade-up delay-3">
              <div className="stat-icon bg-warning">
                <i className="bi bi-calendar-event-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Total Events</h4>
                <span>{totalEvents}</span>
              </div>
            </div>
            <div className="stat-card fade-up delay-4">
              <div className="stat-icon bg-info">
                <i className="bi bi-usb-symbol"></i>
              </div>
              <div className="stat-info">
                <h4>ESP32 Connection</h4>
                <span className={`status ${connected ? "online" : "offline"}`}>
                  {connected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Student Attendance Table ── */}
          <div
            className="lower-card fade-up delay-5"
            style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}>
              <h4 className="card-title" style={{ margin: 0 }}>
                <i className="bi bi-people-fill text-primary me-2"></i>
                Student Attendance Summary
              </h4>
              <span
                style={{
                  background: "#e8f0fe",
                  color: "#0d6efd",
                  borderRadius: "20px",
                  padding: "2px 12px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}>
                {allStudentsLoading ?
                  "—"
                : `${filteredStudents.length} / ${allStudents.length} students`}
              </span>
            </div>

            {/* Filters Row */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}>
              <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                <i
                  className="bi bi-search"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{
                    width: "100%",
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    padding: "0 10px 0 30px",
                    fontSize: "0.85rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  padding: "0 10px",
                  fontSize: "0.85rem",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: 150,
                }}>
                <option value="all">All Programs</option>
                {uniquePrograms.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <select
                value={absenceFilter}
                onChange={(e) =>
                  setAbsenceFilter(e.target.value as typeof absenceFilter)
                }
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  padding: "0 10px",
                  fontSize: "0.85rem",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: 140,
                }}>
                <option value="all">All Students</option>
                <option value="atrisk">At-Risk (3+ absences)</option>
                <option value="perfect">Perfect Attendance</option>
              </select>
            </div>

            {/* Table */}
            {allStudentsLoading ?
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                />
                <p className="mt-2 text-muted small">Loading students...</p>
              </div>
            : <div
                style={{
                  overflowY: "auto",
                  maxHeight: 420,
                  borderRadius: 10,
                  border: "1px solid #f1f5f9",
                }}>
                <table
                  style={{
                    width: "100%",
                    fontSize: "0.85rem",
                    borderCollapse: "collapse",
                  }}>
                  <thead>
                    <tr
                      style={{
                        background: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0",
                        color: "#475569",
                        textTransform: "uppercase",
                        fontSize: "0.72rem",
                        letterSpacing: "0.04em",
                      }}>
                      {[
                        "#",
                        "Student",
                        "Program",
                        "Year Level",
                        "Present",
                        "Absences",
                        "Attendance Rate",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 14px",
                            textAlign:
                              h === "Student" || h === "Program" || h === "#" ?
                                "left"
                              : "center",
                            position: "sticky",
                            top: 0,
                            background: "#f8fafc",
                            zIndex: 1,
                          }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ?
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            textAlign: "center",
                            padding: "2.5rem",
                            color: "#94a3b8",
                          }}>
                          <i
                            className="bi bi-search"
                            style={{
                              fontSize: "1.5rem",
                              display: "block",
                              marginBottom: "0.5rem",
                              opacity: 0.4,
                            }}
                          />
                          No students match your filters.
                        </td>
                      </tr>
                    : filteredStudents.map((s, idx) => {
                        const rate =
                          s.total_events > 0 ?
                            Math.round((s.present / s.total_events) * 100)
                          : 0;
                        const rateColor =
                          rate === 100 ? "#198754"
                          : rate >= 75 ? "#0d6efd"
                          : rate >= 50 ? "#856404"
                          : "#dc3545";
                        const absenceBg =
                          s.absences === 0 ? "#e8f5e9"
                          : s.absences >= 5 ? "#fde8e8"
                          : s.absences >= 3 ? "#fff3cd"
                          : "#f1f5f9";
                        const absenceColor =
                          s.absences === 0 ? "#198754"
                          : s.absences >= 5 ? "#dc3545"
                          : s.absences >= 3 ? "#856404"
                          : "#64748b";

                        return (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              background: idx % 2 === 0 ? "#fff" : "#fafafa",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLTableRowElement
                              ).style.background = "#f0f4ff";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLTableRowElement
                              ).style.background =
                                idx % 2 === 0 ? "#fff" : "#fafafa";
                            }}>
                            <td
                              style={{
                                padding: "10px 14px",
                                color: "#94a3b8",
                                fontSize: "0.8rem",
                              }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}>
                                <div
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    background: "#c7d2fe",
                                    color: "#3730a3",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "0.8rem",
                                    flexShrink: 0,
                                  }}>
                                  {s.first_name.charAt(0)}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      color: "#1e293b",
                                    }}>
                                    {s.last_name}, {s.first_name}
                                  </div>
                                  <div
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "0.75rem",
                                    }}>
                                    {s.student_id_no}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span
                                style={{
                                  background: "#e8f0fe",
                                  color: "#0d6efd",
                                  borderRadius: 6,
                                  padding: "2px 8px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}>
                                {s.program_code}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "10px 14px",
                                textAlign: "center",
                              }}>
                              <span
                                style={{
                                  color: "#64748b",
                                  fontSize: "0.82rem",
                                }}>
                                {s.year_level ?? "—"}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "10px 14px",
                                textAlign: "center",
                                fontWeight: 600,
                                color: "#198754",
                              }}>
                              {s.present}/{s.total_events}
                            </td>
                            <td
                              style={{
                                padding: "10px 14px",
                                textAlign: "center",
                              }}>
                              <span
                                style={{
                                  background: absenceBg,
                                  color: absenceColor,
                                  borderRadius: 6,
                                  padding: "3px 10px",
                                  fontWeight: 700,
                                  fontSize: "0.82rem",
                                }}>
                                {s.absences}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "10px 14px",
                                textAlign: "center",
                              }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  justifyContent: "center",
                                }}>
                                <div
                                  style={{
                                    flex: 1,
                                    maxWidth: 80,
                                    height: 6,
                                    background: "#e2e8f0",
                                    borderRadius: 99,
                                    overflow: "hidden",
                                  }}>
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${rate}%`,
                                      background: rateColor,
                                      borderRadius: 99,
                                      transition: "width 0.3s",
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: rateColor,
                                    fontSize: "0.82rem",
                                    minWidth: 36,
                                  }}>
                                  {rate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          {/* ── Charts Row ── */}
          <div className="charts-row">
            {/* Bar Chart: Student Population per Program */}
            <div className="analytics-chart fade-up delay-5">
              <h3 className="chart-title">
                <i className="bi bi-people-fill"></i> Student Population per
                Program
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={studentsPerProgramData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    barSize={40}>
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop offset="0%" stopColor="#4d94ff" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#0a58ca"
                          stopOpacity={0.85}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e8e8e8"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="program"
                      tick={{ fontSize: 11, fill: "#666", fontWeight: 500 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#666" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(13, 110, 253, 0.05)" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                      formatter={(value) => [value, "Students"]}
                    />
                    <Bar
                      dataKey="students"
                      fill="url(#barGradient)"
                      name="Students"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart: Attendance Graph Per Event with Year Filter */}
            <div className="analytics-chart fade-up delay-5">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}>
                <h3 className="chart-title" style={{ margin: 0 }}>
                  <i className="bi bi-graph-up-arrow"></i> Attendance Graph Per
                  Event
                </h3>
                <select
                  value={lineChartYear}
                  onChange={(e) => setLineChartYear(e.target.value)}
                  style={{
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    padding: "0 10px",
                    fontSize: "0.82rem",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}>
                  <option value="all">All Years</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={eventAttendanceData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="#0dcaf0"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0dcaf0"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="event"
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#0dcaf0"
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* end charts-row */}

          {/* ── Lower Grid ── */}
          <div className="dashboard-lower-grid">
            {/* Program Participation Card */}
            <div className="lower-card fade-up delay-6">
              <h4 className="card-title">
                <i className="bi bi-pie-chart-fill text-primary me-2"></i>
                Program Participation
              </h4>

              {programsLoading ?
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  />
                  <p className="mt-2 text-muted small">Loading programs...</p>
                </div>
              : programsError ?
                <div className="alert alert-danger small" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {programsError}
                </div>
              : <>
                  <div className="recent-event-info mb-3">
                    <h6 className="text-muted small mb-2">RECENT EVENT</h6>
                    {events.length === 0 ?
                      <p className="text-muted small">No events found</p>
                    : <div className="event-info-compact">
                        <p
                          className="mb-1 fw-bold"
                          style={{ fontSize: "0.95rem" }}>
                          {events[events.length - 1]?.title}
                        </p>
                        <p className="mb-0 text-muted small">
                          <i className="bi bi-calendar-check me-1"></i>
                          {new Date(
                            events[events.length - 1]?.event_date,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {" • "}
                          {events[events.length - 1]?.start_time} -{" "}
                          {events[events.length - 1]?.end_time}
                        </p>
                      </div>
                    }
                  </div>

                  <div
                    className="participation-chart"
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}>
                    <h6 className="text-muted small mb-3">
                      PARTICIPATION OVERVIEW
                    </h6>
                    {programAttendanceLoading ?
                      <div className="text-center py-2">
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                      </div>
                    : <div
                        className="progress-bars"
                        style={{ flex: 1, justifyContent: "space-between" }}>
                        {programAttendanceData
                          .filter(
                            (prog) =>
                              !prog.program.toLowerCase().includes("osa"),
                          )
                          .map((prog, idx) => {
                            const percent = prog.percentage ?? 0;
                            const color =
                              programColors[idx % programColors.length];
                            return (
                              <div key={idx} className="progress-item">
                                <div className="progress-header">
                                  <span className="program-name">
                                    {prog.program}
                                    <span className="text-muted small ms-2">
                                      ({prog.present}/{prog.total_students})
                                    </span>
                                  </span>
                                  <span
                                    className="program-percent"
                                    style={{ color }}>
                                    {percent}%
                                  </span>
                                </div>
                                <div className="progress-bar-bg">
                                  <div
                                    className="progress-bar-fill"
                                    style={{
                                      width: `${percent}%`,
                                      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                      boxShadow: `0 2px 8px ${color}40`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    }
                  </div>
                </>
              }
            </div>

            {/* Right column: calendar + print button */}
            <div
              className="fade-up delay-6"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Calendar Card */}
              <div className="lower-card" style={{ flex: "0 0 auto" }}>
                <h4 className="card-title">
                  <i className="bi bi-calendar3 text-primary me-2"></i>
                  Calendar
                </h4>
                <div className="calendar-view">
                  <div className="calendar-header">
                    <div className="calendar-month">
                      {getCurrentMonthYear()}
                    </div>
                  </div>
                  <div className="calendar-grid">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (d) => (
                        <div key={d} className="calendar-weekday">
                          {d}
                        </div>
                      ),
                    )}
                    {calendarDays.map((dayInfo, idx) => (
                      <div
                        key={idx}
                        className={`calendar-day ${!dayInfo.isCurrentMonth ? "other-month" : ""} ${dayInfo.isToday ? "today" : ""} ${dayInfo.hasEvent ? "has-event" : ""}`}>
                        {dayInfo.day}
                      </div>
                    ))}
                  </div>
                  <div className="calendar-footer mt-3">
                    <div className="calendar-legend">
                      <span className="legend-item">
                        <span className="legend-dot today-dot"></span>Today
                      </span>
                      <span className="legend-item">
                        <span className="legend-dot event-dot"></span>Event
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Print Analytics Button */}
              <button
                className="btn btn-print-analytics w-100"
                style={{ flex: "0 0 auto" }}
                onClick={handlePrintAnalytics}>
                <i className="bi bi-printer-fill me-2"></i>
                Print Analytics
              </button>
            </div>
          </div>
          {/* end dashboard-lower-grid */}
        </div>
        {/* end dashboard-content */}
      </main>
    </div>
  );
}

export default Dashboard;
