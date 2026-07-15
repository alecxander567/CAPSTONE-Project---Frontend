import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "./EnrollmentModal.css";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

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

const TOTAL_TIMEOUT_SECONDS = 35;

// Countdown ring geometry — radius chosen to keep the SVG viewBox tidy at 80x80.
const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const EnrollmentModal = ({
  isOpen,
  onClose,
  userId,
  fingerId,
  updateStatus,
}: EnrollmentModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeoutSeconds, setTimeoutSeconds] = useState(TOTAL_TIMEOUT_SECONDS);
  // Replaces the old console.log calls — shown in the modal so you can see
  // what's happening without opening devtools.
  const [statusMessage, setStatusMessage] = useState("");

  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [steps, setSteps] = useState<EnrollmentStepUI[]>([
    {
      id: 0,
      title: "Waiting for ESP32",
      description: "Connecting to fingerprint sensor...",
      icon: "bi-hourglass-split",
      status: "waiting",
    },
    {
      id: 1,
      title: "Place Finger",
      description: "Place your finger on the sensor...",
      icon: "bi-hand-index-thumb",
      status: "waiting",
    },
    {
      id: 2,
      title: "Remove Finger",
      description: "Lift your finger from the sensor",
      icon: "bi-arrow-up-circle",
      status: "waiting",
    },
    {
      id: 3,
      title: "Place Again",
      description: "Place the SAME finger again...",
      icon: "bi-hand-index-thumb",
      status: "waiting",
    },
    {
      id: 4,
      title: "Complete",
      description: "Saving fingerprint...",
      icon: "bi-check-circle",
      status: "waiting",
    },
  ]);

  const clearTimers = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (resetRef.current) {
      clearTimeout(resetRef.current);
      resetRef.current = null;
    }
  }, []);

  const updateStepUI = useCallback((step: string) => {
    let stepIndex = 0;
    let failed = false;

    switch (step) {
      case "pending":
        stepIndex = 0;
        break;
      case "place_finger":
        stepIndex = 1;
        break;
      case "remove_finger":
        stepIndex = 2;
        break;
      case "place_again":
        stepIndex = 3;
        break;
      case "success":
        stepIndex = 4;
        break;
      case "error":
        stepIndex = 4;
        failed = true;
        break;
      default:
        setStatusMessage(`Unknown step received: ${step}`);
        stepIndex = 0;
        break;
    }

    setCurrentStep(stepIndex);
    setSteps((prev) =>
      prev.map((s, idx) => {
        let newStatus: "waiting" | "active" | "completed" | "failed";

        if (failed && idx === 4) {
          newStatus = "failed";
        } else if (idx < stepIndex) {
          newStatus = "completed";
        } else if (idx === stepIndex) {
          newStatus =
            step === "success" ? "completed"
            : step === "error" ? "failed"
            : "active";
        } else {
          newStatus = "waiting";
        }

        return {
          ...s,
          status: newStatus,
        };
      }),
    );
  }, []);

  useEffect(() => {
    if (stepRefs.current[currentStep]) {
      stepRefs.current[currentStep]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) {
      clearTimers();
      // Deferred so we're not calling setState synchronously in the
      // effect body — runs on the next tick instead.
      resetRef.current = window.setTimeout(() => {
        setCurrentStep(0);
        setSteps((prev) =>
          prev.map((s) => ({
            ...s,
            status: "waiting",
          })),
        );
        setStatusMessage("");
      }, 0);

      return () => {
        if (resetRef.current) {
          clearTimeout(resetRef.current);
          resetRef.current = null;
        }
      };
    }

    clearTimers();

    resetRef.current = window.setTimeout(() => {
      setTimeoutSeconds(TOTAL_TIMEOUT_SECONDS);
      setCurrentStep(0);
      setStatusMessage("Waiting for fingerprint to scan...");
    }, 0);

    countdownRef.current = window.setInterval(() => {
      setTimeoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    timeoutRef.current = window.setTimeout(() => {
      updateStatus(userId, "failed");
      onClose?.();
      clearTimers();
    }, TOTAL_TIMEOUT_SECONDS * 1000);

    pollRef.current = window.setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/fingerprints/get-status?finger_id=${fingerId}`,
        );

        const { status, step } = response.data;

        updateStepUI(step);

        if (status === "enrolled") {
          clearTimers();
          updateStatus(userId, "enrolled");
          setStatusMessage("Fingerprint enrolled successfully!");
          setTimeout(() => onClose?.(), 800);
        } else if (status === "failed") {
          clearTimers();
          updateStatus(userId, "failed");
          setStatusMessage("Enrollment failed. Please try again.");
          setTimeout(() => onClose?.(), 800);
        }
      } catch (err) {
        console.error("Enrollment polling error:", err);
        setStatusMessage("Connection error while checking status...");
      }
    }, 500);

    return () => {
      clearTimers();
    };
  }, [
    isOpen,
    fingerId,
    userId,
    updateStatus,
    onClose,
    updateStepUI,
    clearTimers,
  ]);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Ring fill drains from full to empty as time runs out.
  const timeFraction = timeoutSeconds / TOTAL_TIMEOUT_SECONDS;
  const ringOffset = RING_CIRCUMFERENCE * (1 - timeFraction);
  const timerState =
    timeoutSeconds <= 5 ? "critical"
    : timeoutSeconds <= 10 ? "warning"
    : "normal";

  return (
    <div className="enrollment-modal-overlay">
      <div className="enrollment-modal-content">
        <div className="enrollment-header">
          <div className="enrollment-header-top">
            <div className="enrollment-header-titles">
              <i className="bi bi-fingerprint enrollment-icon"></i>
              <h2>Fingerprint Enrollment</h2>
              <p>Please follow the steps below</p>
            </div>

            <div
              className="enrollment-timer-ring"
              data-state={timerState}
              role="timer"
              aria-live="polite"
              aria-label={`${timeoutSeconds} seconds remaining`}>
              <svg viewBox="0 0 80 80" className="timer-ring-svg">
                <circle
                  className="timer-ring-track"
                  cx="40"
                  cy="40"
                  r={RING_RADIUS}
                />
                <circle
                  className="timer-ring-progress"
                  cx="40"
                  cy="40"
                  r={RING_RADIUS}
                  style={{
                    strokeDasharray: RING_CIRCUMFERENCE,
                    strokeDashoffset: ringOffset,
                  }}
                />
              </svg>
              <div className="timer-ring-label">
                <span className="timer-ring-seconds">{timeoutSeconds}</span>
                <span className="timer-ring-unit">sec</span>
              </div>
            </div>
          </div>

          {statusMessage && (
            <div className="enrollment-status-message">
              <i className="bi bi-info-circle"></i>
              <span>{statusMessage}</span>
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
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className={`enrollment-step ${step.status}`}>
              <div className="step-indicator">
                {step.status === "completed" ?
                  <i className="bi bi-check-circle-fill" />
                : step.status === "failed" ?
                  <i className="bi bi-x-circle-fill" />
                : step.status === "active" ?
                  <div className="step-spinner" />
                : <div className="step-number">{step.id + 1}</div>}
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
  );
};

export default EnrollmentModal;
