import { useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useNotifications } from "../../hooks/useNotifyEvents";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";
import DeleteNotificationModal from "../../components/DeleteNotificationModal/DeleteNotificationModal";
import "./Notifications.css";

const Notifications = () => {
  const {
    notifications,
    isDeleting,
    deletingIds,
    markingIds,
    error,
    isMarkingAll,
    successMessage,
    errorMessage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    clearSuccessMessage,
    clearErrorMessage,
  } = useNotifications();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number | null;
    title: string;
    isAll: boolean;
  }>({
    id: null,
    title: "",
    isAll: false,
  });

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      return b.id - a.id;
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleDeleteClick = (id: number, title: string) => {
    setDeleteTarget({ id, title, isAll: false });
    setShowDeleteModal(true);
  };

  const handleDeleteAllClick = () => {
    setDeleteTarget({ id: null, title: "", isAll: true });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteTarget.isAll) {
        await deleteAllNotifications();
      } else if (deleteTarget.id) {
        await deleteNotification(deleteTarget.id);
      }
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  return (
    <>
      <Sidebar />

      <DeleteNotificationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        notificationTitle={deleteTarget.title}
        isAll={deleteTarget.isAll}
      />

      <SuccessAlert
        show={!!successMessage}
        message={successMessage || ""}
        onClose={clearSuccessMessage}
      />

      <ErrorAlert
        show={!!errorMessage}
        message={errorMessage || ""}
        onClose={clearErrorMessage}
      />

      <main className="page-content">
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
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="mark-all-btn"
                  style={{ marginRight: "10px" }}>
                  <i className="bi bi-check-all"></i>
                  {isMarkingAll ? "Marking..." : "Mark All as Read"}
                </button>
              )}
              {sortedNotifications.length > 0 && (
                <button
                  onClick={handleDeleteAllClick}
                  disabled={isDeleting}
                  className="clear-all-btn">
                  <i className="bi bi-trash"></i>
                  {isDeleting ? "Clearing..." : "Clear All"}
                </button>
              )}
            </div>
          </div>
        </header>

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
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: "10px", color: "#dc3545" }}>
                      ({unreadCount} unread)
                    </span>
                  )}
                </div>

                {sortedNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-card ${!n.is_read ? "unread" : ""}`}>
                    <div className="notification-card-header">
                      <div className="notification-info">
                        <h4>
                          {n.title}
                          {!n.is_read && (
                            <span
                              style={{
                                marginLeft: "10px",
                                fontSize: "10px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                              }}>
                              NEW
                            </span>
                          )}
                        </h4>
                        <div className="notification-timestamp">
                          <i className="bi bi-clock"></i>
                          {new Date(n.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="notification-action-group">
                        {!n.is_read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            disabled={markingIds.includes(n.id)}
                            className="mark-read-btn"
                            title="Mark as read">
                            <i className="bi bi-check"></i>
                            {markingIds.includes(n.id) ?
                              "Marking..."
                            : "Mark Read"}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteClick(n.id, n.title)}
                          disabled={deletingIds.includes(n.id)}
                          className="delete-btn"
                          title="Delete notification">
                          <i className="bi bi-trash"></i>
                          {deletingIds.includes(n.id) ?
                            "Deleting..."
                          : "Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="notification-message">{n.message}</p>
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
