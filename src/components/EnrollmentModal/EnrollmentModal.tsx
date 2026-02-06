import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SuccessAlert from "../SuccessAlert/SuccessAlert";
import ErrorAlert from "../SuccessAlert/ErrorAlert";
import "./EnrollmentModal.css";

type FingerprintStatus = "not_enrolled" | "pending" | "enrolled" | "failed";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  userId: number;
  updateStatus: (studentId: number, status: FingerprintStatus) => void;
}

type EnrollmentStep = {
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastStepRef = useRef<string | null>(null);

  const [steps, setSteps] = useState<EnrollmentStep[]>([
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
      title: "Verifying",
      description: "Processing and verifying fingerprint...",
      icon: "bi-shield-check",
      status: "waiting",
    },
    {
      id: 6,
      title: "Storing",
      description: "Saving fingerprint to database...",
      icon: "bi-database",
      status: "waiting",
    },
  ]);

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const resetInactivityTimer = () => {
    clearTimers();
    setTimeoutSeconds(10);

    countdownRef.current = setInterval(() => {
      setTimeoutSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      setErrorMessage("No fingerprint detected. Enrollment timed out.");
      updateStatus(userId, "failed");
      onClose?.();
      setShowError(true);
      clearTimers();
    }, 10000);
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setShowSuccess(false);
      setShowError(false);
      setTimeoutSeconds(10);
      lastStepRef.current = null;
      clearTimers();
      setSteps((prev) =>
        prev.map((step, idx) => ({
          ...step,
          status: idx === 0 ? "active" : "waiting",
        })),
      );
      return;
    }

    resetInactivityTimer();

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/fingerprints/enrollment-status/${userId}`,
        );

        const { status, step, message } = response.data;

        if (step !== lastStepRef.current && step !== "waiting_first_finger") {
          lastStepRef.current = step;
          resetInactivityTimer(); 
        }

        if (step === "waiting_first_finger") {
          updateStep(0);
        } else if (step === "capturing_first") {
          updateStep(1);
        } else if (step === "remove_finger") {
          updateStep(2);
        } else if (step === "waiting_second_finger") {
          updateStep(3);
        } else if (step === "verifying") {
          updateStep(4);
        } else if (step === "storing") {
          updateStep(5);
        }

        if (status === "success") {
          clearInterval(pollInterval);
          clearTimers();
          setSteps((prev) => prev.map((s) => ({ ...s, status: "completed" })));

          updateStatus(userId, "enrolled");

          setTimeout(() => {
            onClose?.();
            setShowSuccess(true);
          }, 1000);
        } else if (status === "failed") {
          clearInterval(pollInterval);
          clearTimers();
          setErrorMessage(message);
          setSteps((prev) =>
            prev.map((s, idx) =>
              idx === currentStep ? { ...s, status: "failed" } : s,
            ),
          );

          updateStatus(userId, "failed");

          setTimeout(() => {
            onClose?.();
            setShowError(true);
          }, 1500);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearTimers();
    };
  }, [isOpen, userId]);

  const updateStep = (stepIndex: number) => {
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

  if (!isOpen) return null;

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <div className="enrollment-modal-overlay">
        <div className="enrollment-modal-content">
          <div className="enrollment-header">
            <i className="bi bi-fingerprint enrollment-icon"></i>
            <h2>Fingerprint Enrollment</h2>
            <p>Please follow the steps below</p>

            {/* Timeout Warning */}
            {timeoutSeconds <= 5 && timeoutSeconds > 0 && (
              <div className="timeout-warning">
                <i className="bi bi-exclamation-triangle"></i>
                <span>Auto-closing in {timeoutSeconds}s if no activity...</span>
              </div>
            )}
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}></div>
          </div>

          <div className="enrollment-steps">
            {steps.map((step) => (
              <div key={step.id} className={`enrollment-step ${step.status}`}>
                <div className="step-indicator">
                  {step.status === "completed" ?
                    <i className="bi bi-check-circle-fill"></i>
                  : step.status === "failed" ?
                    <i className="bi bi-x-circle-fill"></i>
                  : step.status === "active" ?
                    <div className="step-spinner"></div>
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
