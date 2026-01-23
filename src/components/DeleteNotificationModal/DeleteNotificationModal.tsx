import "./DeleteNotificationModal.css";

interface DeleteNotificationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  notificationTitle: string;
  isAll?: boolean;
}

const DeleteNotificationModal: React.FC<DeleteNotificationModalProps> = ({
  show,
  onClose,
  onConfirm,
  notificationTitle,
  isAll = false,
}) => {
  if (!show) return null;

  return (
    <div
      className={`modal fade show d-block`}
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(220, 53, 69, 0.15)" }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content modal-content-delete-notif">
          {/* header */}
          <div className="modal-header modal-header-delete-notif">
            <div className="modal-header-content">
              <div className="modal-icon-delete-notif">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div>
                <h5 className="modal-title">
                  {isAll ? "Delete All Notifications" : "Delete Notification"}
                </h5>
                <p className="modal-subtitle">This action cannot be undone</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}></button>
          </div>

          {/* body */}
          <div className="modal-body modal-body-delete-notif">
            <div className="delete-warning-icon-notif">
              <i className="bi bi-trash3"></i>
            </div>
            <h6 className="delete-question-notif">
              {isAll ?
                "Are you sure you want to delete all notifications?"
              : "Are you sure you want to delete this notification?"}
            </h6>
            {!isAll && (
              <div className="notification-title-display">
                <i className="bi bi-bell me-2"></i>
                <strong>{notificationTitle}</strong>
              </div>
            )}
            <p className="delete-warning-text-notif">
              {isAll ?
                "This will permanently remove all notifications from your account. This action cannot be undone."
              : "This will permanently remove this notification. This action cannot be undone."
              }
            </p>
          </div>

          {/* footer */}
          <div className="modal-footer modal-footer-delete-notif">
            <button
              type="button"
              className="btn btn-secondary btn-cancel-delete-notif"
              onClick={onClose}>
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-confirm-delete-notif"
              onClick={() => {
                onConfirm();
                onClose();
              }}>
              <i className="bi bi-trash me-2"></i>
              {isAll ? "Delete All" : "Delete Notification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteNotificationModal;
