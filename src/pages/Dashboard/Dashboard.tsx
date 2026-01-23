import Sidebar from "../../components/Sidebar/Sidebar";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

function Dashboard() {
  const mockEventData = [
    { event: "Orientation", students: 120 },
    { event: "Workshop A", students: 85 },
    { event: "Workshop B", students: 150 },
    { event: "Seminar", students: 60 },
    { event: "Sports Meet", students: 200 },
    { event: "Tech Talk", students: 95 },
  ];

  const mockProgramAttendance = [
    { program: "Computer Science", percent: 95, color: "#4d94ff" },
    { program: "IT", percent: 85, color: "#0dcaf0" },
    { program: "Business Administration", percent: 75, color: "#ff6b6b" },
    { program: "Education", percent: 65, color: "#fcd34d" },
    { program: "Engineering", percent: 50, color: "#34d399" },
  ];

  const weeklyTrend = [
    { eventName: "Lightning Workshop", attendance: 85 },
    { eventName: "Web Dev Bootcamp", attendance: 92 },
    { eventName: "AI Seminar", attendance: 78 },
    { eventName: "Cybersecurity 101", attendance: 95 },
    { eventName: "Cloud Computing Intro", attendance: 88 },
  ];

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

        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card fade-up">
              <div className="stat-icon bg-primary">
                <i className="bi bi-diagram-3-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Programs</h4>
                <span>12</span>
              </div>
            </div>

            <div className="stat-card fade-up">
              <div className="stat-icon bg-success">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Total Students</h4>
                <span>1,248</span>
              </div>
            </div>

            <div className="stat-card fade-up">
              <div className="stat-icon bg-warning">
                <i className="bi bi-calendar-event-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Total Events</h4>
                <span>38</span>
              </div>
            </div>

            <div className="stat-card fade-up">
              <div className="stat-icon bg-info">
                <i className="bi bi-usb-symbol"></i>
              </div>
              <div className="stat-info">
                <h4>Connection</h4>
                <span className="status online">Online</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div
            className="charts-row"
            style={{
              marginTop: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "1.5rem",
            }}>
            {/* Bar Chart */}
            <div className="analytics-chart fade-up">
              <h3 className="chart-title">
                <i className="bi bi-bar-chart-fill"></i> Event Attendance
                Comparison
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={mockEventData}
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
                        offset="50%"
                        stopColor="#0d6efd"
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor="#0a58ca"
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                    <filter id="shadow" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                      <feOffset dx="0" dy="4" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
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
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      padding: "12px 16px",
                    }}
                    labelStyle={{
                      fontWeight: 600,
                      color: "#333",
                      marginBottom: "4px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="students"
                    fill="url(#barGradient)"
                    name="Students"
                    radius={[10, 10, 0, 0]}
                    filter="url(#shadow)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="analytics-chart fade-up">
              <h3 className="chart-title">
                <i className="bi bi-graph-up-arrow"></i> Overall Attendance Per
                Event
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={weeklyTrend}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#0dcaf0" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#0dcaf0"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="eventName"
                    tick={{ fontSize: 12, fill: "#666" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#0dcaf0"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    name="Attendance %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="dashboard-lower-grid fade-up"
            style={{ marginTop: "2rem", display: "flex", gap: "1.5rem" }}>
            <div
              className="program-attendance-card"
              style={{
                flex: 1,
                background: "#fff",
                padding: "2rem",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.04)",
                fontFamily: "'Inter', sans-serif",
              }}>
              <h4
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  color: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}>
                <i
                  className="bi bi-bar-chart-fill"
                  style={{ color: "#0d6efd", fontSize: "1.3rem" }}></i>
                Programs Who Attend Events the Most
              </h4>

              <div className="progress-bars">
                {mockProgramAttendance.map((prog, idx) => (
                  <div key={idx} style={{ marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.875rem",
                        marginBottom: "8px",
                        fontWeight: 500,
                      }}>
                      <span style={{ color: "#4a5568" }}>{prog.program}</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: prog.color,
                          fontSize: "0.9rem",
                        }}>
                        {prog.percent}%
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#f1f3f5",
                        borderRadius: "999px",
                        height: "12px",
                        overflow: "hidden",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
                      }}>
                      <div
                        style={{
                          width: `${prog.percent}%`,
                          background: `linear-gradient(90deg, ${prog.color}, ${prog.color}dd)`,
                          height: "100%",
                          borderRadius: "999px",
                          transition: "width 1s ease",
                          boxShadow: `0 2px 8px ${prog.color}40`,
                          position: "relative",
                        }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="upcoming-event-card-professional"
              style={{
                flex: 1,
                background: "#f4f7fd",
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 10px 25px rgba(0,0,0,0.07)",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid #dbe2f1",
              }}>
              {/* Event Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}>
                <div
                  style={{
                    background: "#0d6efd",
                    padding: "0.5rem",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <i
                    className="bi bi-calendar-event"
                    style={{ color: "#fff", fontSize: "1.25rem" }}></i>
                </div>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}>
                  Next Event: Lightning Workshop
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  color: "#1a1a1a",
                }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}>
                  <i
                    className="bi bi-calendar"
                    style={{ color: "#0d6efd", fontSize: "1.1rem" }}></i>
                  <span>
                    <strong>Date:</strong> Jan 20, 2026
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}>
                  <i
                    className="bi bi-clock"
                    style={{ color: "#0d6efd", fontSize: "1.1rem" }}></i>
                  <span>
                    <strong>Time:</strong> 10:00 AM - 12:00 PM
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}>
                  <i
                    className="bi bi-people"
                    style={{ color: "#0d6efd", fontSize: "1.1rem" }}></i>
                  <span>
                    <strong>Expected:</strong> 150 students
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}>
                  <i
                    className="bi bi-geo-alt"
                    style={{ color: "#0d6efd", fontSize: "1.1rem" }}></i>
                  <span>
                    <strong>Location:</strong> Room 101
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                style={{
                  padding: "0.875rem 1.75rem",
                  background: "#0d6efd",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  transition: "all 0.25s ease",
                  boxShadow: "0 5px 15px rgba(13,110,253,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(13,110,253,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 5px 15px rgba(13,110,253,0.25)";
                }}>
                View Details →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
