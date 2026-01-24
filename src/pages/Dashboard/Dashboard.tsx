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
            <div className="stat-card fade-up delay-1">
              <div className="stat-icon bg-primary">
                <i className="bi bi-diagram-3-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Programs</h4>
                <span>12</span>
              </div>
            </div>

            <div className="stat-card fade-up delay-2">
              <div className="stat-icon bg-success">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Total Students</h4>
                <span>1,248</span>
              </div>
            </div>

            <div className="stat-card fade-up delay-3">
              <div className="stat-icon bg-warning">
                <i className="bi bi-calendar-event-fill"></i>
              </div>
              <div className="stat-info">
                <h4>Total Events</h4>
                <span>38</span>
              </div>
            </div>

            <div className="stat-card fade-up delay-4">
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
          <div className="charts-row">
            {/* Bar Chart */}
            <div className="analytics-chart fade-up delay-5">
              <h3 className="chart-title">
                <i className="bi bi-bar-chart-fill"></i> Attendance Comparison
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
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
                <i className="bi bi-graph-up-arrow"></i> Weekly Trend
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
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
                      dataKey="eventName"
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "none" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke="#0dcaf0"
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Lower Grid (Progress & Next Event) */}
          <div className="dashboard-lower-grid">
            {/* Program Attendance Card */}
            <div className="lower-card fade-up delay-6">
              <h4 className="card-title">
                <i className="bi bi-pie-chart-fill text-primary me-2"></i>
                Program Participation
              </h4>
              <div className="progress-bars">
                {mockProgramAttendance.map((prog, idx) => (
                  <div key={idx} className="progress-item">
                    <div className="progress-header">
                      <span className="program-name">{prog.program}</span>
                      <span
                        className="program-percent"
                        style={{ color: prog.color }}>
                        {prog.percent}%
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${prog.percent}%`,
                          background: `linear-gradient(90deg, ${prog.color}, ${prog.color}dd)`,
                          boxShadow: `0 2px 8px ${prog.color}40`,
                        }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Event Card */}
            <div className="lower-card event-card fade-up delay-6">
              <div className="event-header">
                <div className="event-icon-box">
                  <i className="bi bi-calendar-event"></i>
                </div>
                <h3>Next Event: Lightning Workshop</h3>
              </div>

              <div className="event-details">
                <div className="detail-row">
                  <i className="bi bi-calendar-check"></i>
                  <span>Jan 20, 2026</span>
                </div>
                <div className="detail-row">
                  <i className="bi bi-clock"></i>
                  <span>10:00 AM - 12:00 PM</span>
                </div>
                <div className="detail-row">
                  <i className="bi bi-geo-alt"></i>
                  <span>Room 101, Main Bldg</span>
                </div>
                <div className="detail-row">
                  <i className="bi bi-people"></i>
                  <span>150 Expected</span>
                </div>
              </div>

              <button className="btn-view-details">
                View Details <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
