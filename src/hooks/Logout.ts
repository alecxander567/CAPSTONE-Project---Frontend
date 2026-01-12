import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.post("http://localhost:8000/auth/logout");

      localStorage.removeItem("student_id_no");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("student_id_no");
      navigate("/");
    }
  };

  return { logout };
};
