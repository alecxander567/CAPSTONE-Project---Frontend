import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { usePassword } from "../../hooks/Password";
import AnimatedAlert from "../AnimatedAlert/AnimatedAlert";
import ResetPasswordModal from "../ResetPasswordModal/ResetPasswordModal"; 

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ show, onClose }: ForgotPasswordModalProps) => {
  const [mobilePhone, setMobilePhone] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const { forgotPassword, loading, error } = usePassword();

  const handleSubmit = async () => {
    if (!mobilePhone) return;

    try {
      const response = await forgotPassword(mobilePhone);
      // Store the token from response
      setResetToken(response.token);
      setIsVerified(true);
      // Close this modal and open reset password modal after short delay
      setTimeout(() => {
        setShowResetModal(true);
        onClose();
      }, 1500);
    } catch (err) {
      // Error already handled by hook
      console.error("Failed to get reset token:", err);
    }
  };

  const handleClose = () => {
    setMobilePhone("");
    setResetToken("");
    setIsVerified(false);
    onClose();
  };

  return (
    <>
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
                Enter your registered mobile number to reset password
              </p>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 pb-4">
          {!isVerified ?
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  <i className="bi bi-phone me-2"></i>Mobile Phone Number
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="e.g., 09123456789"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  disabled={loading}
                  className="py-2"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !loading && mobilePhone) {
                      handleSubmit();
                    }
                  }}
                />
                <Form.Text className="text-muted small">
                  Enter the mobile number you used when registering
                </Form.Text>
              </Form.Group>
            </Form>
          : <AnimatedAlert
              type="success"
              message="Phone number verified! Please set your new password."
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
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || !mobilePhone || isVerified}
                className="flex-fill py-2 fw-semibold">
                {loading ?
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"></span>
                    Verifying...
                  </>
                : <>
                    <i className="bi bi-check-circle me-2"></i>
                    Verify & Continue
                  </>
                }
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal - opens after verification */}
      <ResetPasswordModal
        show={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetToken("");
          setIsVerified(false);
          setMobilePhone("");
        }}
        token={resetToken}
      />
    </>
  );
};

export default ForgotPasswordModal;
