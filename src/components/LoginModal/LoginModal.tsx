import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useLogin } from "../../hooks/Login";
import AnimatedAlert from "../AnimatedAlert/AnimatedAlert";
import { useNavigate } from "react-router-dom";
import RegisterModal from "../RegisterModal/RegisterModal";
import ResetPasswordModal from "../ResetPasswordModal/ResetPasswordModal";
import ForgotPasswordModal from "../ForgotPasswordModal/ForgotPasswordModal";
import "./LoginModal.css";

interface LoginModalProps {
  show: boolean;
  handleClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, handleClose }) => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const { login, loading, error } = useLogin();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await login({
        student_id_no: studentId,
        password: password,
      });

      setSuccessMessage(data.message || "Login successful! Redirecting...");

      setTimeout(() => {
        setSuccessMessage("");
        handleClose();

        if (data.role === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/student-dashboard", { replace: true });
        }
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  const handleOpenRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      dialogClassName="glass-modal-dialog"
      contentClassName="glass-modal-content">
      <Modal.Header closeButton className="glass-modal-header border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex flex-column align-items-center">
            <div className="glass-icon-circle mb-3">
              <i className="bi bi-box-arrow-in-right fs-2"></i>
            </div>
            <h4 className="mb-1 fw-bold text-white">Welcome Back</h4>
            <p className="glass-subtitle small mb-0">
              Sign in to continue to your account
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        <Form onKeyPress={handleKeyPress}>
          {/* Student ID */}
          <Form.Group className="mb-3">
            <Form.Label className="glass-label fw-semibold small">
              <i className="bi bi-credit-card me-2"></i>Student ID or Account ID
              (For Admin)
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your student ID number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="glass-input py-2"
              style={{ fontSize: "0.95rem" }}
              autoFocus
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="glass-label fw-semibold small mb-0">
                <i className="bi bi-lock me-2"></i>Password
              </Form.Label>
              <a
                href="#"
                className="glass-link text-decoration-none small"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgot(true);
                }}>
                Forgot password?
              </a>
            </div>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input py-2 pe-5"
                style={{ fontSize: "0.95rem" }}
              />
              <i
                className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} position-absolute top-50 end-0 translate-middle-y me-3 glass-eye-icon`}
                style={{ cursor: "pointer", fontSize: "1.1rem" }}
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
              />
            </div>
          </Form.Group>
        </Form>

        {successMessage && (
          <AnimatedAlert type="success" message={successMessage} />
        )}
        {error && <AnimatedAlert type="error" message={error} />}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4 pb-4">
        <div className="w-100">
          <div className="d-flex gap-2 mb-3">
            <Button
              onClick={handleClose}
              className="glass-btn-cancel flex-fill py-2 fw-semibold"
              disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="glass-btn-primary flex-fill py-2 fw-semibold">
              {loading ?
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"></span>
                  Signing in...
                </>
              : <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </>
              }
            </Button>
          </div>

          <div className="text-center">
            <span className="glass-subtitle small">
              Don't have an account?{" "}
              <a
                href="#"
                className="glass-link text-decoration-none fw-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenRegister();
                }}>
                Sign up
              </a>
            </span>
          </div>
        </div>
      </Modal.Footer>

      <ForgotPasswordModal
        show={showForgot}
        onClose={() => setShowForgot(false)}
        onSuccess={(token) => {
          setResetToken(token);
          setShowForgot(false);
          setShowReset(true);
        }}
      />

      <ResetPasswordModal
        show={showReset}
        token={resetToken}
        onClose={() => setShowReset(false)}
      />

      <RegisterModal show={showRegister} handleClose={handleCloseRegister} />
    </Modal>
  );
};

export default LoginModal;
