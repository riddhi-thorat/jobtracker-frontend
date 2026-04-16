import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Admin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0 });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
        API.get("/admin/jobs"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage users and applications</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-logout" onClick={() => navigate("/dashboard")}>
            My Dashboard
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalJobs}</h3>
          <p>Total Applications</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-bar" style={{ marginTop: "24px" }}>
        <button
          className={`filter-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
        </button>
        <button
          className={`filter-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          All Applications ({jobs.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" &&
        users.map((u) => (
          <div className="job-card" key={u.id}>
            <div>
              <h3>{u.name}</h3>
              <p>{u.email}</p>
            </div>
            <span
              className={`status-badge ${u.role === "ADMIN" ? "status-OFFER" : "status-APPLIED"}`}
            >
              {u.role}
            </span>
          </div>
        ))}

      {/* Jobs Tab */}
      {activeTab === "jobs" &&
        jobs.map((job) => (
          <div className="job-card" key={job.id}>
            <div>
              <h3>{job.position}</h3>
              <p>
                {job.company} • {job.dateApplied}
              </p>
            </div>
            <span className={`status-badge status-${job.status}`}>
              {job.status.replace("_", " ")}
            </span>
          </div>
        ))}
    </div>
  );
};

export default Admin;
