import { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  // =========================
  // LOGIN STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  // =========================
  // PAGE NAVIGATION
  // =========================

  const [activePage, setActivePage] = useState("dashboard");

  // =========================
  // REQUEST STATE
  // =========================

  const [requests, setRequests] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("cat001");

  // Used by Service Lead
  const [staffId, setStaffId] = useState("");

  // =========================
  // CATEGORY NAMES
  // =========================

  const categoryNames = {
    cat001: "Bonafide Certificate",
    cat002: "ID Card",
    cat003: "Hostel",
    cat004: "Transport",
    cat005: "Library",
    cat006: "IT Support",
  };

  // =========================
  // STATUS LABELS
  // =========================

  const statusLabels = {
    new: "New",
    assigned: "Assigned",
    in_progress: "In Progress",
    on_hold: "On Hold",
    resolved: "Resolved",
    closed: "Closed",
  };

  // =========================
  // ROLE NAMES
  // =========================

  const roleNames = {
    student: "Student",
    faculty: "Faculty",
    service_staff: "Service Staff",
    service_lead: "Service Lead",
    admin: "Administrator",
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  // =========================
  // LOAD REQUESTS
  // =========================

  const loadRequests = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/service-requests/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Could not load requests");
        return;
      }

      setRequests(data);
    } catch (error) {
      alert("Could not connect to backend");
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const loginResponse = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        alert(loginData.detail || "Login failed");
        return;
      }

      const token = loginData.access_token;

      localStorage.setItem("access_token", token);

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      const userId = payload.sub;

      const userResponse = await fetch(
        `${API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        alert("Could not get user details");
        return;
      }

      setUser(userData);

      // Always start at Dashboard
      setActivePage("dashboard");

      // Clear login fields
      setEmail("");
      setPassword("");
    } catch (error) {
      alert("Could not connect to backend");
    }
  };

  // =========================
  // AUTOMATICALLY LOAD REQUESTS
  // AFTER LOGIN
  // =========================

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  // =========================
  // CREATE REQUEST
  // =========================

  const createRequest = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/service-requests/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            category_id: categoryId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Could not create request");
        return;
      }

      alert("Service request created successfully!");

      setTitle("");
      setDescription("");
      setCategoryId("cat001");

      await loadRequests();

      // After creating, show My Requests
      setActivePage("my-requests");
    } catch (error) {
      alert("Could not connect to backend");
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (requestId, newStatus) => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${API_URL}/service-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Could not update status");
        return;
      }

      await loadRequests();
    } catch (error) {
      alert("Could not connect to backend");
    }
  };

  // =========================
  // ASSIGN REQUEST
  // =========================

  const assignRequest = async (requestId) => {
    const token = localStorage.getItem("access_token");

    if (!staffId.trim()) {
      alert("Enter staff ID");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/service-requests/${requestId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assigned_to: staffId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Could not assign request");
        return;
      }

      alert("Request assigned successfully!");

      setStaffId("");

      await loadRequests();
    } catch (error) {
      alert("Could not connect to backend");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setUser(null);

    setEmail("");
    setPassword("");

    setRequests([]);

    setTitle("");
    setDescription("");
    setCategoryId("cat001");

    setStaffId("");

    setActivePage("dashboard");
  };

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-brand">

            <div className="brand-icon">
              CS
            </div>

            <div>
              <h1>College Service</h1>
              <p>Request Management System</p>
            </div>

          </div>

          <div className="login-heading">

            <h2>Welcome back</h2>

            <p>
              Sign in to access your service dashboard.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="login-form"
          >

            <div className="form-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your college email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="primary-button full-width"
            >
              Sign In
            </button>

          </form>

          <div className="login-footer">
            College Service Request System
          </div>

        </div>
      </div>
    );
  }

  // =========================
  // COUNTS
  // =========================

  const openRequests = requests.filter(
    (r) =>
      r.status !== "closed" &&
      r.status !== "resolved"
  ).length;

  const completedRequests = requests.filter(
    (r) =>
      r.status === "resolved" ||
      r.status === "closed"
  ).length;

  const assignedRequests = requests.filter(
    (r) =>
      r.status === "assigned" ||
      r.status === "in_progress" ||
      r.status === "on_hold"
  );

  // =========================
  // SIDEBAR NAVIGATION
  // =========================

  const navigateTo = (page) => {
    setActivePage(page);

    // Reload requests when opening request pages
    if (
      page === "my-requests" ||
      page === "assigned-requests" ||
      page === "all-requests"
    ) {
      loadRequests();
    }
  };

  // =========================
  // MAIN DASHBOARD
  // =========================

  const renderDashboard = () => {
    // =========================
    // STUDENT / FACULTY DASHBOARD
    // =========================

    if (
      user.role === "student" ||
      user.role === "faculty"
    ) {
      return (
        <>
          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon blue">
                ▣
              </div>

              <div>
                <span>Total Requests</span>
                <strong>{requests.length}</strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">
                ◷
              </div>

              <div>
                <span>Open Requests</span>
                <strong>{openRequests}</strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedRequests}</strong>
              </div>

            </div>

          </section>

          <section className="content-grid">

            <div className="panel">

              <div className="panel-header">

                <div>
                  <h2>Create Service Request</h2>

                  <p>
                    Submit a new request to the service office.
                  </p>
                </div>

              </div>

              <form
                onSubmit={createRequest}
                className="request-form"
              >

                <div className="form-group">

                  <label>Request Title</label>

                  <input
                    type="text"
                    placeholder="Enter request title"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>Description</label>

                  <textarea
                    placeholder="Describe your request"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>Service Category</label>

                  <select
                    value={categoryId}
                    onChange={(e) =>
                      setCategoryId(e.target.value)
                    }
                  >

                    <option value="cat001">
                      Bonafide Certificate
                    </option>

                    <option value="cat002">
                      ID Card
                    </option>

                    <option value="cat003">
                      Hostel
                    </option>

                    <option value="cat004">
                      Transport
                    </option>

                    <option value="cat005">
                      Library
                    </option>

                    <option value="cat006">
                      IT Support
                    </option>

                  </select>

                </div>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Create Request
                </button>

              </form>

            </div>

          </section>

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>Recent Requests</h2>

                <p>
                  View your latest service requests.
                </p>

              </div>

              <button
                onClick={() =>
                  navigateTo("my-requests")
                }
                className="secondary-button"
              >
                View All
              </button>

            </div>

            <RequestList
              requests={requests.slice(0, 3)}
              categoryNames={categoryNames}
              statusLabels={statusLabels}
              getStatusClass={getStatusClass}
            />

          </section>
        </>
      );
    }

    // =========================
    // SERVICE STAFF DASHBOARD
    // =========================

    if (user.role === "service_staff") {
      return (
        <>
          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon blue">
                ✓
              </div>

              <div>
                <span>Assigned Requests</span>
                <strong>{requests.length}</strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">
                ◷
              </div>

              <div>
                <span>In Progress</span>

                <strong>
                  {
                    requests.filter(
                      (r) =>
                        r.status === "in_progress"
                    ).length
                  }
                </strong>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <span>Completed</span>

                <strong>
                  {
                    requests.filter(
                      (r) =>
                        r.status === "resolved" ||
                        r.status === "closed"
                    ).length
                  }
                </strong>

              </div>

            </div>

          </section>

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>Assigned Requests</h2>

                <p>
                  You have {requests.length} assigned request(s).
                </p>

              </div>

              <button
                className="primary-button"
                onClick={() =>
                  navigateTo("assigned-requests")
                }
              >
                Open Assigned Requests
              </button>

            </div>

            {requests.length === 0 ? (
              <EmptyState
                message="No assigned requests found."
              />
            ) : (
              <div className="request-list">

                {requests.slice(0, 3).map(
                  (request) => (
                    <div
                      className="request-card"
                      key={request.id}
                    >

                      <div className="request-card-top">

                        <div>

                          <span className="request-category">
                            {categoryNames[
                              request.category_id
                            ] ||
                              request.category_id}
                          </span>

                          <h3>
                            {request.title}
                          </h3>

                        </div>

                        <span
                          className={getStatusClass(
                            request.status
                          )}
                        >
                          {
                            statusLabels[
                              request.status
                            ] || request.status
                          }
                        </span>

                      </div>

                      <p className="request-description">
                        {request.description}
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

          </section>
        </>
      );
    }

    // =========================
    // SERVICE LEAD DASHBOARD
    // =========================

    if (user.role === "service_lead") {
      return (
        <>
          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon blue">
                ≡
              </div>

              <div>
                <span>Total Requests</span>
                <strong>{requests.length}</strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">
                ◷
              </div>

              <div>
                <span>Unassigned</span>

                <strong>
                  {
                    requests.filter(
                      (r) =>
                        !r.assigned_to
                    ).length
                  }
                </strong>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <span>Completed</span>

                <strong>
                  {
                    requests.filter(
                      (r) =>
                        r.status === "resolved" ||
                        r.status === "closed"
                    ).length
                  }
                </strong>

              </div>

            </div>

          </section>

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>Service Request Management</h2>

                <p>
                  Monitor and assign service requests.
                </p>

              </div>

              <button
                className="primary-button"
                onClick={() =>
                  navigateTo("all-requests")
                }
              >
                Open All Requests
              </button>

            </div>

            <RequestList
              requests={requests.slice(0, 5)}
              categoryNames={categoryNames}
              statusLabels={statusLabels}
              getStatusClass={getStatusClass}
            />

          </section>
        </>
      );
    }

    // =========================
    // ADMIN DASHBOARD
    // =========================

    if (user.role === "admin") {
      return (
        <>
          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon blue">
                U
              </div>

              <div>
                <span>System Users</span>
                <strong>5</strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon purple">
                S
              </div>

              <div>
                <span>Service Categories</span>
                <strong>6</strong>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <span>System Status</span>
                <strong>Active</strong>
              </div>

            </div>

          </section>

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>Administration</h2>

                <p>
                  Manage the college service request system.
                </p>

              </div>

              <button
                className="primary-button"
                onClick={() =>
                  navigateTo("administration")
                }
              >
                Open Administration
              </button>

            </div>

            <div className="admin-grid">

              <div className="panel">

                <div className="admin-icon blue-bg">
                  U
                </div>

                <h2>User Management</h2>

                <p>
                  Manage student, faculty, service staff,
                  service lead, and administrator accounts.
                </p>

              </div>

              <div className="panel">

                <div className="admin-icon purple-bg">
                  S
                </div>

                <h2>Service Categories</h2>

                <p>
                  Manage the service categories available
                  in the college service system.
                </p>

              </div>

              <div className="panel">

                <div className="admin-icon green-bg">
                  ⚙
                </div>

                <h2>System Configuration</h2>

                <p>
                  Administrative configuration for the
                  college service request system.
                </p>

              </div>

            </div>

          </section>
        </>
      );
    }

    return null;
  };

  // =========================
  // MY REQUESTS PAGE
  // STUDENT / FACULTY
  // =========================

  const renderMyRequests = () => {
    return (
      <>
        <section className="page-intro">

          <div>

            <h2>My Requests</h2>

            <p>
              View and track all requests submitted by you.
            </p>

          </div>

          <button
            onClick={loadRequests}
            className="primary-button"
          >
            Refresh Requests
          </button>

        </section>

        <section className="panel requests-panel">

          <RequestList
            requests={requests}
            categoryNames={categoryNames}
            statusLabels={statusLabels}
            getStatusClass={getStatusClass}
          />

        </section>
      </>
    );
  };

  // =========================
  // ASSIGNED REQUESTS PAGE
  // SERVICE STAFF
  // =========================

  const renderAssignedRequests = () => {
    return (
      <>
        <section className="page-intro">

          <div>

            <h2>Assigned Requests</h2>

            <p>
              View and process service requests assigned to you.
            </p>

          </div>

          <button
            onClick={loadRequests}
            className="primary-button"
          >
            Refresh Requests
          </button>

        </section>

        <section className="request-list">

          {requests.length === 0 ? (
            <EmptyState
              message="No assigned requests found."
            />
          ) : (
            requests.map((request) => (

              <div
                className="request-card"
                key={request.id}
              >

                <div className="request-card-top">

                  <div>

                    <span className="request-category">
                      {categoryNames[
                        request.category_id
                      ] ||
                        request.category_id}
                    </span>

                    <h3>
                      {request.title}
                    </h3>

                  </div>

                  <span
                    className={getStatusClass(
                      request.status
                    )}
                  >
                    {
                      statusLabels[
                        request.status
                      ] || request.status
                    }
                  </span>

                </div>

                <p className="request-description">
                  {request.description}
                </p>

                <div className="request-actions">

                  {request.status === "assigned" && (
                    <button
                      className="primary-button"
                      onClick={() =>
                        updateStatus(
                          request.id,
                          "in_progress"
                        )
                      }
                    >
                      Start Processing
                    </button>
                  )}

                  {request.status === "in_progress" && (
                    <>
                      <button
                        className="warning-button"
                        onClick={() =>
                          updateStatus(
                            request.id,
                            "on_hold"
                          )
                        }
                      >
                        Put On Hold
                      </button>

                      <button
                        className="success-button"
                        onClick={() =>
                          updateStatus(
                            request.id,
                            "resolved"
                          )
                        }
                      >
                        Resolve
                      </button>
                    </>
                  )}

                  {request.status === "on_hold" && (
                    <button
                      className="primary-button"
                      onClick={() =>
                        updateStatus(
                          request.id,
                          "in_progress"
                        )
                      }
                    >
                      Resume
                    </button>
                  )}

                  {request.status === "resolved" && (
                    <button
                      className="success-button"
                      onClick={() =>
                        updateStatus(
                          request.id,
                          "closed"
                        )
                      }
                    >
                      Close Request
                    </button>
                  )}

                  {request.status === "closed" && (
                    <span className="completed-text">
                      ✓ Request completed
                    </span>
                  )}

                </div>

              </div>

            ))
          )}

        </section>
      </>
    );
  };

  // =========================
  // ALL REQUESTS PAGE
  // SERVICE LEAD
  // =========================

  const renderAllRequests = () => {
    return (
      <>
        <section className="page-intro">

          <div>

            <h2>All Service Requests</h2>

            <p>
              Monitor requests and assign them to service staff.
            </p>

          </div>

          <button
            onClick={loadRequests}
            className="primary-button"
          >
            Refresh Requests
          </button>

        </section>

        <section className="request-list">

          {requests.length === 0 ? (
            <EmptyState
              message="No service requests found."
            />
          ) : (
            requests.map((request) => (

              <div
                className="request-card"
                key={request.id}
              >

                <div className="request-card-top">

                  <div>

                    <span className="request-category">
                      {categoryNames[
                        request.category_id
                      ] ||
                        request.category_id}
                    </span>

                    <h3>
                      {request.title}
                    </h3>

                  </div>

                  <span
                    className={getStatusClass(
                      request.status
                    )}
                  >
                    {
                      statusLabels[
                        request.status
                      ] || request.status
                    }
                  </span>

                </div>

                <p className="request-description">
                  {request.description}
                </p>

                <div className="assignment-info">

                  <span>Assigned Staff</span>

                  <strong>
                    {request.assigned_to ||
                      "Not Assigned"}
                  </strong>

                </div>

                <div className="assignment-area">

                  <input
                    type="text"
                    placeholder="Enter staff ID e.g. staff001"
                    value={staffId}
                    onChange={(e) =>
                      setStaffId(e.target.value)
                    }
                  />

                  <button
                    className="primary-button"
                    onClick={() =>
                      assignRequest(request.id)
                    }
                  >
                    Assign / Reassign
                  </button>

                </div>

              </div>

            ))
          )}

        </section>
      </>
    );
  };

  // =========================
  // ADMINISTRATION PAGE
  // =========================

  const renderAdministration = () => {
    return (
      <>
        <section className="page-intro">

          <div>

            <h2>Administration</h2>

            <p>
              Manage system users, service categories,
              and configuration.
            </p>

          </div>

        </section>

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              U
            </div>

            <div>
              <span>System Users</span>
              <strong>5</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              S
            </div>

            <div>
              <span>Service Categories</span>
              <strong>6</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>System Status</span>
              <strong>Active</strong>
            </div>

          </div>

        </section>

        <section className="admin-grid">

          <div className="panel">

            <div className="admin-icon blue-bg">
              U
            </div>

            <h2>User Management</h2>

            <p>
              Manage student, faculty, service staff,
              service lead, and administrator accounts.
            </p>

            <div className="feature-label">
              Available
            </div>

          </div>

          <div className="panel">

            <div className="admin-icon purple-bg">
              S
            </div>

            <h2>Service Categories</h2>

            <p>
              Manage the service categories available
              in the college service system.
            </p>

            <div className="feature-label">
              Available
            </div>

          </div>

          <div className="panel">

            <div className="admin-icon green-bg">
              ⚙
            </div>

            <h2>System Configuration</h2>

            <p>
              Administrative configuration for the
              college service request system.
            </p>

            <div className="feature-label">
              Available
            </div>

          </div>

        </section>
      </>
    );
  };

  // =========================
  // PAGE CONTENT
  // =========================

  const renderPage = () => {

    if (activePage === "dashboard") {
      return renderDashboard();
    }

    if (
      activePage === "my-requests" &&
      (user.role === "student" ||
        user.role === "faculty")
    ) {
      return renderMyRequests();
    }

    if (
      activePage === "assigned-requests" &&
      user.role === "service_staff"
    ) {
      return renderAssignedRequests();
    }

    if (
      activePage === "all-requests" &&
      user.role === "service_lead"
    ) {
      return renderAllRequests();
    }

    if (
      activePage === "administration" &&
      user.role === "admin"
    ) {
      return renderAdministration();
    }

    return renderDashboard();
  };

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon small">
            CS
          </div>

          <div>

            <h2>College Service</h2>

            <span>
              Request System
            </span>

          </div>

        </div>

        <div className="sidebar-divider"></div>

        <nav className="sidebar-nav">

          {/* DASHBOARD */}

          <div
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigateTo("dashboard")
            }
          >

            <span className="nav-icon">
              ⌂
            </span>

            Dashboard

          </div>

          {/* STUDENT / FACULTY */}

          {(user.role === "student" ||
            user.role === "faculty") && (

            <div
              className={`nav-item ${
                activePage === "my-requests"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigateTo("my-requests")
              }
            >

              <span className="nav-icon">
                ▣
              </span>

              My Requests

            </div>

          )}

          {/* SERVICE STAFF */}

          {user.role === "service_staff" && (

            <div
              className={`nav-item ${
                activePage ===
                "assigned-requests"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigateTo("assigned-requests")
              }
            >

              <span className="nav-icon">
                ✓
              </span>

              Assigned Requests

            </div>

          )}

          {/* SERVICE LEAD */}

          {user.role === "service_lead" && (

            <div
              className={`nav-item ${
                activePage === "all-requests"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigateTo("all-requests")
              }
            >

              <span className="nav-icon">
                ≡
              </span>

              All Requests

            </div>

          )}

          {/* ADMIN */}

          {user.role === "admin" && (

            <div
              className={`nav-item ${
                activePage ===
                "administration"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigateTo("administration")
              }
            >

              <span className="nav-icon">
                ⚙
              </span>

              Administration

            </div>

          )}

        </nav>

        {/* =========================
            SIDEBAR BOTTOM
        ========================= */}

        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="avatar">

              {user.name
                ?.charAt(0)
                .toUpperCase()}

            </div>

            <div className="user-mini-info">

              <strong>
                {user.name}
              </strong>

              <span>
                {roleNames[user.role]}
              </span>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >

            <span>↪</span>

            Logout

          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <div>

            <p className="topbar-label">
              {activePage === "dashboard"
                ? "Dashboard"
                : activePage === "my-requests"
                ? "My Requests"
                : activePage ===
                  "assigned-requests"
                ? "Assigned Requests"
                : activePage ===
                  "all-requests"
                ? "All Requests"
                : "Administration"}
            </p>

            <h1>
              Welcome back, {user.name}
            </h1>

          </div>

          <div className="topbar-user">

            <div className="avatar large">

              {user.name
                ?.charAt(0)
                .toUpperCase()}

            </div>

            <div>

              <strong>
                {user.name}
              </strong>

              <span>
                {roleNames[user.role]}
              </span>

            </div>

          </div>

        </header>

        {/* =========================
            CURRENT PAGE
        ========================= */}

        {renderPage()}

      </main>

    </div>
  );
}

// =========================
// REQUEST LIST COMPONENT
// =========================

function RequestList({
  requests,
  categoryNames,
  statusLabels,
  getStatusClass,
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        message="No service requests found. Click Refresh Requests to load your requests."
      />
    );
  }

  return (
    <div className="request-table">

      <div className="table-header">

        <span>Request</span>

        <span>Category</span>

        <span>Status</span>

      </div>

      {requests.map((request) => (

        <div
          className="table-row"
          key={request.id}
        >

          <div className="table-request">

            <strong>
              {request.title}
            </strong>

            <span>
              {request.description}
            </span>

          </div>

          <span>

            {categoryNames[
              request.category_id
            ] ||
              request.category_id}

          </span>

          <span
            className={getStatusClass(
              request.status
            )}
          >

            {
              statusLabels[
                request.status
              ] || request.status
            }

          </span>

        </div>

      ))}

    </div>
  );
}

// =========================
// EMPTY STATE
// =========================

function EmptyState({ message }) {
  return (
    <div className="empty-state">

      <div className="empty-icon">
        ▣
      </div>

      <p>
        {message}
      </p>

    </div>
  );
}

export default App;
