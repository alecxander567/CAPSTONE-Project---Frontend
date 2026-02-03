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
  mobile_phone: string;
  profile_image?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  middle_initial?: string;
  mobile_phone?: string;
  program?: string;
  profile_image?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

      const response = await axios.get<UserProfile>(
        "http://localhost:8000/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  const uploadProfilePicture = async (file: File): Promise<void> => {
    try {
      setUploading(true);
      setUpdateError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8000/auth/profile/upload-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      await fetchUserProfile();
    } catch (err: any) {
      console.error("Error uploading profile picture:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to upload profile picture";
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async (): Promise<void> => {
    try {
      setUpdating(true);
      setUpdateError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete("http://localhost:8000/auth/profile/delete-picture", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchUserProfile();
    } catch (err: any) {
      console.error("Error deleting profile picture:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to delete profile picture";
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
    uploading,
    updateError,
    refetch: fetchUserProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
  };
};
