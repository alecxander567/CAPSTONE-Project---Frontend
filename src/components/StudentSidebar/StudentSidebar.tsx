import "./StudentSidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../../hooks/Logout";
import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifyEvents";
import logo from "../../assets/logo.jpg";

const StudentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogout();
  const { notifications } = useNotifications();

  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
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
      {/* Desktop toggle button (tablet range) */}
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        <div className="toggle-left">
          <i className="bi bi-list"></i>
          <img
            src={logo}
            alt="Logo"
            width="36"
            height="36"
            className="toggle-logo"
          />
        </div>
      </button>

      {/* Sidebar — desktop only */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
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
        <button className="footer-nav-item footer-logout" onClick={logout}>
          <span className="footer-nav-icon-wrap">
            <i className="bi bi-box-arrow-right"></i>
          </span>
          <span className="footer-nav-label">Logout</span>
        </button>
      </nav>
    </>
  );
};

export default StudentSidebar;
