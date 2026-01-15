import React from "react";
import { Routes, Route } from "react-router-dom";
import Landingpage from "./pages/Landingpage";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import ProgramStudents from "./pages/ProgramStudents";

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
    </Routes>
  );
}

export default App;
