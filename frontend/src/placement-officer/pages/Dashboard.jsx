
import { useEffect, useState } from "react";
import "../App.css";

const API = "http://localhost:8080/api";

function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    students: 0,
    drives: 0,
    applications: 0,
    selected: 0,
    shortlisted: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const endpoints = [
          `${API}/students`,
          `${API}/placement-drives`,
          `${API}/applications`,
        ];

        const responses = await Promise.all(
          endpoints.map((url) =>
            fetch(url, { signal: controller.signal })
          )
        );

        for (const response of responses) {
          if (!response.ok) {
            throw new Error(`API request failed: HTTP ${response.status}`);
          }
        }

        const [students, drives, applications] = await Promise.all(
          responses.map((response) => response.json())
        );

        if (
          !Array.isArray(students) ||
          !Array.isArray(drives) ||
          !Array.isArray(applications)
        ) {
          throw new Error("The backend returned an unexpected data format.");
        }

        setStats({
          students: students.length,
          drives: drives.length,
          applications: applications.length,
          selected: applications.filter(
            (app) => app.status?.toLowerCase() === "selected"
          ).length,
          shortlisted: applications.filter(
            (app) => app.status?.toLowerCase() === "shortlisted"
          ).length,
          pending: applications.filter(
            (app) => app.status?.toLowerCase() === "applied"
          ).length,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadStats();
    return () => controller.abort();
  }, []);

  const cards = [
    { title: "Total Students", value: stats.students, icon: "🎓", color: "blue", target: "Students" },
    { title: "Placement Drives", value: stats.drives, icon: "🏢", color: "purple", target: "Placement Drives" },
    { title: "Total Applications", value: stats.applications, icon: "📄", color: "orange", target: "Applications" },
    { title: "Students Selected", value: stats.selected, icon: "✓", color: "green", target: "Applications" },
  ];

  const progressItems = [
    { label: "Selected", value: stats.selected, color: "green-fill" },
    { label: "Shortlisted", value: stats.shortlisted, color: "purple-fill" },
    { label: "Applied / Pending", value: stats.pending, color: "blue-fill" },
  ];

  function navigate(target) {
    if (typeof setActivePage === "function") setActivePage(target);
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">PLACEMENT MANAGEMENT</p>
          <h1>Placement Officer Dashboard</h1>
          <p>Monitor student progress, recruitment drives, and placement outcomes from one place.</p>
        </div>
        <div className="dashboard-welcome-icon">📊</div>
      </section>

      {error && (
        <p role="alert" className="error-message">
          {error} Check that the Spring Boot backend is running and the API endpoints exist.
        </p>
      )}

      <section className="dashboard-stats">
        {cards.map((card) => (
          <article
            className="dashboard-stat-card dashboard-stat-clickable"
            key={card.title}
            role="button"
            tabIndex={0}
            onClick={() => navigate(card.target)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(card.target);
              }
            }}
          >
            <div className={`dashboard-stat-icon ${card.color}`}>{card.icon}</div>
            <div className="dashboard-stat-details">
              <p>{card.title}</p>
              <h2>{loading ? "…" : card.value}</h2>
            </div>
            <span className="dashboard-card-arrow">→</span>
          </article>
        ))}
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel">
          <h2>Application Overview</h2>
          <p className="dashboard-panel-subtitle">Current recruitment progress</p>

          {progressItems.map((item) => {
            const percentage = stats.applications
              ? Math.min(100, (item.value / stats.applications) * 100)
              : 0;

            return (
              <div className="dashboard-progress-row" key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <strong>{loading ? "…" : item.value}</strong>
                </div>
                <div className="dashboard-progress-track">
                  <div
                    className={`dashboard-progress-fill ${item.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </article>

        <article className="dashboard-panel">
          <h2>Quick Summary</h2>
          <p className="dashboard-panel-subtitle">Your placement activity at a glance</p>

          {[
            ["🎓", "Student Records", "Students registered in the portal", stats.students],
            ["🏢", "Recruitment Drives", "Company drives recorded", stats.drives],
            ["📄", "Applications", "Total recorded applications", stats.applications],
          ].map(([icon, title, description, value]) => (
            <div className="dashboard-summary-item" key={title}>
              <span className="summary-icon">{icon}</span>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <b>{loading ? "…" : value}</b>
            </div>
          ))}
        </article>
      </section>

      <p className="dashboard-footer">
        Placement Management System · Dashboard overview
      </p>
    </main>
  );
}

export default Dashboard;
