import Sidebar from "../../components/Sidebar/Sidebar";
import { useEffect } from "react";
import { usePrograms } from "../../hooks/useProgram";
import { useEvents } from "../../hooks/useEvents";
import { useDeviceStatus } from "../../hooks/useDeviceStatus";
import { useAttendancePerEvent } from "../../hooks/useAttendancePerEvent";
import { useAttendancePerProgram } from "../../hooks/useAttendancePerProgram";
import { requestDeviceToken, listenMessages } from "../../firebase";
import { useAtRiskStudents } from "../../hooks/useAtRiskStudent";
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
  const {
    programs,
    loading: programsLoading,
    error: programsError,
  } = usePrograms();
  const { events, totalEvents } = useEvents();
  const { connected } = useDeviceStatus();
  const { data: eventAttendanceData, loading: chartLoading } =
    useAttendancePerEvent();
  const { data: programAttendanceData, loading: programAttendanceLoading } =
    useAttendancePerProgram();
  const { data: atRiskStudents, loading: atRiskLoading } = useAtRiskStudents();

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
    const today = new Date();
    return today.toLocaleDateString("en-US", {
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

          {/* Charts Row */}
          <div className="charts-row">
            <div className="analytics-chart fade-up delay-5">
              <h3 className="chart-title">
                <i className="bi bi-bar-chart-fill"></i> Attendance Comparison
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={eventAttendanceData}
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
                      dataKey="event"
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

            <div className="analytics-chart fade-up delay-5">
              <h3 className="chart-title">
                <i className="bi bi-graph-up-arrow"></i> Attendance Graph Per
                Event
              </h3>
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

          {/* Lower Grid */}
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
                        {(() => {
                          const filteredPrograms = programAttendanceData.filter(
                            (prog) =>
                              !prog.program.toLowerCase().includes("osa"),
                          );

                          return filteredPrograms.map((prog, idx) => {
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
                          });
                        })()}
                      </div>
                    }
                  </div>
                </>
              }
            </div>

            {/* Right column: calendar + at-risk + print button stacked */}
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
                    <div className="calendar-weekday">Sun</div>
                    <div className="calendar-weekday">Mon</div>
                    <div className="calendar-weekday">Tue</div>
                    <div className="calendar-weekday">Wed</div>
                    <div className="calendar-weekday">Thu</div>
                    <div className="calendar-weekday">Fri</div>
                    <div className="calendar-weekday">Sat</div>
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
                        <span className="legend-dot today-dot"></span>
                        Today
                      </span>
                      <span className="legend-item">
                        <span className="legend-dot event-dot"></span>
                        Event
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* At-Risk Students Card — flex: 1 + minHeight to stay visible */}
              <div
                className="lower-card"
                style={{ flex: 1, minHeight: "320px" }}>
                <h4
                  className="card-title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                  <span>
                    <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                    Students with 3+ Absences
                  </span>
                  <span
                    style={{
                      background:
                        atRiskStudents.length > 0 ? "#fde8e8" : "#e8f5e9",
                      color: atRiskStudents.length > 0 ? "#dc3545" : "#198754",
                      borderRadius: "20px",
                      padding: "2px 10px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      minWidth: "28px",
                      textAlign: "center",
                    }}>
                    {atRiskLoading ? "—" : atRiskStudents.length}
                  </span>
                </h4>

                {atRiskLoading ?
                  <div className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm text-danger"
                      role="status"
                    />
                    <p className="mt-2 text-muted small">Loading...</p>
                  </div>
                : atRiskStudents.length === 0 ?
                  <div className="text-center py-4 text-muted small">
                    <i className="bi bi-check-circle-fill text-success fs-4 d-block mb-2"></i>
                    No students with 3+ absences
                  </div>
                : <div style={{ overflowY: "auto", maxHeight: "260px" }}>
                    <table
                      style={{
                        width: "100%",
                        fontSize: "0.82rem",
                        borderCollapse: "collapse",
                      }}>
                      <thead
                        style={{
                          position: "sticky",
                          top: 0,
                          background: "#fff",
                        }}>
                        <tr
                          style={{
                            borderBottom: "2px solid #f0f0f0",
                            color: "#888",
                            textTransform: "uppercase",
                            fontSize: "0.72rem",
                          }}>
                          <th style={{ padding: "6px 8px", textAlign: "left" }}>
                            Student
                          </th>
                          <th style={{ padding: "6px 8px", textAlign: "left" }}>
                            Program
                          </th>
                          <th
                            style={{ padding: "6px 8px", textAlign: "center" }}>
                            Absences
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {atRiskStudents.map((s, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: "1px solid #f5f5f5",
                              background: idx % 2 === 0 ? "#fff" : "#fafafa",
                            }}>
                            <td style={{ padding: "7px 8px" }}>
                              <div style={{ fontWeight: 600 }}>
                                {s.last_name}, {s.first_name}
                              </div>
                              <div
                                style={{ color: "#aaa", fontSize: "0.72rem" }}>
                                {s.student_id_no}
                              </div>
                            </td>
                            <td style={{ padding: "7px 8px" }}>
                              <span
                                style={{
                                  background: "#e8f0fe",
                                  color: "#0d6efd",
                                  borderRadius: "6px",
                                  padding: "2px 7px",
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                }}>
                                {s.program_code}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "7px 8px",
                                textAlign: "center",
                              }}>
                              <span
                                style={{
                                  background:
                                    s.absences >= 5 ? "#fde8e8" : "#fff3cd",
                                  color:
                                    s.absences >= 5 ? "#dc3545" : "#856404",
                                  borderRadius: "6px",
                                  padding: "2px 10px",
                                  fontWeight: 700,
                                  fontSize: "0.82rem",
                                }}>
                                {s.absences}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
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
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
