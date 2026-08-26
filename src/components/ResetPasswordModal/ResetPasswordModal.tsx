import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { usePassword } from "../../hooks/Password";
import AnimatedAlert from "../AnimatedAlert/AnimatedAlert";

const ResetPasswordModal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

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
      setSuccessMessage("Password reset successful! You can now log in.");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch {
      // error already handled by hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleReset();
    }
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6)
      return { text: "Weak", color: "danger", width: "33%" };
    if (password.length < 10)
      return { text: "Good", color: "warning", width: "66%" };
    return { text: "Strong", color: "success", width: "100%" };
  };

  const strength = getPasswordStrength();

  if (!token) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}>
        <div className="text-center px-4">
          <div
            className="bg-danger bg-opacity-10 rounded-circle p-3 mb-3 mx-auto d-flex align-items-center justify-content-center"
            style={{ width: "70px", height: "70px" }}>
            <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
          </div>
          <h4 className="fw-bold mb-2">Invalid Reset Link</h4>
          <p className="text-muted mb-4">
            This password reset link is missing or malformed. Please request a
            new one.
          </p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center px-3"
      style={{ minHeight: "100vh" }}>
      <div
        className="bg-white rounded-4 shadow-sm p-4 p-md-5 w-100"
        style={{ maxWidth: "480px" }}>
        <div className="d-flex flex-column align-items-center mb-4">
          <div
            className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
            style={{ width: "70px", height: "70px" }}>
            <i className="bi bi-shield-lock-fill text-primary fs-1"></i>
          </div>
          <h4 className="mb-1 fw-bold">Create New Password</h4>
          <p className="text-muted small mb-0 text-center">
            Enter a strong password for your account
          </p>
        </div>

        {!successMessage ?
          <Form onKeyPress={handleKeyPress}>
            {/* New Password */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                <i className="bi bi-lock me-2"></i>New Password
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="py-2 border-2 pe-5"
                  style={{ fontSize: "0.95rem" }}
                  autoFocus
                  disabled={loading}
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
                  disabled={loading}
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
            {password && strength && (
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Password strength:</small>
                  <small className={`text-${strength.color}`}>
                    {strength.text}
                  </small>
                </div>
                <div className="progress" style={{ height: "5px" }}>
                  <div
                    className={`progress-bar bg-${strength.color}`}
                    style={{
                      width: strength.width,
                      transition: "width 0.3s ease",
                    }}></div>
                </div>
              </div>
            )}

            {validationError && (
              <AnimatedAlert type="error" message={validationError} />
            )}
            {error && <AnimatedAlert type="error" message={error} />}

            <Button
              variant="primary"
              onClick={handleReset}
              disabled={loading || !password || !confirmPassword}
              className="w-100 py-2 fw-semibold mt-2">
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
          </Form>
        : <AnimatedAlert type="success" message={successMessage} />}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
