import "./StudentDashboard.css";
import StudentSidebar from "../../components/StudentSidebar/StudentSidebar";
import { useEvents } from "../../hooks/useEvents";
import type { AppEvent } from "../../hooks/useEvents";
import { useAttendancePerProgram } from "../../hooks/useAttendancePerProgram";
import { useUserProfile } from "../../hooks/useUserProfile";
import { requestDeviceToken, listenMessages } from "../../firebase";
import { useEffect } from "react";

function getUpcomingEvent(events: AppEvent[]) {
  const now = new Date();
  return (
    events
      .filter((e) => {
        const eventDate = new Date(e.event_date);
        return eventDate >= new Date(now.toDateString());
      })
      .sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
      )[0] || null
  );
}

function generateCalendar(events: AppEvent[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevLast = new Date(year, month, 0).getDate();
  const days: {
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    hasEvent: boolean;
  }[] = [];

  for (let i = firstDay - 1; i >= 0; i--)
    days.push({
      day: prevLast - i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    });

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      day: d,
      isCurrentMonth: true,
      isToday: d === now.getDate(),
      hasEvent: events.some((e) => e.event_date?.startsWith(ds)),
    });
  }

  const rem = 35 - days.length;
  for (let d = 1; d <= rem; d++)
    days.push({
      day: d,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    });

  return days;
}

function getCurrentMonthYear() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

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

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  ongoing: { label: "Ongoing", color: "#b45309", bg: "#fef3c7" },
  upcoming: { label: "Upcoming", color: "#1d4ed8", bg: "#dbeafe" },
  done: { label: "Done", color: "#166534", bg: "#dcfce7" },
};

function StudentDashboard() {
  const { events } = useEvents();
  const { data: programAttendanceData, loading: programAttendanceLoading } =
    useAttendancePerProgram();
  const { profile } = useUserProfile();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning"
    : hour < 18 ? "Good Afternoon"
    : "Good Evening";

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : "";

  const upcomingEvent = getUpcomingEvent(events);
  const calendarDays = generateCalendar(events);

  const eventDate = upcomingEvent ? new Date(upcomingEvent.event_date) : null;
  const eventMonth = eventDate?.toLocaleDateString("en-US", { month: "short" });
  const eventDay = eventDate?.getDate();
  const eventWeekday = eventDate?.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const eventFullDate = eventDate?.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const statusInfo =
    upcomingEvent ?
      (statusConfig[upcomingEvent.status] ?? {
        label: upcomingEvent.status,
        color: "#374151",
        bg: "#f3f4f6",
      })
    : null;

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

  const filtered = programAttendanceData.filter(
    (p) => !p.program.toLowerCase().includes("osa"),
  );
  const total = filtered.reduce((sum, p) => sum + p.present, 0);

  return (
    <div className="sd-layout">
      <StudentSidebar />

      <main className="sd-main">
        {/* ── Header ── */}
        <header className="sd-header">
          <div className="sd-wave" />
          <div className="sd-header-inner sd-fade-up">
            <div className="sd-header-icon">
              <i className="bi bi-person-circle" />
            </div>
            <div>
              <h1>
                {greeting}
                {fullName && (
                  <span style={{ opacity: 0.92 }}>, {fullName}!</span>
                )}
              </h1>
              <p>Here's what's happening on campus today.</p>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="sd-content">
          <div className="sd-grid">
            {/* Left column */}
            <div className="sd-left-col">
              {/* Upcoming Event */}
              <div className="sd-card sd-fade-up sd-delay-1">
                <h4 className="sd-card-title">
                  <i className="bi bi-calendar-event-fill text-primary me-2" />
                  Next Upcoming Event
                </h4>

                {!upcomingEvent ?
                  <div className="sd-no-event">
                    <i className="bi bi-calendar-x" />
                    <p>No upcoming events scheduled.</p>
                  </div>
                : <div className="sd-ev-card">
                    <div className="sd-ev-accent" />

                    <div className="sd-ev-header-row">
                      <div className="sd-date-pill">
                        <span className="sd-pill-month">{eventMonth}</span>
                        <span className="sd-pill-day">{eventDay}</span>
                      </div>
                      <span
                        className="sd-status-chip"
                        style={{
                          color: statusInfo?.color,
                          background: statusInfo?.bg,
                        }}>
                        <span
                          className="sd-status-dot"
                          style={{ background: statusInfo?.color }}
                        />
                        {statusInfo?.label}
                      </span>
                    </div>

                    <h5 className="sd-ev-title">{upcomingEvent.title}</h5>

                    {upcomingEvent.description && (
                      <p className="sd-ev-desc">{upcomingEvent.description}</p>
                    )}

                    <div className="sd-ev-divider" />

                    <div className="sd-ev-meta">
                      <div className="sd-meta-item">
                        <div className="sd-meta-icon">
                          <i className="bi bi-calendar3" />
                        </div>
                        <div className="sd-meta-text">
                          <span className="sd-meta-label">Date</span>
                          <span className="sd-meta-value">
                            {eventWeekday}, {eventFullDate}
                          </span>
                        </div>
                      </div>
                      <div className="sd-meta-item">
                        <div className="sd-meta-icon">
                          <i className="bi bi-clock" />
                        </div>
                        <div className="sd-meta-text">
                          <span className="sd-meta-label">Time</span>
                          <span className="sd-meta-value">
                            {upcomingEvent.start_time} –{" "}
                            {upcomingEvent.end_time}
                          </span>
                        </div>
                      </div>
                      <div className="sd-meta-item">
                        <div className="sd-meta-icon">
                          <i className="bi bi-geo-alt" />
                        </div>
                        <div className="sd-meta-text">
                          <span className="sd-meta-label">Location</span>
                          <span className="sd-meta-value">
                            {upcomingEvent.location}
                          </span>
                        </div>
                      </div>
                      {upcomingEvent.program_id && (
                        <div className="sd-meta-item">
                          <div className="sd-meta-icon">
                            <i className="bi bi-diagram-3" />
                          </div>
                          <div className="sd-meta-text">
                            <span className="sd-meta-label">Audience</span>
                            <span className="sd-meta-value sd-meta-tag">
                              Program-specific
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                }
              </div>

              {/* Calendar */}
              <div className="sd-card sd-fade-up sd-delay-2">
                <h4 className="sd-card-title">
                  <i className="bi bi-calendar3 text-primary me-2" />
                  Calendar
                </h4>
                <div className="sd-cal-month">{getCurrentMonthYear()}</div>
                <div className="sd-cal-grid">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (w) => (
                      <div key={w} className="sd-cal-weekday">
                        {w}
                      </div>
                    ),
                  )}
                  {calendarDays.map((d, idx) => (
                    <div
                      key={idx}
                      className={[
                        "sd-cal-day",
                        !d.isCurrentMonth ? "sd-other-month" : "",
                        d.isToday ? "sd-today" : "",
                        d.hasEvent ? "sd-has-event" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}>
                      {d.day}
                    </div>
                  ))}
                </div>
                <div className="sd-cal-footer">
                  <div className="sd-cal-legend">
                    <span className="sd-legend-item">
                      <span className="sd-legend-dot sd-dot-today" />
                      Today
                    </span>
                    <span className="sd-legend-item">
                      <span className="sd-legend-dot sd-dot-event" />
                      Event
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Program Participation */}
            <div className="sd-card sd-fade-up sd-delay-2">
              <h4 className="sd-card-title">
                <i className="bi bi-pie-chart-fill text-primary me-2" />
                Program Participation
              </h4>
              <h6 className="text-muted small mb-3">PARTICIPATION OVERVIEW</h6>

              {programAttendanceLoading ?
                <div className="text-center py-2">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  />
                </div>
              : <div className="sd-prog-bars">
                  {filtered.map((prog, idx) => {
                    const percent =
                      total > 0 ? Math.round((prog.present / total) * 100) : 0;
                    const color = programColors[idx % programColors.length];
                    return (
                      <div key={idx}>
                        <div className="sd-prog-header">
                          <span className="sd-prog-name">
                            {prog.program}
                            <span className="text-muted small ms-2">
                              ({prog.present} / {prog.total_students} present)
                            </span>
                          </span>
                          <span className="sd-prog-pct" style={{ color }}>
                            {percent}%
                          </span>
                        </div>
                        <div className="sd-prog-bar-bg">
                          <div
                            className="sd-prog-bar-fill"
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
