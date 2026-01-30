import Sidebar from "../../components/Sidebar/Sidebar";
import { useUserProfile } from "../../hooks/useUserProfile";
import SuccessAlert from "../../components/SuccessAlert/SuccessAlert";
import ErrorAlert from "../../components/SuccessAlert/ErrorAlert";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Settings() {
  const { profile, loading, error, updating, updateProfile } = useUserProfile();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_initial: "",
    email: "",
    program: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !loading) {
      navigate("/login");
    }
  }, [loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        middle_initial: profile.middle_initial || "",
        email: profile.email || "",
        program: profile.program || "",
      });
    }
  }, [profile]);

  const handleEditToggle = () => {
    if (isEditing) {
      if (profile) {
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          middle_initial: profile.middle_initial || "",
          email: profile.email || "",
          program: profile.program || "",
        });
      }
      setEditError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      setShowSuccess(true);
    } catch (err) {
      const message = err.message || "Failed to update profile";
      setEditError(message);
      setErrorMessage(message);
      setShowError(true);
    }
  };

  const getStatusBadgeStyle = (status) => {
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

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        message={errorMessage}
        onClose={() => setShowError(false)}
      />

      <style>
        {`
          @keyframes wave {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .settings-page-wrapper {
            margin-left: 260px;
            min-height: 100vh;
            width: calc(100% - 260px);
            transition: margin-left 0.3s ease;
            background-color: #f8f9fa;
          }

          .settings-dashboard-header {
            position: relative;
            background: linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%);
            color: #fff;
            padding: 3rem 2rem;
            overflow: hidden;
            margin-bottom: 0;
            padding-bottom: 60px;
          }

          .settings-wave {
            position: absolute;
            width: 200%;
            height: 200%;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 40%;
            top: -60%;
            left: -50%;
            animation: wave 15s linear infinite;
          }

          .settings-header-content {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            max-width: 1400px;
            margin: 0 auto;
          }

          .settings-header-icon {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
            width: 64px;
            height: 64px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            flex-shrink: 0;
          }

          .settings-header-text {
            position: relative;
            z-index: 1;
          }

          .settings-header-title {
            margin: 0 0 0.5rem 0;
            font-size: 2rem;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .settings-header-subtitle {
            margin: 0;
            opacity: 0.95;
            font-size: 1rem;
          }

          .settings-content-wrapper {
            max-width: 1600px;
            margin: 0 auto;
            width: 100%;
            padding: 2rem;
            margin-top: -40px;
            position: relative;
            z-index: 2;
          }

          .settings-profile-card {
            background: #fff;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
          }

          .settings-profile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #f0f0f0;
            gap: 1rem;
          }

          .settings-profile-header-left {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            flex: 1;
            min-width: 0;
          }

          .settings-avatar-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: #fff;
            font-weight: 700;
            flex-shrink: 0;
          }

          .settings-profile-header-text {
            flex: 1;
            min-width: 0;
          }

          .settings-profile-name {
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: #212529;
            word-wrap: break-word;
          }

          .settings-profile-role {
            margin: 0;
            font-size: 1rem;
            color: #6c757d;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .settings-role-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.375rem 0.75rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            background: #e9f2ff;
            color: #0d6efd;
            white-space: nowrap;
          }

          .settings-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
            border: none;
            white-space: nowrap;
          }

          .settings-btn-edit {
            background: linear-gradient(135deg, #0a1aff 0%, #00b4d8 100%);
            color: #fff;
          }

          .settings-btn-edit:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
          }

          .settings-btn-cancel {
            border: 2px solid #dee2e6;
            background: #fff;
            color: #6c757d;
          }

          .settings-btn-cancel:hover {
            background: #f8f9fa;
            border-color: #adb5bd;
          }

          .settings-btn-save {
            background: linear-gradient(135deg, #198754 0%, #20c997 100%);
            color: #fff;
          }

          .settings-btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
          }

          .settings-btn-save:disabled,
          .settings-btn-cancel:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
          }

          .settings-button-group {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .settings-profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .settings-profile-field {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .settings-field-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .settings-field-value {
            font-size: 1.125rem;
            color: #212529;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            word-break: break-word;
          }

          .settings-field-icon {
            font-size: 1.25rem;
            color: #0d6efd;
            flex-shrink: 0;
          }

          .settings-form-input,
          .settings-form-select {
            width: 100%;
            padding: 0.75rem;
            font-size: 1rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            transition: border-color 0.15s;
            font-weight: 500;
            background-color: #fff;
          }

          .settings-form-input:focus,
          .settings-form-select:focus {
            outline: none;
            border-color: #0d6efd;
          }

          .settings-loading-container {
            text-align: center;
            padding: 3rem 0;
          }

          .settings-edit-error {
            margin-bottom: 1.5rem;
          }

          /* Tablet (992px and below) */
          @media (max-width: 992px) {
            .settings-page-wrapper {
              margin-left: 0;
              width: 100%;
            }
          }

          /* Tablet Portrait (768px and below) */
          @media (max-width: 768px) {
            .settings-dashboard-header {
              padding: 2rem 1.5rem;
              padding-bottom: 50px;
            }

            .settings-content-wrapper {
              padding: 1.5rem;
              margin-top: -30px;
            }

            .settings-header-title {
              font-size: 1.75rem;
            }

            .settings-profile-card {
              padding: 1.5rem;
            }

            .settings-avatar-circle {
              width: 80px;
              height: 80px;
              font-size: 2rem;
            }

            .settings-profile-name {
              font-size: 1.5rem;
            }

            .settings-profile-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .settings-button-group {
              width: 100%;
            }

            .settings-profile-grid {
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            }
          }

          /* Mobile (576px and below) */
          @media (max-width: 576px) {
            .settings-page-wrapper {
              padding-top: 60px;
            }

            .settings-content-wrapper {
              padding: 1rem;
            }

            .settings-header-content {
              flex-direction: column;
              text-align: center;
            }

            .settings-header-text {
              text-align: center;
            }

            .settings-header-title {
              font-size: 1.5rem;
            }

            .settings-profile-card {
              padding: 1rem;
            }

            .settings-profile-header {
              text-align: center;
            }

            .settings-profile-header-left {
              flex-direction: column;
              width: 100%;
            }

            .settings-profile-header-text {
              text-align: center;
            }

            .settings-profile-role {
              justify-content: center;
            }

            .settings-profile-grid {
              grid-template-columns: 1fr;
            }

            .settings-button-group {
              flex-direction: column;
              width: 100%;
            }

            .settings-btn-edit,
            .settings-btn-save,
            .settings-btn-cancel {
              width: 100%;
              justify-content: center;
            }

            .settings-avatar-circle {
              width: 70px;
              height: 70px;
              font-size: 1.75rem;
            }

            .settings-profile-name {
              font-size: 1.25rem;
            }

            .settings-field-value {
              font-size: 1rem;
            }
          }

          /* Extra Small (400px and below) */
          @media (max-width: 400px) {
            .settings-dashboard-header {
              padding: 1.5rem 1rem;
              padding-bottom: 40px;
            }

            .settings-header-icon {
              width: 48px;
              height: 48px;
              font-size: 1.5rem;
            }

            .settings-header-title {
              font-size: 1.25rem;
            }

            .settings-header-subtitle {
              font-size: 0.875rem;
            }

            .settings-profile-card {
              padding: 0.75rem;
            }

            .settings-avatar-circle {
              width: 60px;
              height: 60px;
              font-size: 1.5rem;
            }

            .settings-profile-name {
              font-size: 1.1rem;
            }

            .settings-role-badge {
              font-size: 0.75rem;
              padding: 0.25rem 0.5rem;
            }

            .settings-btn {
              padding: 0.625rem 1rem;
              font-size: 0.875rem;
            }

            .settings-field-label {
              font-size: 0.75rem;
            }

            .settings-field-value {
              font-size: 0.9rem;
            }

            .settings-form-input,
            .settings-form-select {
              padding: 0.625rem;
              font-size: 0.875rem;
            }
          }
        `}
      </style>

      <div className="settings-page-wrapper">
        <header className="settings-dashboard-header">
          <div className="settings-wave"></div>
          <div className="settings-header-content">
            <div className="settings-header-icon">
              <i className="bi bi-gear-fill"></i>
            </div>
            <div className="settings-header-text">
              <h1 className="settings-header-title">Settings</h1>
              <p className="settings-header-subtitle">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </header>

        <div className="settings-content-wrapper">
          {loading && (
            <div className="settings-loading-container">
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
              <div className="settings-profile-card">
                <div className="settings-profile-header">
                  <div className="settings-profile-header-left">
                    <div className="settings-avatar-circle">
                      {getInitials(profile.first_name, profile.last_name)}
                    </div>
                    <div className="settings-profile-header-text">
                      <h2 className="settings-profile-name">
                        {profile.first_name}{" "}
                        {profile.middle_initial ?
                          `${profile.middle_initial}. `
                        : ""}
                        {profile.last_name}
                      </h2>
                      <div className="settings-profile-role">
                        <span className="settings-role-badge">
                          <i className="bi bi-person-badge"></i>
                          {profile.role.charAt(0).toUpperCase() +
                            profile.role.slice(1)}
                        </span>
                        <span style={getStatusBadgeStyle(profile.status)}>
                          <i className="bi bi-fingerprint"></i>
                          {formatStatus(profile.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isEditing ?
                    <button
                      type="button"
                      className="settings-btn settings-btn-edit"
                      onClick={handleEditToggle}>
                      <i className="bi bi-pencil-square"></i>
                      Edit Profile
                    </button>
                  : <div className="settings-button-group">
                      <button
                        type="button"
                        className="settings-btn settings-btn-cancel"
                        onClick={handleEditToggle}
                        disabled={updating}>
                        <i className="bi bi-x-lg"></i>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="settings-btn settings-btn-save"
                        disabled={updating}>
                        {updating ?
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"></span>
                            Saving...
                          </>
                        : <>
                            <i className="bi bi-check-lg"></i>
                            Save Changes
                          </>
                        }
                      </button>
                    </div>
                  }
                </div>

                {editError && (
                  <div className="alert alert-danger settings-edit-error">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {editError}
                  </div>
                )}

                <div className="settings-profile-grid">
                  {profile.student_id_no && (
                    <div className="settings-profile-field">
                      <label className="settings-field-label">Student ID</label>
                      <div className="settings-field-value">
                        <i className="bi bi-card-heading settings-field-icon"></i>
                        {profile.student_id_no}
                      </div>
                    </div>
                  )}

                  <div className="settings-profile-field">
                    <label
                      className="settings-field-label"
                      htmlFor="first_name">
                      First Name
                    </label>
                    {isEditing ?
                      <input
                        className="settings-form-input"
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    : <div className="settings-field-value">
                        <i className="bi bi-person settings-field-icon"></i>
                        {profile.first_name}
                      </div>
                    }
                  </div>

                  <div className="settings-profile-field">
                    <label className="settings-field-label" htmlFor="last_name">
                      Last Name
                    </label>
                    {isEditing ?
                      <input
                        className="settings-form-input"
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    : <div className="settings-field-value">
                        <i className="bi bi-person settings-field-icon"></i>
                        {profile.last_name}
                      </div>
                    }
                  </div>

                  <div className="settings-profile-field">
                    <label
                      className="settings-field-label"
                      htmlFor="middle_initial">
                      Middle Initial
                    </label>
                    {isEditing ?
                      <input
                        className="settings-form-input"
                        type="text"
                        id="middle_initial"
                        name="middle_initial"
                        value={formData.middle_initial}
                        onChange={handleInputChange}
                        maxLength={5}
                      />
                    : <div className="settings-field-value">
                        <i className="bi bi-person settings-field-icon"></i>
                        {profile.middle_initial || "N/A"}
                      </div>
                    }
                  </div>

                  <div className="settings-profile-field">
                    <label className="settings-field-label" htmlFor="email">
                      Email Address
                    </label>
                    {isEditing ?
                      <input
                        className="settings-form-input"
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    : <div className="settings-field-value">
                        <i className="bi bi-envelope settings-field-icon"></i>
                        {profile.email}
                      </div>
                    }
                  </div>

                  <div className="settings-profile-field">
                    <label className="settings-field-label" htmlFor="program">
                      Program
                    </label>
                    {isEditing ?
                      <select
                        className="settings-form-select"
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        required>
                        <option value="BSED">BSED</option>
                        <option value="BSBA">BSBA</option>
                        <option value="BSIT">BSIT</option>
                        <option value="BSCRIM">BSCRIM</option>
                        <option value="BPED">BPED</option>
                        <option value="BEED">BEED</option>
                        <option value="BHumServ">BHumServ</option>
                      </select>
                    : <div className="settings-field-value">
                        <i className="bi bi-mortarboard settings-field-icon"></i>
                        {profile.program}
                      </div>
                    }
                  </div>

                  <div className="settings-profile-field">
                    <label className="settings-field-label">
                      Account Created
                    </label>
                    <div className="settings-field-value">
                      <i className="bi bi-calendar-check settings-field-icon"></i>
                      {formatDate(profile.created_at)}
                    </div>
                  </div>

                  <div className="settings-profile-field">
                    <label className="settings-field-label">Last Updated</label>
                    <div className="settings-field-value">
                      <i className="bi bi-clock-history settings-field-icon"></i>
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
