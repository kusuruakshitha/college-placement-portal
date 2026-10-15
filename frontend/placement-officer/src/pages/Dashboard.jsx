
import { useEffect, useState } from "react";
import "../App.css";

function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    students: 0,
    drives: 0,
    applications: 0,
    selected: 0,
    shortlisted: 0,
    pending: 0,
  });

  useEffect(() => {
    function loadStats() {
      const students = JSON.parse(
        localStorage.getItem("placementStudents") || "[]"
      );

      const drives = JSON.parse(
        localStorage.getItem("placementDrives") || "[]"
      );

      const applications = JSON.parse(
        localStorage.getItem("placementApplications") || "[]"
      );

      setStats({
        students: students.length,
        drives: drives.length,
        applications: applications.length,
        selected: applications.filter(
          (app) => app.status === "Selected"
        ).length,
        shortlisted: applications.filter(
          (app) => app.status === "Shortlisted"
        ).length,
        pending: applications.filter(
          (app) => app.status === "Applied"
        ).length,
      });
    }

    loadStats();

    window.addEventListener("focus", loadStats);
    window.addEventListener("storage", loadStats);

    return () => {
      window.removeEventListener("focus", loadStats);
      window.removeEventListener("storage", loadStats);
    };
  }, []);

  const cards = [
    {
      title: "Total Students",
      value: stats.students,
      icon: "🎓",
      color: "blue",
      target: "Students",
    },
    {
      title: "Placement Drives",
      value: stats.drives,
      icon: "🏢",
      color: "purple",
      target: "Placement Drives",
    },
    {
      title: "Total Applications",
      value: stats.applications,
      icon: "📄",
      color: "orange",
      target: "Applications",
    },
    {
      title: "Students Selected",
      value: stats.selected,
      icon: "✓",
      color: "green",
      target: "Applications",
    },
  ];

  function handleCardClick(target) {
    if (typeof setActivePage === "function") {
      setActivePage(target);
    }
  }

  function handleCardKeyDown(event, target) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick(target);
    }
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">
            PLACEMENT MANAGEMENT
          </p>

          <h1>Placement Officer Dashboard</h1>

          <p>
            Monitor student progress, recruitment drives, and placement
            outcomes from one place.
          </p>
        </div>

        <div className="dashboard-welcome-icon">📊</div>
      </section>

      <section className="dashboard-stats">
        {cards.map((card) => (
          <article
            className="dashboard-stat-card dashboard-stat-clickable"
            key={card.title}
            role="button"
            tabIndex={0}
            aria-label={`Open ${card.target}: ${card.title}`}
            title={`Click to open ${card.target}`}
            onClick={() => handleCardClick(card.target)}
            onKeyDown={(event) =>
              handleCardKeyDown(event, card.target)
            }
          >
            <div
              className={`dashboard-stat-icon ${card.color}`}
            >
              {card.icon}
            </div>

            <div className="dashboard-stat-details">
              <p>{card.title}</p>
              <h2>{card.value}</h2>
            </div>

            <span className="dashboard-card-arrow">→</span>
          </article>
        ))}
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel">
          <h2>Application Overview</h2>

          <p className="dashboard-panel-subtitle">
            Current recruitment progress
          </p>

          <div className="dashboard-progress-row">
            <div>
              <span>Selected</span>
              <strong>{stats.selected}</strong>
            </div>

            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill green-fill"
                style={{
                  width: `${
                    stats.applications
                      ? (stats.selected / stats.applications) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="dashboard-progress-row">
            <div>
              <span>Shortlisted</span>
              <strong>{stats.shortlisted}</strong>
            </div>

            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill purple-fill"
                style={{
                  width: `${
                    stats.applications
                      ? (stats.shortlisted / stats.applications) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="dashboard-progress-row">
            <div>
              <span>Applied / Pending</span>
              <strong>{stats.pending}</strong>
            </div>

            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill blue-fill"
                style={{
                  width: `${
                    stats.applications
                      ? (stats.pending / stats.applications) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <h2>Quick Summary</h2>

          <p className="dashboard-panel-subtitle">
            Your placement activity at a glance
          </p>

          <div className="dashboard-summary-item">
            <span className="summary-icon">🎓</span>

            <div>
              <strong>Student Records</strong>
              <p>Students registered in the portal</p>
            </div>

            <b>{stats.students}</b>
          </div>

          <div className="dashboard-summary-item">
            <span className="summary-icon">🏢</span>

            <div>
              <strong>Recruitment Drives</strong>
              <p>Company drives recorded</p>
            </div>

            <b>{stats.drives}</b>
          </div>

          <div className="dashboard-summary-item">
            <span className="summary-icon">📄</span>

            <div>
              <strong>Applications</strong>
              <p>Total recorded applications</p>
            </div>

            <b>{stats.applications}</b>
          </div>
        </article>
      </section>

      <p className="dashboard-footer">
        Placement Management System · Dashboard overview
      </p>
    </main>
  );
}

export default Dashboard;