import React, { useEffect } from "react";
import "./ErrorAlert.css";

interface ErrorAlertProps {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
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
    <div className="error-alert-overlay">
      <div className="error-alert-container">
        <div className="error-alert-icon">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h3 className="error-alert-title">Error</h3>
        <p className="error-alert-message">{message}</p>
        <button className="error-alert-close" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;
