import { useState, useEffect } from "react";
import axios from "axios";

interface UserProfile {
  id: number;
  student_id_no?: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  program: string;
  role: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  middle_initial?: string;
  email?: string;
  program?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No access token found in localStorage");
        setError("No authentication token found. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("✅ Token exists:", token.substring(0, 30) + "...");

      const response = await axios.get<UserProfile>(
        "http://localhost:8000/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("✅ Profile loaded successfully:", response.data);
      setProfile(response.data);
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);

      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError(err.response?.data?.detail || "Failed to load user profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    profileData: ProfileUpdateData,
  ): Promise<UserProfile> => {
    try {
      setUpdating(true);
      setUpdateError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put<UserProfile>(
        "http://localhost:8000/auth/profile",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Profile updated successfully:", response.data);
      setProfile(response.data);
      return response.data;
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to update profile";
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updating,
    updateError,
    refetch: fetchUserProfile,
    updateProfile,
  };
};
