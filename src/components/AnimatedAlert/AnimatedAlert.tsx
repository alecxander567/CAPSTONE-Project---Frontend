import React from "react";
import "./AnimatedAlert.css";

interface AnimatedAlertProps {
  type: "success" | "error";
  message: string;
}

const AnimatedAlert: React.FC<AnimatedAlertProps> = ({ type, message }) => {
  return (
    <div className={`animated-alert ${type}`}>
      <div className="icon-wrapper">
        <i
          className={`bi ${
            type === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"
          }`}
        />
      </div>
      <span>{message}</span>
    </div>
  );
};

export default AnimatedAlert;
