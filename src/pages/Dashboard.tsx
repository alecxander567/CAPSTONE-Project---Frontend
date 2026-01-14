import Sidebar from "../components/Sidebar";
import "./Dashboard/Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <h1>Welcome to your Dashboard</h1>
        <p>Dashboard content goes here.</p>
      </main>
    </div>
  );
}

export default Dashboard;
