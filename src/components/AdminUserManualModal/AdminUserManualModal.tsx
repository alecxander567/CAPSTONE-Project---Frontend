import { Modal, Button, Card } from "react-bootstrap";

interface AdminUserManualModalProps {
  show: boolean;
  onHide: () => void;
}

const AdminUserManualModal = ({ show, onHide }: AdminUserManualModalProps) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex flex-column align-items-center">
            <div
              className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
              style={{ width: "70px", height: "70px" }}>
              <i className="bi bi-shield-lock-fill text-primary fs-1"></i>
            </div>
            <h4 className="mb-1 fw-bold">Admin User Manual</h4>
            <p className="text-muted small mb-0">
              Complete guide for administrators
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-4">
        {/* Login Section */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-box-arrow-in-right text-primary me-2"></i>
              Login & Navigation
            </h5>
            <ol className="mb-0" style={{ lineHeight: "1.8" }}>
              <li className="mb-2">
                <strong>Login</strong> to your admin account using your
                credentials
              </li>
              <li className="mb-2">
                You will be redirected to the{" "}
                <strong>dashboard analytics</strong>
              </li>
              <li>
                Navigate to the <strong>sidebar menu</strong> to access
                different sections
              </li>
            </ol>
          </Card.Body>
        </Card>

        {/* Fingerprint Enrollment */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-fingerprint text-primary me-2"></i>
              Fingerprint Enrollment
            </h5>
            <ol className="mb-0" style={{ lineHeight: "1.8" }}>
              <li className="mb-2">
                Navigate to <strong>Programs</strong> from the sidebar
              </li>
              <li className="mb-2">
                Select the student's <strong>course/program</strong>
              </li>
              <li className="mb-2">
                Search for the student name and click the{" "}
                <strong className="text-primary">Enroll</strong> button
              </li>
              <li className="mb-2">
                Student will <strong>scan their fingerprint</strong> using the
                biometric device
              </li>
              <li>
                A <strong>success notification</strong> will appear after
                enrollment is complete
              </li>
            </ol>
          </Card.Body>
        </Card>

        {/* Attendance Recording */}
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-calendar-check-fill text-primary me-2"></i>
              Recording Attendance
            </h5>
            <ol className="mb-0" style={{ lineHeight: "1.8" }}>
              <li className="mb-2">
                Go to <strong>Events</strong> section
              </li>
              <li className="mb-2">
                Select the event and click{" "}
                <strong className="text-primary">View</strong>
              </li>
              <li className="mb-2">
                Click{" "}
                <strong className="text-success">
                  Start Recording Attendance
                </strong>
              </li>
              <li>
                Attendance data will be <strong>automatically received</strong>{" "}
                from the biometric device
              </li>
            </ol>
          </Card.Body>
        </Card>

        {/* Help Footer */}
        <div className="alert alert-info border-0 mb-0">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <small>
              <strong>Need help?</strong> Contact technical support for
              assistance.
            </small>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4 pb-4">
        <Button
          variant="primary"
          onClick={onHide}
          className="px-4 py-2 fw-semibold">
          <i className="bi bi-check-circle me-2"></i>
          Got it
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminUserManualModal;
