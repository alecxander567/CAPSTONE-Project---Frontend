import { Modal, Button } from "react-bootstrap";

interface AdminUserManualModalProps {
  show: boolean;
  onHide: () => void;
}

const AdminUserManualModal = ({ show, onHide }: AdminUserManualModalProps) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-shield-lock-fill text-primary me-2"></i>
          Admin User Manual
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Login Section */}
        <h6 className="fw-bold mb-3">
          <i className="bi bi-box-arrow-in-right text-primary me-2"></i>
          Login & Navigation
        </h6>
        <ol className="text-muted small mb-4">
          <li>Login / Sign in to your account</li>
          <li>
            You will be redirected to the dashboard analytics and navigate to
            the sidebar to access other menus
          </li>
        </ol>

        {/* Fingerprint Enrollment */}
        <h6 className="fw-bold mb-3">
          <i className="bi bi-fingerprint text-primary me-2"></i>
          Fingerprint Enrollment
        </h6>
        <ol className="text-muted small mb-4">
          <li>
            Go to <strong>Programs</strong>
          </li>
          <li>Select the student's course</li>
          <li>Search for the student name and click the enroll button</li>
          <li>Student will scan their fingerprint using the hardware device</li>
          <li>A notification will be sent after successful enrollment</li>
        </ol>

        {/* Attendance Recording */}
        <h6 className="fw-bold mb-3">
          <i className="bi bi-calendar-check-fill text-primary me-2"></i>
          Recording Attendance
        </h6>
        <ol className="text-muted small">
          <li>
            Go to <strong>Events</strong>
          </li>
          <li>
            Select the event and click <strong>View</strong>
          </li>
          <li>
            Click <strong>Start Recording Attendance</strong>
          </li>
          <li>
            Attendance data will be automatically received from the hardware
            device
          </li>
        </ol>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminUserManualModal;
