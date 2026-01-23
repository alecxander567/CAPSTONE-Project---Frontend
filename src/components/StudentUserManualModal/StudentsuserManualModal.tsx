import { Modal, Button } from "react-bootstrap";

interface StudentUserManualModalProps {
  show: boolean;
  onHide: () => void;
}

const StudentUserManualModal = ({
  show,
  onHide,
}: StudentUserManualModalProps) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-person-fill text-primary me-2"></i>
          Student User Manual
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Login / Register */}
        <h6 className="fw-bold mb-3">
          <i className="bi bi-box-arrow-in-right text-primary me-2"></i>
          Account Access
        </h6>
        <ol className="text-muted small mb-4">
          <li>Sign in or register your account</li>
          <li>You will be redirected to the student dashboard</li>
        </ol>

        {/* Viewing Attendance Log */}
        <h6 className="fw-bold mb-3">
          <i className="bi bi-list-check text-primary me-2"></i>
          Viewing Attendance Log
        </h6>
        <ol className="text-muted small mb-4">
          <li>
            Navigate to the sidebar and select{" "}
            <strong>Attendance History</strong>
          </li>
          <li>Select the event</li>
          <li>
            You will see the list of students with your record displayed at the
            very top
          </li>
        </ol>

        {/* Fingerprint Enrollment */}
        <h6 className="fw-bold mb-3">
          <i className="bi bi-fingerprint text-primary me-2"></i>
          Fingerprint Enrollment
        </h6>
        <ol className="text-muted small mb-4">
          <li>
            Enroll your fingerprint (Go to <strong>OSA</strong> for enrollment)
          </li>
          <li>Place your finger on the sensor</li>
          <li>A notification will be sent from the hardware device</li>
          <li>Verify enrollment by checking your profile status</li>
        </ol>

        {/* Attendance Recording */}
        <h6 className="fw-bold mb-3">
          <i className="bi bi-calendar-check-fill text-primary me-2"></i>
          Attendance Recording
        </h6>
        <ol className="text-muted small">
          <li>Place your fingerprint on the sensor</li>
          <li>A notification will be sent from the hardware device</li>
          <li>Verify your attendance by checking the attendance log</li>
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

export default StudentUserManualModal;
