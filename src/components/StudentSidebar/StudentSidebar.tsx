import "./StudentSidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../../hooks/Logout";
import { useNotifications } from "../../hooks/useNotifyEvents";
import logo from "../../assets/logo.jpg";

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogout();
  const { notifications } = useNotifications();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const menuItems = [
    { path: "/student-dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { path: "/student-notifications", icon: "bi-bell", label: "Notifications" },
    { path: "/student-events", icon: "bi-calendar-event", label: "Events" },
    { path: "/student-calendar", icon: "bi-calendar3", label: "Schedules" },
    {
      path: "/student-attendancehistory",
      icon: "bi-clipboard-check",
      label: "Attendance",
    },
    { path: "/student-settings", icon: "bi-gear", label: "Settings" },
  ];

  return (
    <>
      {/* Topbar — mobile only */}
      <header className="mobile-topbar">
        <div className="topbar-left">
          <img
            src={logo}
            alt="Logo"
            width="32"
            height="32"
            className="topbar-logo"
          />
          <span className="topbar-title">ARA</span>
        </div>
        <button className="topbar-logout-btn" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </header>

      {/* Sidebar — desktop only */}
      <aside className="sidebar">
        <div className="wave"></div>
        <div className="sidebar-content">
          <h2 className="sidebar-title">ARA</h2>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={isActive(item.path) ? "active" : ""}
                onClick={() => handleNavigate(item.path)}>
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="sidebar-logout danger" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Footer nav — mobile only */}
      <nav className="footer-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`footer-nav-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => handleNavigate(item.path)}>
            <span className="footer-nav-icon-wrap">
              <i className={`bi ${item.icon}`}></i>
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="footer-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            <span className="footer-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default StudentSidebar;
