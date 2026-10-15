
import { useState, useEffect, useCallback } from "react";

import AdminStudents from "./AdminStudents";
import AdminOfficers from "./AdminOfficers";
import AdminCompanies from "./AdminCompanies";
import AdminDrives from "./AdminDrives";
import AdminReports from "./AdminReports";

const API = "http://localhost:8080";

const navigation = [
  { id: "dashboard", icon: "⌂", label: "Dashboard" },
  { id: "students", icon: "♙", label: "Students" },
  { id: "officers", icon: "♧", label: "Placement Officers" },
  { id: "companies", icon: "▣", label: "Companies" },
  { id: "drives", icon: "◷", label: "Placement Drives" },
  { id: "reports", icon: "▤", label: "Reports & Analytics" },
];

const initialStats = [
  {
    id: "students",
    label: "Total Students",
    endpoint: "/api/students",
    icon: "♙",
    color: "purple",
  },
  {
    id: "officers",
    label: "Placement Officers",
    endpoint: "/api/placement-officers",
    icon: "♧",
    color: "blue",
  },
  {
    id: "companies",
    label: "Partner Companies",
    endpoint: "/api/companies",
    icon: "▣",
    color: "green",
  },
  {
    id: "drives",
    label: "Placement Drives",
    endpoint: "/api/placement-drives",
    icon: "◷",
    color: "orange",
  },
];

function getRecords(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    const keys = [
      "content",
      "data",
      "students",
      "placementOfficers",
      "officers",
      "companies",
      "placementDrives",
      "drives",
      "results",
    ];

    for (const key of keys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }

  return null;
}

function AdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const [stats, setStats] = useState(() =>
    initialStats.map((item) => ({
      ...item,
      value: null,
      error: false,
    }))
  );

  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const fetchStats = useCallback(async (signal) => {
    const results = await Promise.all(
      initialStats.map(async (stat) => {
        try {
          const response = await fetch(`${API}${stat.endpoint}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          const records = getRecords(data);

          if (records === null) {
            throw new Error("Unexpected API response format");
          }

          console.log(
            `Admin dashboard: ${stat.label}:`,
            records.length
          );

          return {
            id: stat.id,
            value: records.length,
            error: false,
          };
        } catch (error) {
          if (error.name === "AbortError") {
            throw error;
          }

          console.error(`Failed to load ${stat.label}:`, error);

          return {
            id: stat.id,
            value: null,
            error: true,
          };
        }
      })
    );

    if (signal?.aborted) {
      return;
    }

    setStats((currentStats) =>
      currentStats.map((stat) => {
        const result = results.find(
          (item) => item.id === stat.id
        );

        return result ? { ...stat, ...result } : stat;
      })
    );

    if (results.every((item) => item.error)) {
      setDashboardError(
        "Unable to load dashboard statistics. Check the backend and API access."
      );
    } else if (results.some((item) => item.error)) {
      setDashboardError(
        "Some statistics could not be loaded. Check the browser console."
      );
    } else {
      setDashboardError("");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      try {
        await fetchStats(controller.signal);
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          console.error("Dashboard loading error:", error);
          setDashboardError(
            "Unable to load dashboard statistics."
          );
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => controller.abort();
  }, [fetchStats]);

  const handleRefresh = async () => {
    const controller = new AbortController();

    setLoading(true);
    setDashboardError("");

    try {
      await fetchStats(controller.signal);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Refresh error:", error);
        setDashboardError("Unable to refresh dashboard.");
        setLoading(false);
      }
    }
  };

  const activeItem = navigation.find(
    (item) => item.id === activePage
  );

  const renderContent = () => {
    switch (activePage) {
      case "students":
        return <AdminStudents />;

      case "officers":
        return <AdminOfficers />;

      case "companies":
        return <AdminCompanies />;

      case "drives":
        return <AdminDrives />;

      case "reports":
        return <AdminReports />;

      default:
        return (
          <>
            <section className="admin-welcome">
              <div>
                <span className="admin-eyebrow">
                  ADMINISTRATION
                </span>

                <h2>
                  Welcome back, {user?.username || "Administrator"}!
                </h2>

                <p>
                  Manage campus recruitment from one central dashboard.
                </p>
              </div>

              <div className="admin-welcome-icon">✦</div>
            </section>

            <div className="admin-section-title">
              <div>
                <h2>Overview</h2>
                <p>Placement portal management at a glance</p>
              </div>

              <button
                type="button"
                className="admin-status"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>

            {dashboardError && (
              <div
                role="alert"
                style={{
                  marginBottom: "20px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#fff1f0",
                  color: "#b42318",
                  fontSize: "13px",
                }}
              >
                {dashboardError}
              </div>
            )}

            <section className="admin-stats-grid">
              {stats.map((stat) => (
                <article
                  className="admin-stat-card"
                  key={stat.id}
                >
                  <div
                    className={`admin-stat-icon ${stat.color}`}
                  >
                    {stat.icon}
                  </div>

                  <div>
                    <p>{stat.label}</p>

                    <h3>
                      {loading && stat.value === null
                        ? "..."
                        : stat.error
                          ? "N/A"
                          : stat.value ?? "—"}
                    </h3>

                    <small>
                      {stat.error
                        ? "Could not load data"
                        : stat.value === null
                          ? "Loading records..."
                          : "Live backend records"}
                    </small>
                  </div>
                </article>
              ))}
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Management Centre</h2>
                  <p>Choose an area to manage.</p>
                </div>
              </div>

              <div className="admin-quick-grid">
                {navigation
                  .filter((item) => item.id !== "dashboard")
                  .map((item) => (
                    <button
                      type="button"
                      className="admin-quick-card"
                      key={item.id}
                      onClick={() => setActivePage(item.id)}
                    >
                      <span className="admin-quick-icon">
                        {item.icon}
                      </span>

                      <strong>{item.label}</strong>

                      <span>Open module →</span>
                    </button>
                  ))}
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>System Status</h2>
                  <p>Current connection status</p>
                </div>
              </div>

              <div className="admin-system-row">
                <span>Admin dashboard interface</span>
                <span className="admin-indicator">Active</span>
              </div>

              <div className="admin-system-row">
                <span>Spring Boot backend</span>
                <span
                  className={
                    stats.some((item) => item.value !== null)
                      ? "admin-indicator"
                      : "admin-indicator pending"
                  }
                >
                  {loading
                    ? "Checking..."
                    : stats.some((item) => item.value !== null)
                      ? "Connected"
                      : "Unavailable"}
                </span>
              </div>

              <div className="admin-system-row">
                <span>Dashboard statistics</span>
                <span
                  className={
                    !stats.some((item) => item.error)
                      ? "admin-indicator"
                      : "admin-indicator pending"
                  }
                >
                  {loading
                    ? "Loading"
                    : stats.every((item) => !item.error)
                      ? "Loaded"
                      : "Partially loaded"}
                </span>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="admin-app">
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="admin-brand-icon">CP</div>

          <div>
            <h1>College Placement Portal</h1>
            <p>Administration Console</p>
          </div>
        </div>

        <div className="admin-user-section">
          <div className="admin-user-avatar">
            {(user?.username || "A").charAt(0).toUpperCase()}
          </div>

          <div className="admin-user-details">
            <strong>{user?.username || "Administrator"}</strong>
            <span>Administrator</span>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="admin-sidebar-label">ADMIN MENU</p>

          {navigation.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                activePage === item.id
                  ? "admin-nav-item active"
                  : "admin-nav-item"
              }
              onClick={() => setActivePage(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="admin-sidebar-footer">
            <span className="admin-footer-dot" />
            College Placement Analytics
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-breadcrumb">
            <span>Admin</span>
            <span>/</span>
            <strong>{activeItem?.label || "Dashboard"}</strong>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
