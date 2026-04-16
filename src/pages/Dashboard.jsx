import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [form, setForm] = useState({
    company: "",
    position: "",
    status: "APPLIED",
    dateApplied: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const statuses = [
    "APPLIED",
    "PHONE_SCREEN",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
  ];

  // Fetch all jobs on load
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs =
    filterStatus === "ALL"
      ? jobs
      : jobs.filter((job) => job.status === filterStatus);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingJob(null);
    setForm({
      company: "",
      position: "",
      status: "APPLIED",
      dateApplied: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setForm({
      company: job.company,
      position: job.position,
      status: job.status,
      dateApplied: job.dateApplied || "",
      notes: job.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        const res = await API.put(`/jobs/${editingJob.id}`, form);
        setJobs(jobs.map((j) => (j.id === editingJob.id ? res.data : j)));
      } else {
        const res = await API.post("/jobs", form);
        setJobs([res.data, ...jobs]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save job:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;
    try {
      await API.delete(`/jobs/${id}`);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="dashboard">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Job Tracker</h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Welcome, {user?.name}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {user?.role === "ADMIN" && (
            <button className="btn-logout" onClick={() => navigate("/admin")}>
              Admin Panel
            </button>
          )}
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <button className="btn-add" onClick={openAddModal}>
        + Add Application
      </button>

      <div className="filter-bar">
        {["ALL", ...statuses].map((s) => (
          <button
            key={s}
            className={`filter-btn ${filterStatus === s ? "active" : ""}`}
            onClick={() => setFilterStatus(s)}
          >
            {s.replace("_", " ")}
            {s === "ALL"
              ? ` (${jobs.length})`
              : ` (${jobs.filter((j) => j.status === s).length})`}
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <h2>
            {filterStatus === "ALL"
              ? "No applications yet"
              : `No ${filterStatus.replace("_", " ")} applications`}
          </h2>
          <p>
            {filterStatus === "ALL"
              ? 'Click "Add Application" to start tracking your job search'
              : "Try a different filter"}
          </p>
        </div>
      ) : (
        filteredJobs.map((job) => (
          <div className="job-card" key={job.id}>
            <div>
              <h3>{job.position}</h3>
              <p>
                {job.company} • {job.dateApplied}
              </p>
              {job.notes && (
                <p style={{ marginTop: "4px", fontStyle: "italic" }}>
                  {job.notes}
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className={`status-badge status-${job.status}`}>
                {job.status.replace("_", " ")}
              </span>
              <div className="job-actions">
                <button onClick={() => openEditModal(job)}>Edit</button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(job.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingJob ? "Edit Application" : "Add Application"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="Job title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date Applied</label>
                <input
                  type="date"
                  name="dateApplied"
                  value={form.dateApplied}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any notes..."
                  rows={3}
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingJob ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
