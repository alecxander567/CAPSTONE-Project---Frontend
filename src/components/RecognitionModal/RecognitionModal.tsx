import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "../EnrollmentModal/EnrollmentModal.css"; 

const API_BASE_URL = "http://192.168.1.99:8000";

interface RecognitionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  userId: number;
  fingerId: number;
  onRecognized: (studentId: number, success: boolean) => void;
}

type StepUI = {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: "waiting" | "active" | "completed" | "failed";
};

const RecognitionModal = ({
  isOpen,
  onClose,
  userId,
  fingerId,
  onRecognized,
}: RecognitionModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pollRef = useRef<number | null>(null);

  const [steps, setSteps] = useState<StepUI[]>([
    {
      id: 0,
      title: "Starting Recognition",
      description: "Connecting to fingerprint sensor...",
      icon: "bi-hourglass-split",
      status: "waiting",
    },
    {
      id: 1,
      title: "Scan Finger",
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
        let status: "waiting" | "active" | "completed" | "failed";
        if (failed && idx === 2) status = "failed";
        else if (idx < stepIndex) status = "completed";
        else if (idx === stepIndex)
          status =
            step === "success" ? "completed"
            : step === "error" ? "failed"
            : "active";
        else status = "waiting";
        return { ...s, status };
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
      if (pollRef.current) clearInterval(pollRef.current);
      setCurrentStep(0);
      setSteps((prev) => prev.map((s) => ({ ...s, status: "waiting" })));
      return;
    }

    if (!userId) return;

    let targetFingerId: number | null = null; 

    axios
      .post(`${API_BASE_URL}/fingerprints/start-recognition/${userId}`)
      .then((res) => {
        targetFingerId = res.data.target_finger_id; 

        updateStepUI("place_finger");

        pollRef.current = window.setInterval(async () => {
          if (!targetFingerId) return;
          try {
            const res = await axios.get(
              `${API_BASE_URL}/fingerprints/get-recognition-result?finger_id=${targetFingerId}`,
            );
            const { status, matched } = res.data;

            if (status === "done") {
              updateStepUI(matched ? "success" : "error");
              clearInterval(pollRef.current!);
              setTimeout(() => {
                onRecognized(userId, matched);
                onClose?.();
              }, 1000);
            }
          } catch (err) {
            console.error(err);
          }
        }, 500);
      })
      .catch((err) => {
        console.error("Failed to start recognition:", err);
        updateStepUI("error");
      });

    return () => clearInterval(pollRef.current!);
  }, [isOpen, userId, updateStepUI]);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="enrollment-modal-overlay">
      <div className="enrollment-modal-content">
        <div className="enrollment-header">
          <i className="bi bi-fingerprint enrollment-icon"></i>
          <h2>Fingerprint Recognition</h2>
          <p>Please place your finger on the sensor</p>
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
                  <i className={`bi ${step.icon}`}></i>
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
