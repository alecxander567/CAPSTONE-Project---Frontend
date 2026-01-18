import { useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { useNotifications } from "../hooks/useNotifyEvents";
import SuccessAlert from "../components/SuccessAlert";
import ErrorAlert from "../components/ErrorAlert";
import "./Notifications/Notifications.css";

const Notifications = () => {
  const {
    notifications,
    error,
    isDeleting,
    deletingIds,
    successMessage,
    errorMessage,
    deleteNotification,
    deleteAllNotifications,
    clearSuccessMessage,
    clearErrorMessage,
  } = useNotifications();

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      return b.id - a.id;
    });
  }, [notifications]);

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) {
      return;
    }

    try {
      await deleteAllNotifications();
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  return (
    <>
      <Sidebar />

      {/* Success Alert */}
      <SuccessAlert
        show={!!successMessage}
        message={successMessage || ""}
        onClose={clearSuccessMessage}
      />

      {/* Error Alert */}
      <ErrorAlert
        show={!!errorMessage}
        message={errorMessage || ""}
        onClose={clearErrorMessage}
      />

      <main className="page-content">
        {/* Notifications Header */}
        <header className="notifications-header">
          <div className="wave"></div>

          <div className="notifications-header-content">
            <div className="notifications-header-left">
              <div className="notifications-header-icon">
                <i className="bi bi-bell-fill"></i>
              </div>

              <div className="notifications-header-text">
                <h1>Notifications</h1>
                <p>Stay updated with real-time event notifications</p>
              </div>
            </div>

            <div className="notifications-header-actions">
              {/* Delete All Button */}
              {sortedNotifications.length > 0 && (
                <button
                  onClick={deleteAllNotifications}
                  disabled={isDeleting}
                  className="clear-all-btn">
                  <i className="bi bi-trash"></i>
                  {isDeleting ? "Clearing..." : "Clear All"}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Notifications Content */}
        <div className="notifications-content">
          {error && <p className="text-danger">{error}</p>}

          <div className="notifications-wrapper">
            {sortedNotifications.length === 0 ?
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="bi bi-bell-slash"></i>
                </div>
                <h3>No notifications yet</h3>
                <p>
                  You'll receive real-time notifications when events are
                  starting
                </p>
              </div>
            : <>
                <div className="notification-count">
                  <strong>{sortedNotifications.length}</strong> notification
                  {sortedNotifications.length !== 1 ? "s" : ""}
                </div>

                {sortedNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-card ${!n.is_read ? "unread" : ""}`}>
                    <div className="notification-card-header">
                      <div className="notification-info">
                        <h4>{n.title}</h4>
                        <div className="notification-timestamp">
                          <i className="bi bi-clock"></i>
                          {new Date(n.timestamp).toLocaleString()}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        disabled={deletingIds.includes(n.id)}
                        className="delete-btn"
                        title="Delete notification">
                        <i className="bi bi-trash"></i>
                        {deletingIds.includes(n.id) ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    <p className="notification-message">{n.message}</p>

                    {n.event_id && (
                      <div className="notification-event-id">
                        <i className="bi bi-calendar-event"></i>
                        Event ID: {n.event_id}
                      </div>
                    )}
                  </div>
                ))}
              </>
            }
          </div>
        </div>
      </main>
    </>
  );
};

export default Notifications;
