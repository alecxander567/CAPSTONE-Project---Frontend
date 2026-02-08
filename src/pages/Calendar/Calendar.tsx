import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useCalendarEvents } from "../../hooks/useCalendarEvents";
import type { CSSProperties } from "react";

function Calendar() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const { events, loading, error, fetchCalendarEvents } = useCalendarEvents();

  useEffect(() => {
    fetchCalendarEvents(year, month);
  }, [year, month, fetchCalendarEvents]);

  const styles: Record<string, CSSProperties> = {
    pageWrapper: {
      marginLeft: window.innerWidth > 991 ? 260 : 0, 
      minHeight: "100vh",
      width: window.innerWidth > 991 ? "calc(100% - 260px)" : "100%",
      transition: "margin-left 0.3s ease",
      backgroundColor: "#f8f9fa",
    },
    dashboardHeader: {
      position: "relative",
      background: "linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%)",
      color: "#fff",
      padding: "3rem 2rem",
      overflow: "hidden",
      marginBottom: 0,
      paddingBottom: "60px",
    },
    wave: {
      position: "absolute",
      width: "200%",
      height: "200%",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "40%",
      top: "-60%",
      left: "-50%",
      animation: "wave 15s linear infinite",
    },
    dashboardHeaderContent: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
      maxWidth: 1400,
      margin: "0 auto",
    },
    dashboardHeaderIcon: {
      background: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(5px)",
      width: 64,
      height: 64,
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2rem",
    },
    dashboardHeaderText: {
      position: "relative",
      zIndex: 1,
    },
    headerTitle: {
      margin: "0 0 0.5rem 0",
      fontSize: "2rem",
      fontWeight: 700,
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    headerSubtitle: {
      margin: 0,
      opacity: 0.95,
      fontSize: "1rem",
    },
    contentWrapper: {
      maxWidth: 1600,
      margin: "0 auto",
      width: "100%",
      padding: "2rem",
      marginTop: -40,
      position: "relative",
      zIndex: 2,
    },
    calendarControls: {
      display: "flex",
      gap: 12,
      marginBottom: 30,
      flexWrap: "wrap",
      background: "#fff",
      padding: "1.5rem",
      borderRadius: 16,
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
    selectControl: {
      flex: 1,
      minWidth: 200,
      maxWidth: 300,
      borderRadius: 12,
    },
    inputControl: {
      width: 140,
      borderRadius: 12,
    },
    eventsList: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      paddingBottom: 40,
    },
    eventCard: {
      display: "flex",
      gap: 20,
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      border: "1px solid #f0f0f0",
      borderLeft: "4px solid #0d6efd",
      transition: "all 0.3s ease",
      alignItems: "center",
      cursor: "pointer",
    },
    eventInfo: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      minWidth: 0,
    },
    dateBadge: {
      minWidth: 80,
      width: 80,
      height: 80,
      background: "linear-gradient(135deg, #e9f2ff 0%, #d4e6ff 100%)",
      borderRadius: 14,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(13, 110, 253, 0.1)",
      gap: 2,
      padding: 8,
    },
    day: {
      fontSize: 28,
      fontWeight: 700,
      color: "#0d6efd",
      lineHeight: 1,
    },
    month: {
      fontSize: 11,
      textTransform: "uppercase",
      color: "#6c757d",
      fontWeight: 600,
      letterSpacing: 0.5,
      marginTop: 2,
    },
    eventTitle: {
      margin: 0,
      fontWeight: 600,
      fontSize: 18,
      color: "#212529",
      lineHeight: 1.4,
      display: "flex",
      alignItems: "center",
      wordBreak: "break-word",
    },
    eventMeta: {
      margin: 0,
      fontSize: 14,
      color: "#6c757d",
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    metaItem: {
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#6c757d",
      background: "#fff",
      borderRadius: 16,
    },
    emptyIcon: {
      fontSize: "4rem",
      opacity: 0.5,
      marginBottom: 16,
    },
  };

  // Mobile responsiveness
  if (window.innerWidth <= 768) {
    styles.dashboardHeader.padding = "2rem 1.5rem";
    styles.dashboardHeader.paddingBottom = "50px";
    styles.contentWrapper.padding = "1.5rem";
    styles.contentWrapper.marginTop = "-30px";
    styles.eventCard.padding = "20px";
    styles.eventCard.gap = "16px";
    styles.dateBadge.minWidth = "70px";
    styles.dateBadge.width = "70px";
    styles.dateBadge.height = "70px";
    styles.day.fontSize = "24px";
    styles.month.fontSize = "10px";
    styles.eventTitle.fontSize = "17px";
    styles.eventMeta.fontSize = "13px";
    styles.headerTitle.fontSize = "1.75rem";
  }

  if (window.innerWidth <= 576) {
    styles.pageWrapper.paddingTop = "60px";
    styles.contentWrapper.padding = "1rem";
    styles.dashboardHeaderContent.flexDirection = "column";
    styles.dashboardHeaderContent.textAlign = "center";
    styles.dashboardHeaderText.textAlign = "center";
    styles.eventCard.flexDirection = "column";
    styles.eventCard.padding = "16px";
    styles.eventCard.gap = "12px";
    styles.eventInfo.textAlign = "center";
    styles.eventInfo.alignItems = "center";
    styles.dateBadge.width = "100%";
    styles.dateBadge.minWidth = "100%";
    styles.dateBadge.height = "60px";
    styles.dateBadge.flexDirection = "row";
    styles.dateBadge.gap = "12px";
    styles.day.fontSize = "22px";
    styles.eventTitle.fontSize = "16px";
    styles.eventTitle.justifyContent = "center";
    styles.eventMeta.flexDirection = "column";
    styles.eventMeta.alignItems = "center";
    styles.eventMeta.gap = "8px";
    styles.headerTitle.fontSize = "1.5rem";
    styles.calendarControls.flexDirection = "column";
    styles.selectControl.maxWidth = "100%";
    styles.inputControl.width = "100%";
  }

  return (
    <>
      <Sidebar />
      <style>
        {`
          @keyframes wave {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={styles.pageWrapper}>
        <header style={styles.dashboardHeader}>
          <div style={styles.wave}></div>
          <div style={styles.dashboardHeaderContent}>
            <div style={styles.dashboardHeaderIcon}>
              <i className="bi bi-calendar-month"></i>
            </div>
            <div style={styles.dashboardHeaderText}>
              <h1 style={styles.headerTitle}>Calendar</h1>
              <p style={styles.headerSubtitle}>
                View scheduled events by month
              </p>
            </div>
          </div>
        </header>

        <div style={styles.contentWrapper}>
          <div style={styles.calendarControls}>
            <select
              className="form-select"
              style={styles.selectControl}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}>
              {monthNames.map((name, index) => (
                <option key={index} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="form-control"
              style={styles.inputControl}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div style={styles.eventsList}>
            {loading && (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"></div>
                <p className="mt-2 text-muted">Loading events...</p>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && events.length === 0 && (
              <div style={styles.emptyState}>
                <i className="bi bi-calendar-x" style={styles.emptyIcon}></i>
                <p>No events scheduled for this month.</p>
              </div>
            )}

            {!loading &&
              events.map((event) => {
                const date = new Date(event.event_date);
                return (
                  <div
                    key={event.id}
                    style={styles.eventCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(13, 110, 253, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.04)";
                    }}>
                    <div style={styles.eventInfo}>
                      <h5 style={styles.eventTitle}>
                        <i
                          className="bi bi-calendar-event-fill"
                          style={{ marginRight: "8px", color: "#0d6efd" }}></i>
                        {event.title}
                      </h5>
                      <div style={styles.eventMeta}>
                        <span style={styles.metaItem}>
                          <i className="bi bi-clock"></i>
                          {event.start_time} – {event.end_time}
                        </span>
                        <span style={styles.metaItem}>
                          <i className="bi bi-geo-alt"></i>
                          {event.location}
                        </span>
                      </div>
                    </div>

                    <div style={styles.dateBadge}>
                      <span style={styles.day}>{date.getDate()}</span>
                      <span style={styles.month}>
                        {date.toLocaleString("default", { month: "short" })}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Calendar;
