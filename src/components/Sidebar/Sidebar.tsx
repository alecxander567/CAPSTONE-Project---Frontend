import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../../hooks/Logout";
import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifyEvents";
import logo from "../../assets/logo.jpg";

const Sidebar = () => {
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

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        <i className="bi bi-list"></i>
        <img
          src={logo}
          alt="Logo"
          width="40"
          height="40"
          className="d-inline-block align-top rounded-circle me-2"
        />
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
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
              <span>Calendar</span>
            </li>

            <li
              className={isActive("/attendance") ? "active" : ""}
              onClick={() => handleNavigate("/attendance")}>
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
    </>
  );
};

export default Sidebar;
