import React from "react";
import { Routes, Route } from "react-router-dom";
import Landingpage from "./pages/Landingpage";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import ProgramStudents from "./pages/ProgramStudents";
import Events from "./pages/Events";
import Notifications from "./pages/Notifications";

function App() {
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
    </Routes>
  );
}

export default App;
