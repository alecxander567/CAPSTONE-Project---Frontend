import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("student_id_no");

      // Redirect to landing page
      navigate("/", { replace: true });
    }
  };

  return { logout };
};
