import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useRegister } from "../../hooks/Register";
import type { RegisterPayload } from "../../hooks/Register";
import { usePrograms } from "../../hooks/useProgram";
import type { ProgramData } from "../../hooks/useProgram";

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
                  <i className="bi bi-person me-2"></i>First Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="py-2 border-2"
                  style={{ fontSize: "0.95rem" }}
                  required
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
                  Last Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="py-2 border-2"
                  style={{ fontSize: "0.95rem" }}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Role */}
          <Row className="g-3 mb-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  <i className="bi bi-shield-check me-2"></i>Role
                </Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as "ADMIN" | "STUDENT");
                    if (e.target.value === "ADMIN") {
                      setProgramId("");
                      setYearLevel("");
                    }
                  }}
                  className="py-2 border-2"
                  style={{ fontSize: "0.95rem" }}>
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Administrator</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Program and Year Level — only for students */}
          {role === "STUDENT" && (
            <Row className="g-3 mb-3">
              <Col md={7}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    <i className="bi bi-mortarboard me-2"></i>Program *
                  </Form.Label>
                  <Form.Select
                    value={programId}
                    onChange={(e) => setProgramId(Number(e.target.value))}
                    className="py-2 border-2"
                    style={{ fontSize: "0.95rem" }}
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
                    <p className="small text-muted mt-1">Loading programs...</p>
                  )}
                  {programsError && (
                    <p className="small text-danger mt-1">{programsError}</p>
                  )}
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    <i className="bi bi-building me-2"></i>Year Level *
                  </Form.Label>
                  <Form.Select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="py-2 border-2"
                    style={{ fontSize: "0.95rem" }}
                    required>
                    <option value="">Select your year level</option>
                    <option value="1st year">1st Year</option>
                    <option value="2nd year">2nd Year</option>
                    <option value="3rd year">3rd Year</option>
                    <option value="4th year">4th Year</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* Mobile Phone */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-phone me-2"></i>Mobile Phone Number *
            </Form.Label>
            <Form.Control
              type="tel"
              placeholder="+63 912 345 6789"
              value={mobilePhone}
              onChange={(e) => setMobilePhone(e.target.value)}
              className="py-2 border-2"
              style={{ fontSize: "0.95rem" }}
              required
            />
            <Form.Text className="text-muted small">
              Enter your mobile phone number (e.g., +63 912 345 6789)
            </Form.Text>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-lock me-2"></i>Password *
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2 border-2 pe-5"
                style={{ fontSize: "0.95rem" }}
                required
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

        {localError && <AnimatedAlert type="error" message={localError} />}
        {error && <AnimatedAlert type="error" message={error} />}
        {successMessage && (
          <AnimatedAlert type="success" message={successMessage} />
        )}
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
