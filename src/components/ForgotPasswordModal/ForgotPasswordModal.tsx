import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { usePassword } from "../../hooks/Password";
import AnimatedAlert from "../AnimatedAlert/AnimatedAlert";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ show, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword, loading, error } = usePassword();

  const handleSubmit = async () => {
    if (!email) return;

    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      // Error already handled by hook
      console.error("Failed to send reset email:", err);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex flex-column align-items-center">
            <div
              className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
              style={{ width: "70px", height: "70px" }}>
              <i className="bi bi-key-fill text-primary fs-1"></i>
            </div>
            <h4 className="mb-1 fw-bold">Forgot Password?</h4>
            <p className="text-muted small mb-0">
              Enter your registered email to reset your password
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        {!submitted ?
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                <i className="bi bi-envelope me-2"></i>Email Address
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="e.g., yourname@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="py-2"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !loading && email) {
                    handleSubmit();
                  }
                }}
              />
              <Form.Text className="text-muted small">
                Enter the email you used when registering
              </Form.Text>
            </Form.Group>
          </Form>
        : <AnimatedAlert
            type="success"
            message="If that email is registered, a reset link has been sent. Please check your inbox."
          />
        }

        {error && <AnimatedAlert type="error" message={error} />}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4 pb-4">
        <div className="w-100">
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              className="flex-fill py-2 fw-semibold"
              disabled={loading}>
              {submitted ? "Close" : "Cancel"}
            </Button>
            {!submitted && (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || !email}
                className="flex-fill py-2 fw-semibold">
                {loading ?
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"></span>
                    Sending...
                  </>
                : <>
                    <i className="bi bi-send me-2"></i>
                    Send Reset Link
                  </>
                }
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ForgotPasswordModal;
