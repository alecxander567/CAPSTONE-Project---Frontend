import { Modal, Button, Card } from "react-bootstrap";

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
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex flex-column align-items-center">
            <div
              className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
              style={{ width: "70px", height: "70px" }}>
              <i className="bi bi-person-fill text-primary fs-1"></i>
            </div>
            <h4 className="mb-1 fw-bold">Student User Manual</h4>
            <p className="text-muted small mb-0">Quick guide for students</p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-4">
        {/* Login / Register */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-box-arrow-in-right text-primary me-2"></i>
              Account Access
            </h5>
            <ol className="mb-0" style={{ lineHeight: "1.8" }}>
              <li className="mb-2">
                <strong>Sign in</strong> to your existing account or{" "}
                <strong className="text-primary">register</strong> a new one
              </li>
              <li>
                You will be redirected to the <strong>student dashboard</strong>
              </li>
            </ol>
          </Card.Body>
        </Card>

        {/* Viewing Attendance Log */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-list-check text-primary me-2"></i>
              Viewing Attendance Log
            </h5>
            <ol className="mb-0" style={{ lineHeight: "1.8" }}>
              <li className="mb-2">
                Navigate to the sidebar and select{" "}
                <strong className="text-primary">Attendance History</strong>
              </li>
              <li className="mb-2">
                Select the <strong>event</strong> you want to view
              </li>
              <li>
                Your attendance record will be displayed at the{" "}
                <strong>very top</strong> of the list
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
                Visit the <strong className="text-info">OSA office</strong> for
                fingerprint enrollment
              </li>
              <li className="mb-2">
                <strong>Place your finger</strong> on the biometric sensor
              </li>
              <li className="mb-2">
                A <strong>success notification</strong> will be sent from the
                device
              </li>
              <li>
                Verify enrollment by checking your{" "}
                <strong>profile status</strong>
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
                <strong>Place your finger</strong> on the biometric sensor at
                the event location
              </li>
              <li className="mb-2">
                A <strong className="text-success">confirmation</strong> will be
                sent from the device
              </li>
              <li>
                Verify your attendance in the{" "}
                <strong>Attendance History</strong>
              </li>
            </ol>
          </Card.Body>
        </Card>

        {/* Help Footer */}
        <div className="alert alert-info border-0 mb-0">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <small>
              <strong>Having trouble?</strong> Contact your administrator or
              visit the OSA office for assistance.
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

export default StudentUserManualModal;
