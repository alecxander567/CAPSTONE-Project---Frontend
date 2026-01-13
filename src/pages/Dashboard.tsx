import { useLogout } from "../hooks/Logout";

function Dashboard() {
  const { logout } = useLogout();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to your Dashboard</h1>
      <button
        className="btn btn-danger"
        style={{ marginTop: "1rem" }}
        onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
