import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { usePassword } from "../../hooks/Password";
import AnimatedAlert from "../AnimatedAlert/AnimatedAlert";

interface ResetPasswordModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
}

const ResetPasswordModal = ({
  show,
  onClose,
  token,
}: ResetPasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { resetPassword, loading, error } = usePassword();

  const handleReset = async () => {
    setValidationError("");

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccessMessage("Password reset successful!");
      setTimeout(() => {
        onClose();
        setPassword("");
        setConfirmPassword("");
        setSuccessMessage("");
      }, 1500);
    } catch {
      // error already handled by hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleReset();
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex flex-column align-items-center">
            <div
              className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
              style={{ width: "70px", height: "70px" }}>
              <i className="bi bi-shield-lock-fill text-primary fs-1"></i>
            </div>
            <h4 className="mb-1 fw-bold">Create New Password</h4>
            <p className="text-muted small mb-0">
              Enter a strong password for your account
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        <Form onKeyPress={handleKeyPress}>
          {/* New Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-lock me-2"></i>New Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2 border-2 pe-5"
                style={{ fontSize: "0.95rem" }}
                autoFocus
              />
              <i
                className={`bi ${
                  showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                } position-absolute top-50 end-0 translate-middle-y me-3 text-secondary`}
                style={{ cursor: "pointer", fontSize: "1.1rem" }}
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
              />
            </div>
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-lock-fill me-2"></i>Confirm Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="py-2 border-2 pe-5"
                style={{ fontSize: "0.95rem" }}
              />
              <i
                className={`bi ${
                  showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                } position-absolute top-50 end-0 translate-middle-y me-3 text-secondary`}
                style={{ cursor: "pointer", fontSize: "1.1rem" }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                role="button"
                tabIndex={0}
              />
            </div>
          </Form.Group>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mb-3">
              <small className="text-muted">Password strength:</small>
              <div className="progress" style={{ height: "5px" }}>
                <div
                  className={`progress-bar ${
                    password.length < 6 ? "bg-danger"
                    : password.length < 10 ? "bg-warning"
                    : "bg-success"
                  }`}
                  style={{
                    width: `${Math.min((password.length / 12) * 100, 100)}%`,
                  }}></div>
              </div>
              <small
                className={`${
                  password.length < 6 ? "text-danger"
                  : password.length < 10 ? "text-warning"
                  : "text-success"
                }`}>
                {password.length < 6 ?
                  "Weak"
                : password.length < 10 ?
                  "Good"
                : "Strong"}
              </small>
            </div>
          )}
        </Form>

        {/* Alerts */}
        {successMessage && (
          <AnimatedAlert type="success" message={successMessage} />
        )}
        {validationError && (
          <AnimatedAlert type="error" message={validationError} />
        )}
        {error && <AnimatedAlert type="error" message={error} />}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4 pb-4">
        <div className="w-100">
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={onClose}
              className="flex-fill py-2 fw-semibold"
              disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReset}
              disabled={loading || !password || !confirmPassword}
              className="flex-fill py-2 fw-semibold">
              {loading ?
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"></span>
                  Resetting...
                </>
              : <>
                  <i className="bi bi-check-circle me-2"></i>
                  Reset Password
                </>
              }
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetPasswordModal;
