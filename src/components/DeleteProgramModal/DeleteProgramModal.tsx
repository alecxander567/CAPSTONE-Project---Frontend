import "./DeleteProgramModal.css";

interface DeleteProgramModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  programName: string;
}

const DeleteProgramModal: React.FC<DeleteProgramModalProps> = ({
  show,
  onClose,
  onConfirm,
  programName,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(220, 53, 69, 0.15)" }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content modal-content-delete">
          {/* Header */}
          <div className="modal-header modal-header-delete">
            <div className="modal-header-content">
              <div className="modal-icon-delete">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div>
                <h5 className="modal-title">Delete Program</h5>
                <p className="modal-subtitle">This action cannot be undone</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body modal-body-delete">
            <div className="delete-warning-icon">
              <i className="bi bi-trash3"></i>
            </div>
            <h6 className="delete-question">
              Are you sure you want to delete this program?
            </h6>
            <div className="event-title-display">
              <i className="bi bi-mortarboard-fill me-2"></i>
              <strong>{programName}</strong>
            </div>
            <p className="delete-warning-text">
              This will permanently remove the program. Students enrolled in
              this program will be unassigned. This action cannot be undone.
            </p>
          </div>

          {/* Footer */}
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
              Delete Program
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProgramModal;
