import Sidebar from "../../components/Sidebar/Sidebar";
import { useUserProfile } from "../../hooks/useUserProfile";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";
import type { ChangeEvent, FormEvent } from "react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Settings.css";

function Settings() {
  const {
    profile,
    loading,
    error,
    updating,
    uploading,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
  } = useUserProfile();

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatYearLevel = (year: string) => {
    const wordMap: Record<string, string> = {
      FIRST: "1st Year",
      "1st year": "1st Year",
      SECOND: "2nd Year",
      "2nd year": "2nd Year",
      THIRD: "3rd Year",
      "3rd year": "3rd Year",
      FOURTH: "4th Year",
      "4th year": "4th Year",
      "1": "1st Year",
      "2": "2nd Year",
      "3": "3rd Year",
      "4": "4th Year",
    };
    return wordMap[year] ?? wordMap[year.toUpperCase()] ?? year;
  };

  const [formData, setFormData] = useState(() => ({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    middle_initial: profile?.middle_initial || "",
    mobile_phone: profile?.mobile_phone || "",
    program:
      typeof profile?.program === "object" ?
        profile?.program?.code
      : profile?.program || "",
    year_level: profile?.year_level || "",
  }));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !loading) navigate("/login");
  }, [loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        middle_initial: profile.middle_initial || "",
        mobile_phone: profile.mobile_phone || "",
        program:
          typeof profile.program === "object" ?
            (profile.program as any)?.code
          : profile.program || "",
        year_level: profile.year_level || "",
      });
    }
  }, [profile]);

  const handleEditToggle = () => {
    if (isEditing && profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        middle_initial: profile.middle_initial || "",
        mobile_phone: profile.mobile_phone || "",
        program:
          typeof profile.program === "object" ?
            (profile.program as any)?.code
          : profile.program || "",
        year_level: profile.year_level || "",
      });
      setEditError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditError(null);

    try {
      // Prepare data correctly for backend
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        mobile_phone: formData.mobile_phone,
      };

      // Only include middle_initial if it has value
      if (formData.middle_initial && formData.middle_initial.trim() !== "") {
        updateData.middle_initial = formData.middle_initial;
      }

      // Only include program if it exists
      if (formData.program && formData.program.trim() !== "") {
        updateData.program = formData.program;
      }

      // Handle year_level correctly - convert to string number "1", "2", "3", "4"
      if (formData.year_level && formData.year_level !== "") {
        // Map various formats to "1", "2", "3", "4"
        const yearMap: Record<string, string> = {
          "1": "1",
          "2": "2",
          "3": "3",
          "4": "4",
          FIRST: "1",
          SECOND: "2",
          THIRD: "3",
          FOURTH: "4",
          "1st Year": "1",
          "2nd Year": "2",
          "3rd Year": "3",
          "4th Year": "4",
        };

        const yearValue = formData.year_level.toString().toUpperCase();
        updateData.year_level =
          yearMap[yearValue] || formData.year_level.toString();
      }

      console.log("Sending update data:", updateData);

      await updateProfile(updateData);
      setIsEditing(false);
      setShowSuccess(true);

      // Refresh the page after 1 second to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      let message = "Failed to update profile";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        message = (err as { message: string }).message;
      }
      setEditError(message);
      setErrorMessage(message);
      setShowError(true);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        "Please select a valid image file (JPG, PNG, GIF, or WebP)",
      );
      setShowError(true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be less than 5MB");
      setShowError(true);
      return;
    }

    try {
      await uploadProfilePicture(file);
      setShowSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      let message = "Failed to upload profile picture";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        message = (err as { message: string }).message;
      }
      setErrorMessage(message);
      setShowError(true);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeletePicture = () => setShowDeleteModal(true);

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      await deleteProfilePicture();
      setShowSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      let message = "Failed to delete profile picture";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        message = (err as { message: string }).message;
      }
      setErrorMessage(message);
      setShowError(true);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.375rem 0.75rem",
      borderRadius: "8px",
      fontSize: "0.875rem",
      fontWeight: "600",
      whiteSpace: "nowrap",
    };
    switch (status) {
      case "enrolled":
        return { ...baseStyle, background: "#d1f4e0", color: "#0f5132" };
      case "pending":
        return { ...baseStyle, background: "#fff3cd", color: "#856404" };
      case "failed":
        return { ...baseStyle, background: "#f8d7da", color: "#842029" };
      case "not_enrolled":
      default:
        return { ...baseStyle, background: "#e2e3e5", color: "#41464b" };
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getInitials = (firstName?: string, lastName?: string) =>
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isAdmin = profile?.role?.toUpperCase() === "ADMIN";

  return (
    <>
      <Sidebar />

      <SuccessAlert
        show={showSuccess}
        message="Your profile has been updated successfully!"
        onClose={() => setShowSuccess(false)}
      />

      <ErrorAlert
        show={showError}
        message={errorMessage || ""}
        onClose={() => setShowError(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal fade show"
          id="deletePictureModal"
          tabIndex={-1}
          role="dialog"
          style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content settings-pg-modal-content-delete">
              <div className="modal-header settings-pg-modal-header-delete">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    position: "relative",
                    zIndex: 1,
                  }}>
                  <div className="settings-pg-modal-icon-delete">
                    <i className="bi bi-trash-fill"></i>
                  </div>
                  <div>
                    <h5
                      className="modal-title"
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "1.35rem",
                      }}>
                      Remove Profile Picture
                    </h5>
                    <p
                      className="modal-subtitle"
                      style={{
                        margin: "0.25rem 0 0",
                        opacity: 0.85,
                        fontSize: "0.875rem",
                      }}>
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                  style={{ position: "relative", zIndex: 1 }}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body settings-pg-modal-body-delete">
                <div className="settings-pg-delete-warning-icon">
                  <i className="bi bi-exclamation-lg"></i>
                </div>
                <p className="settings-pg-delete-question">
                  Are you sure you want to remove your profile picture?
                </p>
                <div className="settings-pg-event-title-display">
                  <i className="bi bi-person-circle me-2"></i>
                  {profile?.first_name} {profile?.last_name}'s Profile Picture
                </div>
                <p className="settings-pg-delete-warning-text">
                  Your profile picture will be permanently deleted and replaced
                  with your default initials avatar. You can upload a new
                  picture at any time.
                </p>
              </div>

              <div className="modal-footer settings-pg-modal-footer-delete justify-content-center">
                <button
                  type="button"
                  className="settings-pg-btn-cancel-delete"
                  onClick={() => setShowDeleteModal(false)}>
                  <i className="bi bi-x-lg me-1"></i>Cancel
                </button>
                <button
                  type="button"
                  className="settings-pg-btn-confirm-delete text-white"
                  onClick={handleConfirmDelete}>
                  <i className="bi bi-trash-fill me-1"></i>Remove Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowDeleteModal(false)}
        />
      )}

      <div className="settings-pg-wrapper">
        <header className="settings-pg-header">
          <div className="settings-pg-wave"></div>
          <div className="settings-pg-header-content">
            <div className="settings-pg-header-icon">
              <i className="bi bi-gear-fill"></i>
            </div>
            <div className="settings-pg-header-text">
              <h1 className="settings-pg-header-title">Settings</h1>
              <p className="settings-pg-header-subtitle">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </header>

        <div className="settings-pg-content-wrapper">
          {loading && (
            <div className="settings-pg-loading-container">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {!loading && profile && (
            <form onSubmit={handleSubmit}>
              <div className="settings-pg-profile-card">
                <div className="settings-pg-profile-header">
                  <div className="settings-pg-profile-header-left">
                    {/* Avatar */}
                    <div
                      style={{ position: "relative", display: "inline-block" }}>
                      {profile.profile_image ?
                        <img
                          src={
                            profile.profile_image.startsWith("http") ?
                              profile.profile_image
                            : `${import.meta.env.VITE_API_URL}/${profile.profile_image.replace(/^\//, "")}`
                          }
                          alt="Profile"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "3px solid #fff",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          }}
                        />
                      : <div className="settings-pg-avatar-circle">
                          {getInitials(profile.first_name, profile.last_name)}
                        </div>
                      }
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        disabled={uploading}
                        style={{
                          position: "absolute",
                          bottom: "0",
                          right: "0",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%)",
                          border: "3px solid white",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }>
                        {uploading ?
                          <span
                            className="spinner-border spinner-border-sm"
                            style={{ width: "14px", height: "14px" }}
                          />
                        : <i
                            className="bi bi-camera-fill"
                            style={{ fontSize: "14px" }}
                          />
                        }
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div className="settings-pg-profile-header-text">
                      <h2 className="settings-pg-profile-name">
                        {profile.first_name}{" "}
                        {profile.middle_initial ?
                          `${profile.middle_initial}. `
                        : ""}
                        {profile.last_name}
                      </h2>
                      <div className="settings-pg-profile-role">
                        <span className="settings-pg-role-badge">
                          <i className="bi bi-person-badge"></i>
                          {profile.role.charAt(0).toUpperCase() +
                            profile.role.slice(1).toLowerCase()}
                        </span>
                        <span style={getStatusBadgeStyle(profile.status)}>
                          <i className="bi bi-fingerprint"></i>
                          {formatStatus(profile.status)}
                        </span>
                      </div>

                      {profile.profile_image && (
                        <button
                          type="button"
                          onClick={handleDeletePicture}
                          className="btn btn-sm btn-outline-danger mt-2"
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                          }}
                          disabled={updating}>
                          <i className="bi bi-trash me-1"></i>
                          Remove Picture
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing ?
                    <button
                      type="button"
                      className="settings-pg-btn settings-pg-btn-edit"
                      onClick={handleEditToggle}>
                      <i className="bi bi-pencil-square"></i>
                      Edit Profile
                    </button>
                  : <div className="settings-pg-button-group">
                      <button
                        type="button"
                        className="settings-pg-btn settings-pg-btn-cancel"
                        onClick={handleEditToggle}
                        disabled={updating}>
                        <i className="bi bi-x-lg"></i>Cancel
                      </button>
                      <button
                        type="submit"
                        className="settings-pg-btn settings-pg-btn-save"
                        disabled={updating}>
                        {updating ?
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            />
                            Saving...
                          </>
                        : <>
                            <i className="bi bi-check-lg"></i>Save Changes
                          </>
                        }
                      </button>
                    </div>
                  }
                </div>

                {editError && (
                  <div className="alert alert-danger settings-pg-edit-error">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {editError}
                  </div>
                )}

                <div className="settings-pg-profile-grid">
                  {!isAdmin && (
                    <div className="settings-pg-profile-field">
                      <label className="settings-pg-field-label">
                        Account No.
                      </label>
                      <div className="settings-pg-field-value">
                        <i className="bi bi-hash settings-pg-field-icon"></i>
                        {profile.student_id_no}
                      </div>
                    </div>
                  )}

                  <div className="settings-pg-profile-field">
                    <label
                      className="settings-pg-field-label"
                      htmlFor="first_name">
                      First Name
                    </label>
                    {isEditing ?
                      <input
                        className="settings-pg-form-input"
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    : <div className="settings-pg-field-value">
                        <i className="bi bi-person settings-pg-field-icon"></i>
                        {profile.first_name}
                      </div>
                    }
                  </div>

                  <div className="settings-pg-profile-field">
                    <label
                      className="settings-pg-field-label"
                      htmlFor="last_name">
                      Last Name
                    </label>
                    {isEditing ?
                      <input
                        className="settings-pg-form-input"
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    : <div className="settings-pg-field-value">
                        <i className="bi bi-person settings-pg-field-icon"></i>
                        {profile.last_name}
                      </div>
                    }
                  </div>

                  {!isAdmin && (
                    <div className="settings-pg-profile-field">
                      <label
                        className="settings-pg-field-label"
                        htmlFor="year_level">
                        Year Level
                      </label>
                      {isEditing ?
                        <select
                          name="year_level"
                          id="year_level"
                          className="settings-pg-form-select"
                          value={formData.year_level}
                          onChange={handleInputChange}>
                          <option value="">Select Year Level</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      : <div className="settings-pg-field-value">
                          {formData.year_level ?
                            formatYearLevel(formData.year_level)
                          : "-"}
                        </div>
                      }
                    </div>
                  )}

                  <div className="settings-pg-profile-field">
                    <label
                      className="settings-pg-field-label"
                      htmlFor="middle_initial">
                      Middle Initial
                    </label>
                    {isEditing ?
                      <input
                        className="settings-pg-form-input"
                        type="text"
                        id="middle_initial"
                        name="middle_initial"
                        value={formData.middle_initial}
                        onChange={handleInputChange}
                        maxLength={5}
                      />
                    : <div className="settings-pg-field-value">
                        <i className="bi bi-person settings-pg-field-icon"></i>
                        {profile.middle_initial || "N/A"}
                      </div>
                    }
                  </div>

                  <div className="settings-pg-profile-field">
                    <label
                      className="settings-pg-field-label"
                      htmlFor="mobile_phone">
                      Mobile Phone Number
                    </label>
                    {isEditing ?
                      <input
                        className="settings-pg-form-input"
                        type="tel"
                        id="mobile_phone"
                        name="mobile_phone"
                        value={formData.mobile_phone}
                        onChange={handleInputChange}
                        required
                      />
                    : <div className="settings-pg-field-value">
                        <i className="bi bi-phone settings-pg-field-icon"></i>
                        {profile.mobile_phone}
                      </div>
                    }
                  </div>

                  <div className="settings-pg-profile-field">
                    <label
                      className="settings-pg-field-label"
                      htmlFor="program">
                      Program
                    </label>
                    {isEditing ?
                      <select
                        className="settings-pg-form-select"
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        required>
                        <option value="">Select Program</option>
                        <option value="BSED">BSED</option>
                        <option value="BSBA">BSBA</option>
                        <option value="BSIT">BSIT</option>
                        <option value="BSCRIM">BSCRIM</option>
                        <option value="BPED">BPED</option>
                        <option value="BEED">BEED</option>
                        <option value="BHumServ">BHumServ</option>
                      </select>
                    : <div className="settings-pg-field-value">
                        <i className="bi bi-mortarboard settings-pg-field-icon"></i>
                        {typeof profile.program === "object" ?
                          profile.program?.code
                        : profile.program}
                      </div>
                    }
                  </div>

                  <div className="settings-pg-profile-field">
                    <label className="settings-pg-field-label">
                      Account Created
                    </label>
                    <div className="settings-pg-field-value">
                      <i className="bi bi-calendar-check settings-pg-field-icon"></i>
                      {formatDate(profile.created_at)}
                    </div>
                  </div>

                  <div className="settings-pg-profile-field">
                    <label className="settings-pg-field-label">
                      Last Updated
                    </label>
                    <div className="settings-pg-field-value">
                      <i className="bi bi-clock-history settings-pg-field-icon"></i>
                      {formatDate(profile.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Settings;
