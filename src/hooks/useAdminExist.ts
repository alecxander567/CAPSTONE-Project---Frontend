import { useEffect, useState } from "react";
import axios from "axios";

export const useAdminExists = () => {
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/admin-exists`)
      .then((res) => setAdminExists(res.data.exists))
      .catch((err) => {
        console.error("Admin check failed:", err);
        setAdminExists(false);
      });
  }, []);

  return adminExists;
};
