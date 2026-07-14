import { useState, useEffect } from "react";
import axios from "axios";

interface UserProfile {
  id: number;
  student_id_no?: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  program: string | { code: string; name: string; id: number };
  year_level?: string;
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
  year_level?: number | string;
  profile_image?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Get the base URL safely
  const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
      console.error("VITE_API_URL is not defined!");
      return "http://localhost:8000";
    }
    return url.replace(/\/$/, "");
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        setLoading(false);
        return;
      }

      const apiUrl = getApiUrl();
      const response = await axios.get<UserProfile>(`${apiUrl}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
    } catch (err: unknown) {
      console.error("Error fetching user profile:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Failed to load user profile";
        setError(errorMessage);
      } else {
        setError("Failed to load user profile");
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
      if (!token) throw new Error("No authentication token found");

      // Clean the data - remove undefined, null, and empty strings
      const filteredPayload: Partial<ProfileUpdateData> = {};
      (
        Object.entries(profileData) as [keyof ProfileUpdateData, unknown][]
      ).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Cast is safe here: `key` is a keyof ProfileUpdateData and
          // `value` came directly from that same field on profileData.
          (filteredPayload as Record<string, unknown>)[key] = value;
        }
      });

      const apiUrl = getApiUrl();
      const url = `${apiUrl}/auth/profile`;

      const response = await axios.put<UserProfile>(url, filteredPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setProfile(response.data);
      return response.data;
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Failed to update profile";
        setUpdateError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
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
      if (!token) throw new Error("No authentication token found");

      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = getApiUrl();

      await axios.post(`${apiUrl}/auth/profile/upload-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchUserProfile();
    } catch (err: unknown) {
      console.error("Error uploading profile picture:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Failed to upload profile picture";
        setUpdateError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload profile picture";
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
      if (!token) throw new Error("No authentication token found");

      const apiUrl = getApiUrl();

      await axios.delete(`${apiUrl}/auth/profile/delete-picture`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchUserProfile();
    } catch (err: unknown) {
      console.error("Error deleting profile picture:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Failed to delete profile picture";
        setUpdateError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete profile picture";
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
