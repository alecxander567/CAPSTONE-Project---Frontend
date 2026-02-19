import StudentSidebar from "../../components/StudentSidebar/StudentSidebar";
import { useEvents } from "../../hooks/useEvents";
import { useAttendancePerProgram } from "../../hooks/useAttendancePerProgram";
import { useUserProfile } from "../../hooks/useUserProfile";

function getUpcomingEvent(events: any[]) {
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

function generateCalendar(events: any[]) {
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

const inlineStyles = `
  .sd-layout { display: flex; min-height: 100vh; background-color: #f8f9fa; overflow-x: hidden; }

  .sd-main { width: 100%; padding: 0; display: flex; flex-direction: column; }
  @media (min-width: 992px) { .sd-main { margin-left: 260px; width: calc(100% - 260px); } }
  @media (max-width: 991px) { .sd-main { margin-left: 0; width: 100%; padding-top: 70px; } }

  @keyframes sdFadeUp { to { opacity: 1; transform: translateY(0); } }
  @keyframes sdWave   { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  .sd-fade-up  { opacity: 0; transform: translateY(20px); animation: sdFadeUp 0.8s cubic-bezier(0.2,0.8,0.2,1) forwards; }
  .sd-delay-1  { animation-delay: 0.1s; }
  .sd-delay-2  { animation-delay: 0.2s; }

  /* ── Header ── */
  .sd-header { position: relative; background: linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%); color: #fff; padding: 3rem 2rem 60px; overflow: hidden; margin-bottom: -40px; }
  .sd-wave   { position: absolute; width: 200%; height: 200%; background: rgba(255,255,255,0.1); border-radius: 40%; top: -60%; left: -50%; animation: sdWave 15s linear infinite; }
  .sd-header-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
  .sd-header-inner h1 { margin: 0 0 0.5rem; font-size: 2rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .sd-header-inner p  { margin: 0; opacity: 0.95; font-size: 1rem; }
  .sd-header-icon { background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0; }
  @media (max-width: 768px) { .sd-header { padding: 2rem 1.5rem 50px; } .sd-header-inner h1 { font-size: 1.5rem; } }
  @media (max-width: 576px) { .sd-header-inner h1 { font-size: 1.25rem; } }

  /* ── Layout ── */
  .sd-content    { padding: 0 2rem 2rem; max-width: 1600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
  .sd-grid       { display: grid; grid-template-columns: minmax(300px, 420px) 1fr; gap: 1.5rem; align-items: start; }
  .sd-left-col   { display: flex; flex-direction: column; gap: 1.5rem; }
  @media (max-width: 900px) { .sd-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px) { .sd-content { padding: 0 1rem 1rem; } }

  /* ── Card shell ── */
  .sd-card       { background: #fff; border-radius: 20px; padding: 1.75rem; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.03); display: flex; flex-direction: column; }
  .sd-card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; color: #1a1a1a; }

  /* ── No-event placeholder ── */
  .sd-no-event   { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; gap: 0.75rem; color: #9ca3af; }
  .sd-no-event i { font-size: 2rem; }
  .sd-no-event p { margin: 0; font-size: 0.9rem; }

  /* ── Event card ── */
  .sd-ev-card        { border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #fff; }
  .sd-ev-accent      { height: 5px; background: linear-gradient(90deg, #0d6efd, #00b4d8); }
  .sd-ev-header-row  { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem 0; }

  .sd-date-pill      { display: flex; flex-direction: column; align-items: center; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 0.35rem 0.75rem; min-width: 52px; }
  .sd-pill-month     { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; line-height: 1; }
  .sd-pill-day       { font-size: 1.5rem; font-weight: 800; color: #1e40af; line-height: 1.1; }

  .sd-status-chip    { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
  .sd-status-dot     { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  .sd-ev-title       { margin: 0.85rem 1.25rem 0.35rem; font-size: 1.05rem; font-weight: 700; color: #111827; line-height: 1.35; }
  .sd-ev-desc        { margin: 0 1.25rem 0.85rem; font-size: 0.83rem; color: #6b7280; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .sd-ev-divider     { height: 1px; background: #f3f4f6; margin: 0 1.25rem; }

  .sd-ev-meta        { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem 1.25rem 1.25rem; }
  .sd-meta-item      { display: flex; align-items: flex-start; gap: 0.75rem; }
  .sd-meta-icon      { width: 30px; height: 30px; border-radius: 8px; background: #f0f4ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; margin-top: 1px; }
  .sd-meta-text      { display: flex; flex-direction: column; gap: 1px; }
  .sd-meta-label     { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #9ca3af; line-height: 1; }
  .sd-meta-value     { font-size: 0.855rem; font-weight: 500; color: #1f2937; line-height: 1.4; }
  .sd-meta-tag       { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 4px; font-weight: 600; }

  /* ── Calendar ── */
  .sd-cal-month      { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; text-align: center; margin-bottom: 1rem; }
  .sd-cal-grid       { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .sd-cal-weekday    { text-align: center; font-size: 0.75rem; font-weight: 600; color: #6c757d; padding: 0.5rem 0; text-transform: uppercase; }
  .sd-cal-day        { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 8px; font-size: 0.85rem; font-weight: 500; color: #1a1a1a; cursor: pointer; transition: all 0.2s; position: relative; }
  .sd-cal-day:hover  { background: #e9ecef; transform: scale(1.05); }
  .sd-cal-day.sd-other-month { color: #adb5bd; background: transparent; }
  .sd-cal-day.sd-today       { background: #0d6efd; color: #fff; font-weight: 700; }
  .sd-cal-day.sd-has-event::after { content: ""; position: absolute; bottom: 4px; width: 4px; height: 4px; background: #fd7e14; border-radius: 50%; }
  .sd-cal-footer     { padding-top: 1rem; border-top: 1px solid #e9ecef; margin-top: 0.75rem; }
  .sd-cal-legend     { display: flex; gap: 1.5rem; justify-content: center; }
  .sd-legend-item    { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #6c757d; }
  .sd-legend-dot     { width: 12px; height: 12px; border-radius: 4px; }
  .sd-dot-today      { background: #0d6efd; }
  .sd-dot-event      { background: #fd7e14; }

  /* ── Program participation ── */
  .sd-prog-bars      { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 0.75rem; }
  .sd-prog-header    { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500; }
  .sd-prog-name      { color: #1a1a1a; }
  .sd-prog-pct       { font-weight: 600; }
  .sd-prog-bar-bg    { height: 10px; background: #f0f2f5; border-radius: 10px; overflow: hidden; }
  .sd-prog-bar-fill  { height: 100%; border-radius: 10px; transition: width 1s ease; }
`;

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

  return (
    <>
      <style>{inlineStyles}</style>

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
                        <p className="sd-ev-desc">
                          {upcomingEvent.description}
                        </p>
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
                : <div className="sd-prog-bars">
                    {(() => {
                      const filtered = programAttendanceData.filter(
                        (p) => !p.program.toLowerCase().includes("osa"),
                      );
                      const total = filtered.reduce(
                        (sum, p) => sum + p.students,
                        0,
                      );
                      return filtered.map((prog, idx) => {
                        const percent =
                          total > 0 ?
                            Math.round((prog.students / total) * 100)
                          : 0;
                        const color = programColors[idx % programColors.length];
                        return (
                          <div key={idx}>
                            <div className="sd-prog-header">
                              <span className="sd-prog-name">
                                {prog.program}
                                <span className="text-muted small ms-2">
                                  ({prog.students} present)
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
                      });
                    })()}
                  </div>
                }
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default StudentDashboard;
