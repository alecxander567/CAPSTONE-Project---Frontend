import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useRegister } from "../../hooks/Register";
import type { RegisterPayload } from "../../hooks/Register";
import { usePrograms } from "../../hooks/useProgram";
import type { ProgramData } from "../../hooks/useProgram";
import { useAdminExists } from "../../hooks/useAdminExist";

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
  const [programId, setProgramId] = useState<number | "">("");
  const [role, setRole] = useState<"ADMIN" | "STUDENT">("STUDENT");
  const [mobilePhone, setMobilePhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [yearLevel, setYearLevel] = useState<string>("");
  const [localError, setLocalError] = useState("");

  const { register, loading, error } = useRegister();
  const {
    programs,
    loading: programsLoading,
    error: programsError,
  } = usePrograms();

  const adminExists = useAdminExists();

  const handleRegister = async () => {
    setLocalError("");

    if (!firstName.trim()) return setLocalError("First name is required");
    if (!lastName.trim()) return setLocalError("Last name is required");
    if (!mobilePhone.trim()) return setLocalError("Mobile phone is required");
    if (!password.trim()) return setLocalError("Password is required");

    if (role === "STUDENT") {
      if (!programId) return setLocalError("Program is required");
      if (!yearLevel) return setLocalError("Year level is required");
    }

    const payload: RegisterPayload = {
      student_id_no: studentId.trim() || undefined,
      first_name: firstName.trim(),
      middle_initial: middleInitial.trim() || undefined,
      last_name: lastName.trim(),
      program_id: role === "STUDENT" ? (programId as number) : undefined,
      year_level: role === "STUDENT" ? yearLevel : undefined,
      mobile_phone: mobilePhone.trim(),
      password: password.trim(),
      role: role.toLowerCase() as "admin" | "student",
    };

    try {
      await register(payload);
      setSuccessMessage("Registration successful!");
      setTimeout(() => {
        setSuccessMessage("");
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <>
      <style>{`
        /* ── Desktop: modal fits the viewport without internal scrolling ── */
        .register-modal .modal-dialog {
          margin: 1rem auto;
        }

        .register-modal .modal-content {
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 2rem);
        }

        .register-modal .modal-header {
          flex-shrink: 0;
          padding: 1rem 1.5rem 0.75rem;
        }

        .register-modal .modal-body {
          flex: 1 1 auto;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 1rem 1.5rem;
        }

        .register-modal .modal-footer {
          flex-shrink: 0;
          padding: 0.75rem 1.5rem 1rem;
          border-top: 1px solid #dee2e6;
          background: #fff;
        }

        /* compact form spacing on desktop */
        .register-modal .mb-3 {
          margin-bottom: 0.65rem !important;
        }

        .register-modal .form-control,
        .register-modal .form-select {
          padding-top: 0.4rem !important;
          padding-bottom: 0.4rem !important;
        }

        /* ── Mobile: full-screen ── */
        @media (max-width: 576px) {
          .register-modal .modal-dialog {
            margin: 0;
            max-width: 100%;
            height: 100%;
          }

          .register-modal .modal-content {
            height: 100%;
            border-radius: 0;
            max-height: 100%;
          }

          .register-modal .modal-header {
            padding: 1rem 1.25rem 0.75rem;
          }

          .register-modal .modal-body {
            padding: 0.75rem 1.25rem;
          }

          .register-modal .modal-footer {
            position: sticky;
            bottom: 0;
            z-index: 10;
            padding: 0.75rem 1.25rem;
          }

          /* restore normal spacing on mobile since it scrolls */
          .register-modal .mb-3 {
            margin-bottom: 0.85rem !important;
          }

          .register-modal .form-control,
          .register-modal .form-select {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
        }
      `}</style>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        backdrop="static"
        className="register-modal"
        scrollable>
        {/* ── Compact header ── */}
        <Modal.Header closeButton>
          <Modal.Title className="w-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "44px", height: "44px" }}>
                <i className="bi bi-person-plus-fill text-primary fs-5"></i>
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Create Account</h5>
                <p className="text-muted small mb-0">
                  Join our attendance system
                </p>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* Row 1: Student ID + Role side by side */}
            <Row className="g-2 mb-3">
              <Col md={7} xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    <i className="bi bi-credit-card me-1"></i>Student ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your student ID number"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="border-2"
                    style={{ fontSize: "0.9rem" }}
                  />
                </Form.Group>
              </Col>
              <Col md={5} xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    <i className="bi bi-shield-check me-1"></i>Role
                  </Form.Label>
                  <Form.Select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "ADMIN" | "STUDENT")
                    }
                    style={{ fontSize: "0.9rem" }}>
                    <option value="STUDENT">Student</option>
                    {!adminExists && (
                      <option value="ADMIN">Administrator</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2: First Name + M.I. + Last Name */}
            <Row className="g-2 mb-3">
              <Col md={5} xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    <i className="bi bi-person me-1"></i>First Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-2"
                    style={{ fontSize: "0.9rem" }}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2} xs={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
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
                    className="border-2 text-center"
                    style={{ fontSize: "0.9rem" }}
                  />
                </Form.Group>
              </Col>
              <Col md={5} xs={9}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    Last Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-2"
                    style={{ fontSize: "0.9rem" }}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3: Program + Year Level (students only) */}
            {role === "STUDENT" && (
              <Row className="g-2 mb-3">
                <Col md={7} xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary mb-1">
                      <i className="bi bi-mortarboard me-1"></i>Program *
                    </Form.Label>
                    <Form.Select
                      value={programId}
                      onChange={(e) => setProgramId(Number(e.target.value))}
                      className="border-2"
                      style={{ fontSize: "0.9rem" }}
                      required>
                      <option value="">Select your program</option>
                      {programs
                        .filter((prog: ProgramData) => prog.code !== "OSA")
                        .map((prog: ProgramData) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name} ({prog.code})
                          </option>
                        ))}
                    </Form.Select>
                    {programsLoading && (
                      <p className="small text-muted mt-1">
                        Loading programs...
                      </p>
                    )}
                    {programsError && (
                      <p className="small text-danger mt-1">{programsError}</p>
                    )}
                  </Form.Group>
                </Col>
                <Col md={5} xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary mb-1">
                      <i className="bi bi-building me-1"></i>Year Level *
                    </Form.Label>
                    <Form.Select
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="border-2"
                      style={{ fontSize: "0.9rem" }}
                      required>
                      <option value="">Select year level</option>
                      <option value="1st year">1st Year</option>
                      <option value="2nd year">2nd Year</option>
                      <option value="3rd year">3rd Year</option>
                      <option value="4th year">4th Year</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            )}

            {/* Row 4: Mobile Phone + Password side by side */}
            <Row className="g-2 mb-3">
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    <i className="bi bi-phone me-1"></i>Mobile Phone *
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="+63 912 345 6789"
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    className="border-2"
                    style={{ fontSize: "0.9rem" }}
                    required
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ fontSize: "0.78rem" }}>
                    e.g., +63 912 345 6789
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    <i className="bi bi-lock me-1"></i>Password *
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-2 pe-5"
                      style={{ fontSize: "0.9rem" }}
                      required
                    />
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} position-absolute top-50 end-0 translate-middle-y me-3 text-secondary`}
                      style={{ cursor: "pointer", fontSize: "1rem" }}
                      onClick={() => setShowPassword(!showPassword)}
                      role="button"
                      tabIndex={0}
                    />
                  </div>
                  <Form.Text
                    className="text-muted"
                    style={{ fontSize: "0.78rem" }}>
                    At least 8 characters
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>

          {localError && <AnimatedAlert type="error" message={localError} />}
          {error && <AnimatedAlert type="error" message={error} />}
          {successMessage && (
            <AnimatedAlert type="success" message={successMessage} />
          )}
        </Modal.Body>

        <Modal.Footer>
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
                    aria-hidden="true"
                  />
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
    </>
  );
};

export default RegisterModal;
