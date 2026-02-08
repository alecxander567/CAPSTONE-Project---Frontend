import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import SuccessAlert from "../SuccessAlert/SuccessAlert";
import ErrorAlert from "../SuccessAlert/ErrorAlert";
import "./EnrollmentModal.css";

type FingerprintStatus = "not_enrolled" | "pending" | "enrolled" | "failed";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  userId: number;
  fingerId: number;
  updateStatus: (studentId: number, status: FingerprintStatus) => void;
}

type EnrollmentStepUI = {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: "waiting" | "active" | "completed" | "failed";
};

const EnrollmentModal = ({
  isOpen,
  onClose,
  userId,
  updateStatus,
}: EnrollmentModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(10);

  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const [steps, setSteps] = useState<EnrollmentStepUI[]>([
    {
      id: 1,
      title: "Waiting for Finger",
      description: "Place your finger on the sensor...",
      icon: "bi-hand-index-thumb",
      status: "active",
    },
    {
      id: 2,
      title: "Capturing Image",
      description: "Processing first fingerprint image...",
      icon: "bi-camera",
      status: "waiting",
    },
    {
      id: 3,
      title: "Remove Finger",
      description: "Lift your finger from the sensor",
      icon: "bi-arrow-up-circle",
      status: "waiting",
    },
    {
      id: 4,
      title: "Place Again",
      description: "Place the SAME finger again...",
      icon: "bi-hand-index-thumb",
      status: "waiting",
    },
    {
      id: 5,
      title: "Storing",
      description: "Saving fingerprint to database...",
      icon: "bi-database",
      status: "waiting",
    },
  ]);

  const clearTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    pollRef.current = null;
    timeoutRef.current = null;
    countdownRef.current = null;
  };

  const resetTimeout = useCallback(() => {
    clearTimers();

    queueMicrotask(() => {
      setTimeoutSeconds(10);
    });

    countdownRef.current = setInterval(() => {
      setTimeoutSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      setErrorMessage("No fingerprint detected. Enrollment timed out.");
      updateStatus(userId, "failed");
      setShowError(true);
      onClose?.();
      clearTimers();
    }, 10000);
  }, [userId, updateStatus, onClose]); 

  const updateStepUI = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setSteps((prev) =>
      prev.map((s, idx) => ({
        ...s,
        status:
          idx < stepIndex ? "completed"
          : idx === stepIndex ? "active"
          : "waiting",
      })),
    );
  };

  useEffect(() => {
    if (!isOpen) {
      clearTimers();

      queueMicrotask(() => {
        setCurrentStep(0);
        setShowSuccess(false);
        setShowError(false);
        setTimeoutSeconds(10);
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i === 0 ? "active" : "waiting",
          })),
        );
      });

      return;
    }

    resetTimeout();

    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8000/fingerprints/enrollment-status/${userId}`,
        );

        resetTimeout();

        switch (data.step) {
          case "waiting_first_finger":
            updateStepUI(0);
            break;
          case "capturing_first":
            updateStepUI(1);
            break;
          case "remove_finger":
            updateStepUI(2);
            break;
          case "waiting_second_finger":
            updateStepUI(3);
            break;
          case "storing":
            updateStepUI(4);
            break;
        }

        if (data.status === "success") {
          clearTimers();
          updateStatus(userId, "enrolled");
          setShowSuccess(true);
          setTimeout(() => onClose?.(), 800);
        }

        if (data.status === "failed") {
          clearTimers();
          updateStatus(userId, "failed");
          setErrorMessage(data.message || "Enrollment failed");
          setShowError(true);
          setTimeout(() => onClose?.(), 800);
        }
      } catch (err) {
        console.error("Enrollment polling error:", err);
      }
    }, 1000);

    return clearTimers;
  }, [isOpen, userId, resetTimeout, updateStatus, onClose]);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <div className="enrollment-modal-overlay">
        <div className="enrollment-modal-content">
          <div className="enrollment-header">
            <i className="bi bi-fingerprint enrollment-icon"></i>
            <h2>Fingerprint Enrollment</h2>
            <p>Please follow the steps below</p>

            {timeoutSeconds <= 5 && timeoutSeconds > 0 && (
              <div className="timeout-warning">
                <i className="bi bi-exclamation-triangle"></i>
                <span>Auto-closing in {timeoutSeconds}s...</span>
              </div>
            )}
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="enrollment-steps">
            {steps.map((step) => (
              <div key={step.id} className={`enrollment-step ${step.status}`}>
                <div className="step-indicator">
                  {step.status === "completed" ?
                    <i className="bi bi-check-circle-fill" />
                  : step.status === "failed" ?
                    <i className="bi bi-x-circle-fill" />
                  : step.status === "active" ?
                    <div className="step-spinner" />
                  : <div className="step-number">{step.id}</div>}
                </div>

                <div className="step-content">
                  <div className="step-icon">
                    <i className={step.icon}></i>
                  </div>
                  <div className="step-text">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SuccessAlert
        show={showSuccess}
        message="Fingerprint enrolled successfully!"
        onClose={() => setShowSuccess(false)}
      />

      <ErrorAlert
        show={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
      />
    </>
  );
};

export default EnrollmentModal;
