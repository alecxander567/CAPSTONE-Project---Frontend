import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useLogin } from "../hooks/Login";
import AnimatedAlert from "./AnimatedAlert";
import { useNavigate } from "react-router-dom";
import RegisterModal from "../components/RegisterModal";
import ResetPasswordModal from "./ResetPasswordModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

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

  const handleOpenRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  const { login, loading, error } = useLogin();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await login({
        student_id_no: studentId,
        password: password,
      });

      setSuccessMessage(data.message);

      localStorage.setItem("role", data.role);
      localStorage.setItem("student_id_no", data.student_id_no);

      setTimeout(() => {
        setSuccessMessage("");
        handleClose();

        if (data.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/student-dashboard");
        }
      }, 1000);
    } catch {
      // already handled in hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex flex-column align-items-center">
            <div
              className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
              style={{ width: "70px", height: "70px" }}>
              <i className="bi bi-box-arrow-in-right text-primary fs-1"></i>
            </div>
            <h4 className="mb-1 fw-bold">Welcome Back</h4>
            <p className="text-muted small mb-0">
              Sign in to continue to your account
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        <Form onKeyPress={handleKeyPress}>
          {/* Student ID */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-credit-card me-2"></i>Student ID
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your student ID number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="py-2 border-2"
              style={{ fontSize: "0.95rem" }}
              autoFocus
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="fw-semibold small text-secondary mb-0">
                <i className="bi bi-lock me-2"></i>Password
              </Form.Label>
              <a
                href="#"
                className="text-primary text-decoration-none small"
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
                className="py-2 border-2 pe-5"
                style={{ fontSize: "0.95rem" }}
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
        </Form>

        {/* Alerts */}
        {successMessage && (
          <AnimatedAlert type="success" message={successMessage} />
        )}
        {error && <AnimatedAlert type="error" message={error} />}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4 pb-4">
        <div className="w-100">
          <div className="d-flex gap-2 mb-3">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              className="flex-fill py-2 fw-semibold"
              disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogin}
              disabled={loading}
              className="flex-fill py-2 fw-semibold">
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

          {/* Sign up link */}
          <div className="text-center">
            <span className="text-muted small">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-primary text-decoration-none fw-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenRegister();
                }}>
                Sign up
              </a>
              {/* Register Modal */}
              <RegisterModal
                show={showRegister}
                handleClose={handleCloseRegister}
              />
            </span>
          </div>
        </div>
      </Modal.Footer>

      {/* Password Modals Modal */}
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
    </Modal>
  );
};

export default LoginModal;
