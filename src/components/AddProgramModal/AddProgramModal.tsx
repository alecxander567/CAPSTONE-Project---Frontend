import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useAddProgram, useEditProgram } from "../../hooks/useProgram";
import type { ProgramData } from "../../hooks/useProgram";
import SuccessAlert from "../SuccessAlert/SuccessAlert";
import ErrorAlert from "../SuccessAlert/ErrorAlert";

interface AddProgramModalProps {
  show: boolean;
  handleClose: () => void;
  onProgramAdded: (program: ProgramData) => void;
  editProgram?: ProgramData | null;
  onProgramEdited?: (program: ProgramData) => void;
}

const AddProgramModal: React.FC<AddProgramModalProps> = ({
  show,
  handleClose,
  onProgramAdded,
  editProgram = null,
  onProgramEdited,
}) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { addProgram, loading: addLoading } = useAddProgram();
  const { editProgram: updateProgram, loading: editLoading } = useEditProgram();

  const loading = addLoading || editLoading;
  const isEditMode = !!editProgram;

  useEffect(() => {
    if (editProgram) {
      setCode(editProgram.code);
      setName(editProgram.name);
    } else {
      setCode("");
      setName("");
    }
  }, [editProgram, show]);

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) {
      setErrorMessage("Program code and name are required.");
      setShowError(true);
      return;
    }

    try {
      if (isEditMode && editProgram?.id) {
        const updated = await updateProgram(
          editProgram.id,
          code.trim().toUpperCase(),
          name.trim(),
        );
        onProgramEdited?.(updated);
      } else {
        const newProgram = await addProgram(
          code.trim().toUpperCase(),
          name.trim(),
        );
        onProgramAdded(newProgram);
      }

      setCode("");
      setName("");
      setShowSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ??
        "Something went wrong. Please try again.";
      setErrorMessage(message);
      setShowError(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
  };

  return (
    <>
      <SuccessAlert
        show={showSuccess}
        message={
          isEditMode ?
            "Program updated successfully!"
          : "Program added successfully!"
        }
        onClose={handleSuccessClose}
      />
      <ErrorAlert
        show={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
      />

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header
          closeButton
          className="border-0 pb-0"
          style={{ padding: "1.75rem 1.75rem 0" }}>
          <Modal.Title className="w-100">
            <div className="d-flex flex-column align-items-center text-center">
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  boxShadow: "0 8px 20px rgba(10, 26, 255, 0.3)",
                }}>
                <i
                  className={`bi ${isEditMode ? "bi-pencil-fill" : "bi-mortarboard-fill"} text-white fs-4`}></i>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                {isEditMode ? "Edit Program" : "Add New Program"}
              </h5>
              <p className="text-muted small mb-0">
                {isEditMode ?
                  "Update the program details"
                : "Create a new academic department"}
              </p>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "1.5rem 1.75rem" }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold small"
                style={{ color: "#475569" }}>
                <i className="bi bi-hash me-1"></i>Program Code
              </Form.Label>
              <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BSIT, BSED"
                style={{
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                  padding: "0.6rem 0.9rem",
                  fontSize: "0.95rem",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0a1aff")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
              <Form.Text className="text-muted small">
                Short identifier for the program (e.g. BSIT)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label
                className="fw-semibold small"
                style={{ color: "#475569" }}>
                <i className="bi bi-building me-1"></i>Program Name
              </Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bachelor of Science in Information Technology"
                style={{
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                  padding: "0.6rem 0.9rem",
                  fontSize: "0.95rem",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0a1aff")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
              <Form.Text className="text-muted small">
                Full name of the academic program
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer
          className="border-0"
          style={{ padding: "0 1.75rem 1.75rem" }}>
          <div className="w-100 d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={handleClose}
              disabled={loading}
              className="flex-fill fw-semibold"
              style={{ borderRadius: "10px", padding: "0.6rem" }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-fill fw-semibold border-0"
              style={{
                borderRadius: "10px",
                padding: "0.6rem",
                background: "linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%)",
                boxShadow: "0 4px 12px rgba(10, 26, 255, 0.25)",
              }}>
              {loading ?
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              : <>
                  <i
                    className={`bi ${isEditMode ? "bi-check-circle" : "bi-plus-circle"} me-2`}></i>
                  {isEditMode ? "Save Changes" : "Add Program"}
                </>
              }
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddProgramModal;
