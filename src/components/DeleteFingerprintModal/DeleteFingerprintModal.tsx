import "./DeleteFingerprint.css";

interface DeleteFingerprintModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
}

const DeleteFingerprintModal: React.FC<DeleteFingerprintModalProps> = ({
  show,
  onClose,
  onConfirm,
  studentName,
}) => {
  if (!show) return null;

  return (
    <div
      className={`modal fade show d-block`}
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(220, 53, 69, 0.15)" }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content modal-content-delete">
          {/* header */}
          <div className="modal-header modal-header-delete">
            <div className="modal-header-content">
              <div className="modal-icon-delete">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div>
                <h5 className="modal-title">Delete Fingerprint</h5>
                <p className="modal-subtitle">This action cannot be undone</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}></button>
          </div>

          {/* body */}
          <div className="modal-body modal-body-delete">
            <div className="delete-warning-icon">
              <i className="bi bi-fingerprint"></i>
            </div>
            <h6 className="delete-question">
              Are you sure you want to delete this fingerprint?
            </h6>
            <div className="student-name-display">
              <i className="bi bi-person-circle me-2"></i>
              <strong>{studentName}</strong>
            </div>
            <p className="delete-warning-text">
              This will permanently remove the fingerprint from the device and
              database. The student will need to re-enroll to mark attendance.
            </p>
          </div>

          {/* footer */}
          <div className="modal-footer modal-footer-delete">
            <button
              type="button"
              className="btn btn-secondary btn-cancel-delete"
              onClick={onClose}>
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-confirm-delete"
              onClick={() => {
                onConfirm();
                onClose();
              }}>
              <i className="bi bi-trash me-2"></i>
              Delete Fingerprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFingerprintModal;
