import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token || !userRole) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to their appropriate dashboard
    const redirectPath =
      userRole === "admin" ? "/dashboard" : "/student-dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
