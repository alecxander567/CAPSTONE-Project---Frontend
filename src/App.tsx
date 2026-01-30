import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landingpage from "./pages/Landingpage/Landingpage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Programs from "./pages/Programs/Programs";
import ProgramStudents from "./pages/Programs/ProgramStudents";
import Events from "./pages/Events/Events";
import Notifications from "./pages/Notifications/Notifications";
import { registerSW } from "./serviceWorker";
import Attendance from "./pages/Attendance/Attendance";
import AttendanceHistory from "./pages/Attendance History/AttendanceHistory";
import Calendar from "./pages/Calendar/Calendar";
import Settings from "./pages/SettingsProfile/Settings";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service Worker registered"))
    .catch(console.error);
}

function App() {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/programs" element={<Programs />} />
      <Route
        path="/programs/:programCode/students"
        element={<ProgramStudents />}
      />
      <Route path="/events" element={<Events />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/attendance/:eventId" element={<Attendance />} />
      <Route path="/attendancehistory" element={<AttendanceHistory />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/Settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
