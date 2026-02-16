import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "./EnrollmentModal.css";

const API_BASE_URL = "http://192.168.1.99:8000";

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
  fingerId,
  updateStatus,
}: EnrollmentModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);

  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

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
        console.warn("Unknown step:", step);
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

        console.log(`  Step ${idx}: ${newStatus}`);

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
    console.log("🎬 Modal isOpen changed:", isOpen);

    if (!isOpen) {
      clearTimers();
      setCurrentStep(0);
      setSteps((prev) =>
        prev.map((s) => ({
          ...s,
          status: "waiting",
        })),
      );
      return;
    }

    clearTimers();
    setTimeoutSeconds(60);
    setCurrentStep(0);

    console.log("⏱️ Starting countdown timer...");
    countdownRef.current = window.setInterval(() => {
      setTimeoutSeconds((prev) => {
        const newValue = prev <= 1 ? 0 : prev - 1;
        if (newValue <= 10 && newValue > 0) {
          console.log("⚠️ Timeout warning:", newValue, "seconds");
        }
        return newValue;
      });
    }, 1000);

    console.log("⏰ Setting 60-second timeout...");
    timeoutRef.current = window.setTimeout(() => {
      updateStatus(userId, "failed");
      onClose?.();
      clearTimers();
    }, 60000);

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
          setTimeout(() => onClose?.(), 800);
        } else if (status === "failed") {
          clearTimers();
          updateStatus(userId, "failed");
          setTimeout(() => onClose?.(), 800);
        }
      } catch (err) {
        console.error("Enrollment polling error:", err);
      }
    }, 500);

    return () => {
      console.log("Cleanup - clearing all timers");
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

  return (
    <div className="enrollment-modal-overlay">
      <div className="enrollment-modal-content">
        <div className="enrollment-header">
          <i className="bi bi-fingerprint enrollment-icon"></i>
          <h2>Fingerprint Enrollment</h2>
          <p>Please follow the steps below</p>

          {timeoutSeconds <= 10 && timeoutSeconds > 0 && (
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
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={(el) => (stepRefs.current[index] = el)}
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
