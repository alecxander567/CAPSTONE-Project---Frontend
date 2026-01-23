import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Register } from "../../hooks/Register";
import AnimatedAlert from "../AnimatedAlert/AnimatedAlert";

interface RegisterModalProps {
  show: boolean;
  handleClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ show, handleClose }) => {
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [program, setProgram] = useState("");
  const [role, setRole] = useState<"admin" | "student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { register, loading, error } = Register();

  const handleRegister = async () => {
    try {
      await register({
        student_id_no: studentId || undefined,
        first_name: firstName,
        middle_initial: middleInitial || undefined,
        last_name: lastName,
        program,
        email,
        password,
        role,
      });

      setSuccessMessage("Registration successful!");
      setTimeout(() => {
        setSuccessMessage("");
        handleClose();
      }, 1500);
    } catch {
      // Error handled by the hook
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <div className="d-flex flex-column align-items-center">
            <div
              className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3"
              style={{ width: "70px", height: "70px" }}>
              <i className="bi bi-person-plus-fill text-primary fs-1"></i>
            </div>
            <h4 className="mb-1 fw-bold">Create Account</h4>
            <p className="text-muted small mb-0">Join our attendance system</p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        <Form>
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
            />
          </Form.Group>

          {/* Name Fields */}
          <Row className="g-3 mb-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  <i className="bi bi-person me-2"></i>First Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="py-2 border-2"
                  style={{ fontSize: "0.95rem" }}
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  M.I.
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="M"
                  maxLength={1}
                  value={middleInitial}
                  onChange={(e) =>
                    setMiddleInitial(e.target.value.toUpperCase())
                  }
                  className="py-2 border-2 text-center"
                  style={{ fontSize: "0.95rem" }}
                />
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Last Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="py-2 border-2"
                  style={{ fontSize: "0.95rem" }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Program and Role */}
          <Row className="g-3 mb-3">
            <Col md={7}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  <i className="bi bi-mortarboard me-2"></i>Program
                </Form.Label>
                <Form.Select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="py-2 border-2"
                  style={{ fontSize: "0.95rem" }}>
                  <option value="">Select your program</option>
                  <option value="BSED">
                    Bachelor of Secondary Education (BSED)
                  </option>
                  <option value="BSBA">
                    Bachelor of Science in Business Administration (BSBA)
                  </option>
                  <option value="BSIT">
                    Bachelor of Science in Information Technology (BSIT)
                  </option>
                  <option value="BSCRIM">
                    Bachelor of Science in Criminology (BSCRIM)
                  </option>
                  <option value="BPED">
                    Bachelor of Physical Education (BPED)
                  </option>
                  <option value="BEED">
                    Bachelor of Elementary Education (BEED)
                  </option>
                  <option value="BHumServ">
                    Bachelor of Human Services (BHumServ)
                  </option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  <i className="bi bi-shield-check me-2"></i>Role
                </Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "admin" | "student")
                  }
                  className="py-2 border-2"
                  style={{ fontSize: "0.95rem" }}>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-envelope me-2"></i>Email Address
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2 border-2"
              style={{ fontSize: "0.95rem" }}
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-lock me-2"></i>Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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
            <Form.Text className="text-muted small">
              Password must be at least 8 characters long
            </Form.Text>
          </Form.Group>
        </Form>

        {/* Alerts */}
        {successMessage && (
          <AnimatedAlert type="success" message={successMessage} />
        )}

        {error && <AnimatedAlert type="error" message={error} />}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4 pb-4">
        <div className="w-100 d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            className="flex-fill py-2 fw-semibold"
            disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRegister}
            disabled={loading}
            className="flex-fill py-2 fw-semibold">
            {loading ?
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"></span>
                Creating Account...
              </>
            : <>
                <i className="bi bi-check-circle me-2"></i>
                Create Account
              </>
            }
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default RegisterModal;
