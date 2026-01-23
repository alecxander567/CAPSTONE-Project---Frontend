import React, { useEffect } from "react";
import "./SuccessAlert.css";

interface SuccessAlertProps {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({
  show,
  message,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="success-alert-overlay">
      <div className="success-alert-container">
        <div className="success-alert-icon">
          <div className="success-checkmark">
            <i className="bi bi-check-lg"></i>
          </div>
        </div>
        <h3 className="success-alert-title">Success!</h3>
        <p className="success-alert-message">{message}</p>
        <button className="success-alert-close" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default SuccessAlert;
