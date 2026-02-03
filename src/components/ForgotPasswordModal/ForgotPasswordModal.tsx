import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { Password } from "../../hooks/Password";
import AnimatedAlert from "../AnimatedAlert/AnimatedAlert";

interface Props {
  show: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const ForgotPasswordModal = ({ show, onClose, onSuccess }: Props) => {
  const [mobilePhone, setMobilePhone] = useState("");

  const { forgotPassword, loading, error } = Password();

  const handleSubmit = async () => {
    try {
      const res = await forgotPassword(mobilePhone);
      onSuccess(res.token);
    } catch {
      // error already handled by hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
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
              <i className="bi bi-key-fill text-primary fs-1"></i>
            </div>
            <h4 className="mb-1 fw-bold">Forgot Password?</h4>
            <p className="text-muted small mb-0">
              Enter your mobile phone number to recover your account
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        <Form onKeyPress={handleKeyPress}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-phone-fill me-2"></i>Mobile Phone Number
            </Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter your mobile phone number"
              value={mobilePhone}
              onChange={(e) => setMobilePhone(e.target.value)}
              className="py-2 border-2"
              style={{ fontSize: "0.95rem" }}
              autoFocus
            />
          </Form.Group>
        </Form>

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
              onClick={handleSubmit}
              disabled={loading || !mobilePhone.trim()}
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
                  <i className="bi bi-arrow-right-circle me-2"></i>
                  Continue
                </>
              }
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ForgotPasswordModal;
