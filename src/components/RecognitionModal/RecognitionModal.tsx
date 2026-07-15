import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "../EnrollmentModal/EnrollmentModal.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const RECOGNITION_TIMEOUT = 10000;
const RECOGNITION_TIMEOUT_SECONDS = RECOGNITION_TIMEOUT / 1000;
const POLL_INTERVAL = 500;

// Same ring geometry as EnrollmentModal so both modals' timers look identical.
const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface RecognitionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  userId: number;
  fingerId: number;
  onRecognized: (studentId: number, success: boolean) => void;
}

type StepStatus = "waiting" | "active" | "completed" | "failed";

type StepUI = {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: StepStatus;
};

const RecognitionModal = ({
  isOpen,
  onClose,
  userId,
  onRecognized,
}: RecognitionModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeoutSeconds, setTimeoutSeconds] = useState(
    RECOGNITION_TIMEOUT_SECONDS,
  );
  const [steps, setSteps] = useState<StepUI[]>([
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
      description: "Place your finger on the sensor",
      icon: "bi-hand-index-thumb",
      status: "waiting",
    },
    {
      id: 2,
      title: "Recognition Complete",
      description: "Processing fingerprint...",
      icon: "bi-check-circle",
      status: "waiting",
    },
  ]);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);
  const hasCalledRef = useRef(false);
  const isCompletedRef = useRef(false); // ✅ Add this to track completion

  const clearTimers = () => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (resetRef.current !== null) {
      clearTimeout(resetRef.current);
      resetRef.current = null;
    }
  };

  // ✅ Safe wrapper — only calls onRecognized once per modal open
  const safeOnRecognized = useCallback(
    (id: number, success: boolean) => {
      if (hasCalledRef.current || isCompletedRef.current) return;
      hasCalledRef.current = true;
      isCompletedRef.current = true;
      onRecognized(id, success);
    },
    [onRecognized],
  );

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
      case "success":
        stepIndex = 2;
        break;
      case "error":
        stepIndex = 2;
        failed = true;
        break;
      default:
        stepIndex = 0;
    }

    setCurrentStep(stepIndex);

    setSteps((prev) =>
      prev.map((s, idx) => {
        let status: StepStatus;

        if (failed && idx === stepIndex) status = "failed";
        else if (idx < stepIndex) status = "completed";
        else if (idx === stepIndex)
          status =
            failed ? "failed"
            : step === "success" ? "completed"
            : "active";
        else status = "waiting";

        return { ...s, status };
      }),
    );
  }, []);

  useEffect(() => {
    stepRefs.current[currentStep]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) {
      clearTimers();
      // Reset guards when modal closes
      hasCalledRef.current = false;
      isCompletedRef.current = false;

      // Deferred so we're not calling setState synchronously in the
      // effect body — runs on the next tick instead.
      resetRef.current = window.setTimeout(() => {
        setCurrentStep(0);
        setSteps((prev) => prev.map((s) => ({ ...s, status: "waiting" })));
        setTimeoutSeconds(RECOGNITION_TIMEOUT_SECONDS);
      }, 0);

      return () => {
        if (resetRef.current !== null) {
          clearTimeout(resetRef.current);
          resetRef.current = null;
        }
      };
    }

    if (!userId) return;

    let targetFingerId: number | null = null;
    let isResolved = false;

    // Deferred so we're not calling setState synchronously in the effect
    // body — runs on the next tick instead, same pattern used on close.
    window.setTimeout(() => {
      setTimeoutSeconds(RECOGNITION_TIMEOUT_SECONDS);
    }, 0);

    countdownRef.current = window.setInterval(() => {
      setTimeoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const startRecognition = async () => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/fingerprints/start-recognition/${userId}`,
        );

        targetFingerId = res.data.target_finger_id;

        updateStepUI("place_finger");

        // ✅ Clear any existing timeout first
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            clearTimers();
            updateStepUI("error");
            safeOnRecognized(userId, false);
            setTimeout(() => {
              onClose?.();
            }, 1000);
          }
        }, RECOGNITION_TIMEOUT);

        // ✅ Clear any existing poll interval
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }

        pollRef.current = window.setInterval(async () => {
          if (!targetFingerId) return;
          if (isResolved) return; // ✅ Don't poll if already resolved

          try {
            const res = await axios.get(
              `${API_BASE_URL}/fingerprints/get-recognition-result?finger_id=${targetFingerId}`,
            );

            const { status, matched } = res.data;

            if (status === "done" && !isResolved) {
              isResolved = true;
              clearTimers();
              updateStepUI(matched ? "success" : "error");

              setTimeout(() => {
                safeOnRecognized(userId, matched);
                onClose?.();
              }, 1000);
            }
          } catch (err) {
            console.error("Polling error:", err);
            if (!isResolved) {
              isResolved = true;
              clearTimers();
              updateStepUI("error");
              safeOnRecognized(userId, false);
            }
          }
        }, POLL_INTERVAL);
      } catch (err) {
        if (!isResolved) {
          isResolved = true;
          if (axios.isAxiosError(err) && err.response?.status === 503) {
            setCurrentStep(0);
            setSteps((prev) =>
              prev.map((s, idx) =>
                idx === 0 ?
                  {
                    ...s,
                    status: "failed",
                    description: "Device is offline. Please try again.",
                  }
                : s,
              ),
            );
            safeOnRecognized(userId, false);
            onClose?.();
          } else {
            console.error("Failed to start recognition:", err);
            updateStepUI("error");
            safeOnRecognized(userId, false);
          }
        }
      }
    };

    startRecognition();

    return () => {
      clearTimers();
    };
  }, [isOpen, userId, updateStepUI, safeOnRecognized, onClose]);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Ring fill drains from full to empty as time runs out.
  const timeFraction = timeoutSeconds / RECOGNITION_TIMEOUT_SECONDS;
  const ringOffset = RING_CIRCUMFERENCE * (1 - timeFraction);
  const timerState =
    timeoutSeconds <= 3 ? "critical"
    : timeoutSeconds <= 5 ? "warning"
    : "normal";

  return (
    <div className="enrollment-modal-overlay">
      <div className="enrollment-modal-content">
        <div className="enrollment-header">
          <div className="enrollment-header-top">
            <div className="enrollment-header-titles">
              <i className="bi bi-fingerprint enrollment-icon"></i>
              <h2>Fingerprint Recognition</h2>
              <p>Please place your finger on the sensor</p>
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
                  <i className={`bi ${step.icon}`} />
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

export default RecognitionModal;
