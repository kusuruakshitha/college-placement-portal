
import { useMemo } from "react";
import "../App.css";

function Reports() {
  const applications = JSON.parse(
    localStorage.getItem("placementApplications") || "[]"
  );

  const students = JSON.parse(
    localStorage.getItem("placementStudents") || "[]"
  );

  const drives = JSON.parse(
    localStorage.getItem("placementDrives") || "[]"
  );

  const stats = useMemo(() => {
    const selected = applications.filter(
      (app) => app.status === "Selected"
    ).length;

    const shortlisted = applications.filter(
      (app) => app.status === "Shortlisted"
    ).length;

    const rejected = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    return {
      totalStudents: students.length,
      totalDrives: drives.length,
      totalApplications: applications.length,
      selected,
      shortlisted,
      rejected,
    };
  }, [applications, students, drives]);

  const companyReports = drives.map((drive) => {
    const companyApplications = applications.filter(
      (app) =>
        app.company?.toLowerCase() === drive.company?.toLowerCase()
    );

    const selected = companyApplications.filter(
      (app) => app.status === "Selected"
    ).length;

    return {
      company: drive.company,
      applications: companyApplications.length,
      selected,
    };
  });

  const maxApplications = Math.max(
    1,
    ...companyReports.map((item) => item.applications)
  );

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <h1>Placement Reports</h1>
          <p>Overview of student placements and recruitment activity.</p>
        </div>
        <button onClick={() => window.print()}>
          Print Report
        </button>
      </div>

      <section className="report-stats">
        <div className="report-card">
          <span>Total Students</span>
          <h2>{stats.totalStudents}</h2>
        </div>

        <div className="report-card">
          <span>Placement Drives</span>
          <h2>{stats.totalDrives}</h2>
        </div>

        <div className="report-card">
          <span>Total Applications</span>
          <h2>{stats.totalApplications}</h2>
        </div>

        <div className="report-card">
          <span>Students Selected</span>
          <h2>{stats.selected}</h2>
        </div>
      </section>

      <section className="report-panel">
        <h2>Application Status</h2>

        <div className="status-summary">
          <div>
            <span className="status-dot applied-dot"></span>
            Applied
            <strong>
              {
                applications.filter(
                  (app) => app.status === "Applied"
                ).length
              }
            </strong>
          </div>

          <div>
            <span className="status-dot shortlisted-dot"></span>
            Shortlisted
            <strong>{stats.shortlisted}</strong>
          </div>

          <div>
            <span className="status-dot selected-dot"></span>
            Selected
            <strong>{stats.selected}</strong>
          </div>

          <div>
            <span className="status-dot rejected-dot"></span>
            Rejected
            <strong>{stats.rejected}</strong>
          </div>
        </div>
      </section>

      <section className="report-panel">
        <h2>Company-wise Placement Report</h2>

        {companyReports.length === 0 ? (
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
                      width: `${
                        (item.applications / maxApplications) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="report-panel">
        <h2>Additional Statistics</h2>
        <p>
          Students with recorded profiles: {stats.totalStudents}
        </p>
        <p>
          Applications not yet selected or rejected:{" "}
          {applications.filter(
            (app) =>
              app.status === "Applied" ||
              app.status === "Shortlisted"
          ).length}
        </p>
      </section>
    </main>
  );
}

export default Reports;