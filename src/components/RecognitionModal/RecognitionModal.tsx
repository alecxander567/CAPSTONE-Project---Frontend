import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const DEFAULT_DEVICE_ID = "esp32-default";
const RECOGNITION_TIMEOUT = 30000;
const RECOGNITION_TIMEOUT_SECONDS = RECOGNITION_TIMEOUT / 1000;
const POLL_INTERVAL = 500;

// Same ring geometry as EnrollmentModal
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
  fingerId,
  onRecognized,
}: RecognitionModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeoutSeconds, setTimeoutSeconds] = useState(
    RECOGNITION_TIMEOUT_SECONDS,
  );
  const [targetDevice, setTargetDevice] = useState<string>("");
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

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);
  const hasCalledRef = useRef(false);
  const isCompletedRef = useRef(false);
  const isPollingRef = useRef(false);
  const isResolvedRef = useRef(false);
  const isRecognitionStartedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const pollAttemptsRef = useRef(0);
  const targetDeviceRef = useRef<string>("");
  const resultSentRef = useRef(false);

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
    isPollingRef.current = false;
  };

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

  // Reset state when modal opens/closes
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);

    if (!isOpen) {
      setTargetDevice("");
      setCurrentStep(0);
      isRecognitionStartedRef.current = false;
      isCompleteRef.current = false;
      pollAttemptsRef.current = 0;
      resultSentRef.current = false;
      setSteps((prev) => prev.map((s) => ({ ...s, status: "waiting" })));
      setTimeoutSeconds(RECOGNITION_TIMEOUT_SECONDS);
      hasCalledRef.current = false;
      isCompletedRef.current = false;
      isPollingRef.current = false;
      isResolvedRef.current = false;
      clearTimers();
    } else {
      isRecognitionStartedRef.current = false;
      isCompleteRef.current = false;
      pollAttemptsRef.current = 0;
      resultSentRef.current = false;
      hasCalledRef.current = false;
      isCompletedRef.current = false;
      isPollingRef.current = false;
      isResolvedRef.current = false;
      setCurrentStep(0);
      setSteps((prev) => prev.map((s) => ({ ...s, status: "waiting" })));
      setTimeoutSeconds(RECOGNITION_TIMEOUT_SECONDS);
      setTargetDevice("");
      targetDeviceRef.current = "";
      clearTimers();
    }
  }

  useEffect(() => {
    stepRefs.current[currentStep]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) {
      clearTimers();
    }
    return () => clearTimers();
  }, [isOpen]);

  // Starts recognition when the modal opens
  useEffect(() => {
    if (
      !isOpen ||
      !userId ||
      isRecognitionStartedRef.current ||
      isCompleteRef.current
    ) {
      return;
    }

    let targetFingerId: number | null = null;

    isRecognitionStartedRef.current = true;
    isResolvedRef.current = false;
    pollAttemptsRef.current = 0;
    resultSentRef.current = false;

    setTimeoutSeconds(RECOGNITION_TIMEOUT_SECONDS);

    countdownRef.current = window.setInterval(() => {
      setTimeoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const startRecognition = async () => {
      try {
        // Clear any existing recognition state
        try {
          await axios.post(
            `${API_BASE_URL}/fingerprints/cancel-recognition/${userId}`,
            {},
            { timeout: 5000 },
          );
          console.log("[Recognition] Cleared previous state");
        } catch (clearErr) {
          console.log("[Recognition] Error clearing state:", clearErr);
        }

        // Start new recognition
        const res = await axios.post(
          `${API_BASE_URL}/fingerprints/start-recognition/${userId}`,
        );

        targetFingerId = res.data.target_finger_id;
        targetDeviceRef.current = res.data.target_device || "Unknown";
        setTargetDevice(targetDeviceRef.current);

        console.log(
          `[Recognition] Started on device: ${targetDeviceRef.current}, finger_id: ${targetFingerId}`,
        );

        // Update to "Place Finger" step
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === 0 ?
              {
                ...s,
                description: `Device ${targetDeviceRef.current} is ready`,
                status: "completed" as StepStatus,
              }
            : idx === 1 ?
              {
                ...s,
                status: "active" as StepStatus,
                description: "Please place your finger on the sensor...",
              }
            : s,
          ),
        );

        setCurrentStep(1);
        updateStepUI("place_finger");

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          if (!isResolvedRef.current && !resultSentRef.current) {
            isResolvedRef.current = true;
            resultSentRef.current = true;
            clearTimers();
            updateStepUI("error");
            setSteps((prev) =>
              prev.map((s, idx) =>
                idx === 2 ?
                  {
                    ...s,
                    status: "failed" as StepStatus,
                    description: "Recognition timed out. Please try again.",
                  }
                : s,
              ),
            );
            safeOnRecognized(userId, false);
            isCompleteRef.current = true;
            setTimeout(() => {
              onClose?.();
            }, 1500);
          }
        }, RECOGNITION_TIMEOUT);

        if (pollRef.current) {
          clearInterval(pollRef.current);
        }

        // Poll for the result
        pollRef.current = window.setInterval(async () => {
          if (!targetFingerId) return;
          if (isResolvedRef.current || resultSentRef.current) {
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            return;
          }
          if (isPollingRef.current) return;
          isPollingRef.current = true;
          pollAttemptsRef.current++;

          try {
            const deviceId = targetDeviceRef.current || DEFAULT_DEVICE_ID;
            const url = `${API_BASE_URL}/fingerprints/get-recognition-result?finger_id=${targetFingerId}&device_id=${deviceId}`;

            console.log(
              `[Poll ${pollAttemptsRef.current}] Checking for result...`,
            );
            const res = await axios.get(url, { timeout: 5000 });

            const { status, matched } = res.data;
            console.log(
              `[Poll ${pollAttemptsRef.current}] Status: ${status}, Matched: ${matched}`,
            );

            if (
              status === "done" &&
              !isResolvedRef.current &&
              !resultSentRef.current
            ) {
              console.log(
                `[Recognition] FINAL RESULT: ${matched ? "MATCH" : "NO MATCH"}`,
              );
              isResolvedRef.current = true;
              resultSentRef.current = true;
              clearTimers();
              updateStepUI(matched ? "success" : "error");
              setSteps((prev) =>
                prev.map((s, idx) =>
                  idx === 2 ?
                    {
                      ...s,
                      status: matched ? "completed" : ("failed" as StepStatus),
                      description:
                        matched ?
                          "Fingerprint matched successfully!"
                        : "Fingerprint did not match.",
                    }
                  : s,
                ),
              );
              safeOnRecognized(userId, matched);
              isCompleteRef.current = true;
              setTimeout(() => {
                onClose?.();
              }, 1500);
            } else if (status === "pending") {
              setSteps((prev) =>
                prev.map((s, idx) =>
                  idx === 1 ?
                    {
                      ...s,
                      description: "Waiting for finger placement...",
                    }
                  : s,
                ),
              );
            } else if (
              status === "timeout" &&
              !isResolvedRef.current &&
              !resultSentRef.current
            ) {
              isResolvedRef.current = true;
              resultSentRef.current = true;
              clearTimers();
              updateStepUI("error");
              setSteps((prev) =>
                prev.map((s, idx) =>
                  idx === 2 ?
                    {
                      ...s,
                      status: "failed" as StepStatus,
                      description: "Recognition timed out. Please try again.",
                    }
                  : s,
                ),
              );
              safeOnRecognized(userId, false);
              isCompleteRef.current = true;
              setTimeout(() => {
                onClose?.();
              }, 1500);
            } else if (status === "not_in_recognition_mode") {
              console.log(
                "[Recognition] Device not in recognition mode yet, waiting...",
              );
            }
          } catch (err) {
            console.error("Polling error:", err);
          } finally {
            isPollingRef.current = false;
          }
        }, POLL_INTERVAL);
      } catch (err) {
        if (!isResolvedRef.current && !resultSentRef.current) {
          isResolvedRef.current = true;
          resultSentRef.current = true;
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
            isCompleteRef.current = true;
            setTimeout(() => {
              onClose?.();
            }, 2000);
          } else {
            console.error("Failed to start recognition:", err);
            updateStepUI("error");
            setSteps((prev) =>
              prev.map((s, idx) =>
                idx === 2 ?
                  {
                    ...s,
                    status: "failed" as StepStatus,
                    description:
                      "Failed to start recognition. Please try again.",
                  }
                : s,
              ),
            );
            safeOnRecognized(userId, false);
            isCompleteRef.current = true;
            setTimeout(() => {
              onClose?.();
            }, 1500);
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
              {targetDevice && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "8px",
                    padding: "6px 14px",
                    background: "rgba(15, 82, 186, 0.08)",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    color: "#1a202c",
                  }}>
                  <i
                    className="bi bi-cpu"
                    style={{ color: "#0f52ba", fontSize: "1rem" }}></i>
                  <span>
                    Device:{" "}
                    <strong style={{ color: "#0f52ba", fontWeight: 600 }}>
                      {targetDevice}
                    </strong>
                  </span>
                </div>
              )}
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
