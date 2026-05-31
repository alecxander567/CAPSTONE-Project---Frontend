import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../../hooks/Logout";
import { useNotifications } from "../../hooks/useNotifyEvents";
import logo from "../../assets/logo.jpg";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogout();
  const { notifications } = useNotifications();

  const isActive = (path: string) => location.pathname === path;
  const handleNavigate = (path: string) => navigate(path);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navItems = [
    { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { path: "/notifications", icon: "bi-bell", label: "Alerts" },
    { path: "/events", icon: "bi-calendar-event", label: "Events" },
    { path: "/calendar", icon: "bi-calendar3", label: "Schedules" },
    {
      path: "/attendancehistory",
      icon: "bi-clipboard-check",
      label: "Attendance",
    },
    { path: "/programs", icon: "bi-collection", label: "Programs" },
    { path: "/settings", icon: "bi-gear", label: "Settings" },
  ];

  return (
    <>
      {/* ── Mobile Topbar ── */}
      <div className="sidebar-toggle">
        <img
          src={logo}
          alt="Logo"
          width="32"
          height="32"
          className="rounded-circle"
        />
        <span className="sidebar-toggle-title">ARA System</span>
        <button className="sidebar-toggle-logout" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        <div className="wave"></div>
        <div className="sidebar-content">
          <h2 className="sidebar-title">ARA</h2>

          <ul className="sidebar-menu">
            <li
              className={isActive("/dashboard") ? "active" : ""}
              onClick={() => handleNavigate("/dashboard")}>
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </li>

            <li
              className={isActive("/notifications") ? "active" : ""}
              onClick={() => handleNavigate("/notifications")}
              style={{ position: "relative" }}>
              <i className="bi bi-bell"></i>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="notification-badge"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "20px",
                    transform: "translateY(-50%)",
                    backgroundColor: "#dc3545",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </li>

            <li
              className={isActive("/events") ? "active" : ""}
              onClick={() => handleNavigate("/events")}>
              <i className="bi bi-calendar-event"></i>
              <span>Events</span>
            </li>

            <li
              className={isActive("/calendar") ? "active" : ""}
              onClick={() => handleNavigate("/calendar")}>
              <i className="bi bi-calendar3"></i>
              <span>Schedules</span>
            </li>

            <li
              className={isActive("/attendancehistory") ? "active" : ""}
              onClick={() => handleNavigate("/attendancehistory")}>
              <i className="bi bi-clipboard-check"></i>
              <span>Attendance History</span>
            </li>

            <li
              className={isActive("/programs") ? "active" : ""}
              onClick={() => handleNavigate("/programs")}>
              <i className="bi bi-collection"></i>
              <span>Programs</span>
            </li>

            <li
              className={isActive("/settings") ? "active" : ""}
              onClick={() => handleNavigate("/settings")}>
              <i className="bi bi-gear"></i>
              <span>Settings</span>
            </li>
          </ul>

          <div className="sidebar-logout danger" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile Footer Nav (no logout here) ── */}
      <nav className="footer-nav">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`footer-nav-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => handleNavigate(item.path)}>
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
            {item.path === "/notifications" && unreadCount > 0 && (
              <span className="nav-dot" />
            )}
          </div>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
