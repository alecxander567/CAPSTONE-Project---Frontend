import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { registerSW } from "./serviceWorker";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Admin pages
import Landingpage from "./pages/Landingpage/Landingpage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Programs from "./pages/Programs/Programs";
import ProgramStudents from "./pages/Programs/ProgramStudents";
import Events from "./pages/Events/Events";
import Attendance from "./pages/Attendance/Attendance";
import Notifications from "./pages/Notifications/Notifications";
import AttendanceHistory from "./pages/Attendance History/AttendanceHistory";
import Calendar from "./pages/Calendar/Calendar";
import Settings from "./pages/SettingsProfile/Settings";

// Student pages
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import StudentEvents from "./pages/StudentEvents/StudentEvents";
import StudentNotifications from "./pages/StudentNotification/StudentNotification";
import StudentCalendar from "./pages/StudentCalendar/StudentCalendar";
import StudentAttendanceHistory from "./pages/StudentAttendanceHistory/StudentAttendanceHistory";
import StudentSettings from "./pages/StudentSettings/StudentSettings";

function App() {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landingpage />} />

      {/* ── Admin only ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Programs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/programs/:programCode/students"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProgramStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/:eventId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendancehistory"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AttendanceHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ── Student only ── */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-events"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-calendar"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-notifications"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-attendancehistory"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentAttendanceHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-settings"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
