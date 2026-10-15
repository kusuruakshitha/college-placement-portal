
import { useEffect, useState } from "react";
import AdminStudents from "./AdminStudents";
import AdminOfficers from "./AdminOfficers";
import AdminCompanies from "./AdminCompanies.jsx";
import AdminDrives from "./AdminDrives";
import AdminReports from "./AdminReports";

// Backend base URL only — do not include /api/students here.
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
    label: "Total Students",
    value: "—",
    icon: "♙",
    color: "purple",
    page: "students",
    endpoint: "/api/students",
  },
  {
    label: "Placement Officers",
    value: "—",
    icon: "♧",
    color: "blue",
    page: "officers",
    endpoint: "/api/placement-officers",
  },
  {
    label: "Partner Companies",
    value: "—",
    icon: "▣",
    color: "green",
    page: "companies",
    endpoint: "/api/companies",
  },
  {
    label: "Placement Drives",
    value: "—",
    icon: "◷",
    color: "orange",
    page: "drives",
    endpoint: "/api/placement-drives",
  },
];

function AdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState(initialStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setStatsLoading(true);
      setStatsError("");

      const results = await Promise.all(
        initialStats.map(async (stat) => {
          const url = `${API}${stat.endpoint}`;

          try {
            console.log("Fetching dashboard data:", url);
            console.log("ADMIN DASHBOARD API REQUEST:", url);
   

            const response = await fetch(url, {
              headers: { Accept: "application/json" },
              cache: "no-store",
            });

            console.log(
              `${stat.label} HTTP status:`,
              response.status
            );

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            console.log(`${stat.label} API response:`, data);

            if (!Array.isArray(data)) {
              throw new Error("API response is not a JSON array");
            }

            return {
              ...stat,
              value: data.length,
              failed: false,
              error: "",
            };
          } catch (error) {
            console.error(
              `Failed to load ${stat.label} from ${url}:`,
              error
            );

            return {
              ...stat,
              value: "—",
              failed: true,
              error: error.message || "Request failed",
            };
          }
        })
      );

      if (cancelled) return;

      setStats(results);
      setStatsLoading(false);

      const failedItems = results.filter((item) => item.failed);

      if (failedItems.length > 0) {
        setStatsError(
          `Could not load: ${failedItems
            .map((item) => `${item.label} (${item.error})`)
            .join(", ")}. Check that the backend is running and these API endpoints exist.`
        );
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function refreshStats() {
    if (!statsLoading) {
      setRefreshKey((key) => key + 1);
    }
  }

  function navigateTo(page) {
    setActivePage(page);
  }

  function renderContent() {
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
                onClick={refreshStats}
                disabled={statsLoading}
              >
                {statsLoading ? "Refreshing..." : "↻ Refresh Stats"}
              </button>
            </div>

            {statsError && (
              <p
                role="alert"
                style={{
                  color: "#b42318",
                  overflowWrap: "anywhere",
                }}
              >
                {statsError}
              </p>
            )}

            <section className="admin-stats-grid">
              {stats.map((stat) => (
                <button
                  type="button"
                  className="admin-stat-card admin-stat-clickable"
                  key={stat.label}
                  onClick={() => navigateTo(stat.page)}
                  aria-label={`Open ${stat.label}`}
                  title={`Open ${stat.label}`}
                >
                  <div className={`admin-stat-icon ${stat.color}`}>
                    {stat.icon}
                  </div>

                  <div>
                    <p>{stat.label}</p>

                    <h3>
                      {statsLoading ? "…" : stat.value}
                    </h3>

                    <small>
                      {stat.failed
                        ? "API request failed"
                        : "Click to manage →"}
                    </small>
                  </div>
                </button>
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
                      onClick={() => navigateTo(item.id)}
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
                  <p>Current implementation status</p>
                </div>
              </div>

              <div className="admin-system-row">
                <span>Admin dashboard interface</span>
                <span className="admin-indicator">Created</span>
              </div>

              <div className="admin-system-row">
                <span>Student management API</span>
                <span className="admin-indicator">
                  {statsLoading
                    ? "Loading"
                    : stats.find((item) => item.page === "students")
                        ?.failed
                      ? "Request failed"
                      : "Connected"}
                </span>
              </div>

              <div className="admin-system-row">
                <span>Live dashboard analytics</span>
                <span className="admin-indicator">
                  {statsLoading
                    ? "Loading"
                    : statsError
                      ? "Needs attention"
                      : "Loaded"}
                </span>
              </div>
            </section>
          </>
        );
    }
  }

  const activeItem = navigation.find(
    (item) => item.id === activePage
  );

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
              onClick={() => navigateTo(item.id)}
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
