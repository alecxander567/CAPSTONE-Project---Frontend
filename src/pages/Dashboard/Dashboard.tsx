import Sidebar from "../../components/Sidebar/Sidebar";
import { usePrograms } from "../../hooks/useProgram";
import { useEvents } from "../../hooks/useEvents";
import { useDeviceStatus } from "../../hooks/useDeviceStatus";
import { useAttendancePerEvent } from "../../hooks/useAttendancePerEvent";
import { useAttendancePerProgram } from "../../hooks/useAttendancePerProgram";
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
          {/* Print Header (Only visible when printing) */}
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
                <h4>Connection</h4>
                <span className={`status ${connected ? "online" : "offline"}`}>
                  {connected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          {/* Charts Row */}
          <div className="charts-row">
            {/* Bar Chart */}
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

            {/* Area Chart */}
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
          {/* Lower Grid (Progress & Calendar) */}
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
                    role="status"></div>
                  <p className="mt-2 text-muted small">Loading programs...</p>
                </div>
              : programsError ?
                <div className="alert alert-danger small" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {programsError}
                </div>
              : <>
                  {/* Recent Event */}
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

                  {/* Program Attendance Progress Bars */}
                  <div className="participation-chart">
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
                    : <div className="progress-bars">
                        {(() => {
                          const filteredPrograms = programAttendanceData.filter(
                            (prog) =>
                              !prog.program.toLowerCase().includes("osa"),
                          );

                          const total = filteredPrograms.reduce(
                            (sum, p) => sum + p.students,
                            0,
                          );

                          return filteredPrograms.map((prog, idx) => {
                            const percent =
                              total > 0 ?
                                Math.round((prog.students / total) * 100)
                              : 0;
                            const color =
                              programColors[idx % programColors.length];
                            return (
                              <div key={idx} className="progress-item">
                                <div className="progress-header">
                                  <span className="program-name">
                                    {prog.program}
                                    <span className="text-muted small ms-2">
                                      ({prog.students} present)
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

            {/* Calendar column: card + button stacked */}
            <div
              className="fade-up delay-6"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Calendar Card */}
              <div className="lower-card">
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

              {/* Print Analytics Button */}
              <button
                className="btn btn-print-analytics w-100"
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
