
import { useEffect, useState } from "react";
import "../App.css";

const API = "http://localhost:8080/api";

function Reports() {
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
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

        const [studentData, driveData, applicationData] =
          await Promise.all(responses.map((response) => response.json()));

        if (
          !Array.isArray(studentData) ||
          !Array.isArray(driveData) ||
          !Array.isArray(applicationData)
        ) {
          throw new Error("The backend returned an unexpected data format.");
        }

        setStudents(studentData);
        setDrives(driveData);
        setApplications(applicationData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load placement reports.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadReports();
    return () => controller.abort();
  }, []);

  const countStatus = (status) =>
    applications.filter(
      (app) => app.status?.toLowerCase() === status.toLowerCase()
    ).length;

  const companyReports = drives.map((drive) => {
    const companyName =
      drive.companyName ?? drive.company ?? drive.name ?? "Unknown company";

    const related = applications.filter((app) => {
      const applicationCompany =
        typeof app.company === "object"
          ? app.company?.companyName ?? app.company?.name
          : app.companyName ?? app.company;

      return applicationCompany?.toLowerCase() === companyName.toLowerCase();
    });

    return {
      company: companyName,
      applications: related.length,
      selected: related.filter(
        (app) => app.status?.toLowerCase() === "selected"
      ).length,
    };
  });

  const maxApplications = Math.max(
    1,
    ...companyReports.map((item) => item.applications)
  );

  const reportCards = [
    ["Total Students", students.length],
    ["Placement Drives", drives.length],
    ["Total Applications", applications.length],
    ["Students Selected", countStatus("Selected")],
  ];

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <h1>Placement Reports</h1>
          <p>Overview of student placements and recruitment activity.</p>
        </div>
        <button type="button" onClick={() => window.print()}>
          Print Report
        </button>
      </div>

      {error && (
        <p role="alert" className="error-message">
          {error} Check that the backend is running and the API endpoints exist.
        </p>
      )}

      <section className="report-stats">
        {reportCards.map(([label, value]) => (
          <div className="report-card" key={label}>
            <span>{label}</span>
            <h2>{loading ? "…" : value}</h2>
          </div>
        ))}
      </section>

      <section className="report-panel">
        <h2>Application Status</h2>
        <div className="status-summary">
          {[
            ["Applied", "applied-dot"],
            ["Shortlisted", "shortlisted-dot"],
            ["Selected", "selected-dot"],
            ["Rejected", "rejected-dot"],
          ].map(([status, dotClass]) => (
            <div key={status}>
              <span className={`status-dot ${dotClass}`} />
              {status}
              <strong>{loading ? "…" : countStatus(status)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="report-panel">
        <h2>Company-wise Placement Report</h2>

        {loading ? (
          <p>Loading company reports...</p>
        ) : companyReports.length === 0 ? (
          <p>No placement drives available yet.</p>
        ) : (
          <div className="company-report-list">
            {companyReports.map((item, index) => (
              <div className="company-report" key={`${item.company}-${index}`}>
                <div className="company-report-heading">
                  <strong>{item.company}</strong>
                  <span>
                    {item.selected} selected / {item.applications} applications
                  </span>
                </div>
                <div className="report-bar-background">
                  <div
                    className="report-bar"
                    style={{
                      width: `${(item.applications / maxApplications) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="report-panel">
        <h2>Additional Statistics</h2>
        <p>Students with recorded profiles: {loading ? "…" : students.length}</p>
        <p>
          Applications not yet selected or rejected:{" "}
          {loading
            ? "…"
            : applications.filter((app) =>
                ["applied", "shortlisted"].includes(
                  app.status?.toLowerCase()
                )
              ).length}
        </p>
      </section>
    </main>
  );
}

export default Reports;
