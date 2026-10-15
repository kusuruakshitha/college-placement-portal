
import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function AdminReports() {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch reports data from the backend
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      try {
        const responses = await Promise.all([
          fetch(`${API}/api/students`),
          fetch(`${API}/api/companies`),
          fetch(`${API}/api/placement-drives`),
        ]);

        if (responses.some((response) => !response.ok)) {
          throw new Error("One or more API requests failed.");
        }

        const data = await Promise.all(
          responses.map((response) => response.json())
        );

        if (!cancelled) {
          const studentData = Array.isArray(data[0]) ? data[0] : [];
          const companyData = Array.isArray(data[1]) ? data[1] : [];
          const driveData = Array.isArray(data[2]) ? data[2] : [];

          setStudents(studentData);
          setCompanies(companyData);
          setDrives(driveData);
          setError("");

          console.log("Students received by Reports:", studentData);
          console.log(
            "Placement statuses:",
            studentData.map((student) => ({
              id: student.id,
              name: student.name,
              placementStatus: student.placementStatus,
              placement_status: student.placement_status,
            }))
          );
        }
      } catch (err) {
        console.error("Reports API error:", err);

        if (!cancelled) {
          setError(
            "Unable to load reports. Check the backend and API access."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Read placement status from supported property names
  function getPlacementStatus(student) {
    const value =
      student.placementStatus ??
      student.placement_status ??
      "";

    return String(value).trim().toLowerCase();
  }

  // Check whether the API supplies placement status
  const hasPlacementData = students.some((student) => {
    const status = getPlacementStatus(student);
    return status !== "";
  });

  // Count students whose status confirms placement
  const placedStatuses = ["placed", "selected", "hired"];

  const placedStudents = students.filter((student) =>
    placedStatuses.includes(getPlacementStatus(student))
  );

  const placementRate =
    hasPlacementData && students.length > 0
      ? (placedStudents.length / students.length) * 100
      : null;

  // Classify recruitment drives by status and scheduled date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getDriveCategory(drive) {
    const status = String(drive.status || "")
      .trim()
      .toLowerCase();

    if (["completed", "closed", "finished"].includes(status)) {
      return "completed";
    }

    if (["cancelled", "canceled"].includes(status)) {
      return "cancelled";
    }

    const dateValue = drive.driveDate || drive.drive_date;

    const driveDate = dateValue
      ? new Date(`${String(dateValue).slice(0, 10)}T00:00:00`)
      : null;

    if (
      driveDate &&
      !Number.isNaN(driveDate.getTime()) &&
      driveDate > today
    ) {
      return "upcoming";
    }

    if (["upcoming", "scheduled"].includes(status)) {
      return "upcoming";
    }

    if (["open", "active", "ongoing"].includes(status)) {
      return "active";
    }

    return "other";
  }

  const activeDrives = drives.filter(
    (drive) => getDriveCategory(drive) === "active"
  ).length;

  const upcomingDrives = drives.filter(
    (drive) => getDriveCategory(drive) === "upcoming"
  ).length;

  const completedDrives = drives.filter(
    (drive) => getDriveCategory(drive) === "completed"
  ).length;

  // Export report data as CSV
  function exportCSV() {
    const rows = [
      ["Metric", "Value"],
      ["Registered Students", students.length],
      [
        "Students Placed",
        hasPlacementData ? placedStudents.length : "Not available",
      ],
      [
        "Placement Rate",
        placementRate === null
          ? "Not available"
          : `${placementRate.toFixed(1)}%`,
      ],
      ["Companies Registered", companies.length],
      ["Total Placement Drives", drives.length],
      ["Active Drives", activeDrives],
      ["Upcoming Drives", upcomingDrives],
      ["Completed Drives", completedDrives],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "placement-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Dashboard statistics cards
  const statCards = [
    {
      title: "Registered Students",
      value: students.length,
      icon: "♙",
      color: "purple",
    },
    {
      title: "Students Placed",
      value: hasPlacementData ? placedStudents.length : "N/A",
      icon: "✓",
      color: "green",
    },
    {
      title: "Companies Registered",
      value: companies.length,
      icon: "▣",
      color: "blue",
    },
    {
      title: "Placement Rate",
      value:
        placementRate === null
          ? "N/A"
          : `${placementRate.toFixed(1)}%`,
      icon: "↗",
      color: "orange",
    },
  ];

  const driveStatuses = [
    { name: "Active", count: activeDrives },
    { name: "Upcoming", count: upcomingDrives },
    { name: "Completed", count: completedDrives },
  ];

  return (
    <section className="admin-module">
      <div className="admin-module-heading">
        <div>
          <h2>Reports &amp; Analytics</h2>
          <p>
            Review student placements, registered companies and
            recruitment drive activity.
          </p>
        </div>

        <button
          className="admin-action-button"
          onClick={exportCSV}
          disabled={loading || Boolean(error)}
        >
          ↓ Export CSV Report
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <button
          className="admin-action-button"
          onClick={() =>
            setRefreshKey((previous) => previous + 1)
          }
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Report"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          style={{ color: "#b42318", marginBottom: "16px" }}
        >
          {error}
        </p>
      )}

      {/* Statistics cards */}
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <article className="admin-stat-card" key={card.title}>
            <div className={`admin-stat-icon ${card.color}`}>
              {card.icon}
            </div>

            <div>
              <p>{card.title}</p>
              <h3>{loading ? "..." : card.value}</h3>
              <small>Statistics from the backend</small>
            </div>
          </article>
        ))}
      </div>

      {/* Reports overview */}
      <div className="admin-reports-grid">
        <div className="admin-panel">
          <h3>Placement Overview</h3>

          <div className="admin-report-highlight">
            <span>Current placement rate</span>

            <strong>
              {loading
                ? "..."
                : placementRate === null
                  ? "Not available"
                  : `${placementRate.toFixed(1)}%`}
            </strong>

            <div
              className="admin-report-progress"
              role="progressbar"
              aria-label="Placement rate"
              aria-valuenow={placementRate ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  width: `${Math.min(placementRate ?? 0, 100)}%`,
                }}
              />
            </div>

            <small>
              {loading
                ? "Loading student records..."
                : hasPlacementData
                  ? `${placedStudents.length} placed out of ${
                      students.length
                    } registered students`
                  : "Placement status data is not available in the student API."}
            </small>
          </div>

          <div className="admin-report-row">
            <span>Companies registered</span>
            <strong>{loading ? "..." : companies.length}</strong>
          </div>

          <div className="admin-report-row">
            <span>Total placement drives</span>
            <strong>{loading ? "..." : drives.length}</strong>
          </div>
        </div>

        {/* Recruitment drive chart */}
        <div className="admin-panel">
          <h3>Recruitment Drive Status</h3>

          <p className="admin-report-description">
            Distribution of placement drives by status and scheduled date.
          </p>

          {driveStatuses.map((item) => (
            <div className="admin-bar-row" key={item.name}>
              <div className="admin-bar-label">
                <span>{item.name}</span>
                <strong>{loading ? "..." : item.count}</strong>
              </div>

              <div className="admin-bar-track">
                <div
                  className={`admin-bar-fill ${item.name.toLowerCase()}`}
                  style={{
                    width:
                      drives.length > 0
                        ? `${(item.count / drives.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          ))}

          {drives.length === 0 && !loading && !error && (
            <p className="admin-report-empty">
              No placement drives found.
            </p>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="admin-panel">
        <h3>Report Summary</h3>

        <div className="admin-report-table-wrapper">
          <table className="admin-report-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Student records</td>
                <td>{loading ? "..." : students.length}</td>
                <td>Records returned by the Students API</td>
              </tr>

              <tr>
                <td>Placed students</td>
                <td>
                  {loading
                    ? "..."
                    : hasPlacementData
                      ? placedStudents.length
                      : "Not available"}
                </td>
                <td>Requires verified placement status data</td>
              </tr>

              <tr>
                <td>Company records</td>
                <td>{loading ? "..." : companies.length}</td>
                <td>Records returned by the Companies API</td>
              </tr>

              <tr>
                <td>Placement drives</td>
                <td>{loading ? "..." : drives.length}</td>
                <td>Records returned by the Placement Drives API</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="admin-report-footnote">
          Statistics are calculated from records returned by the backend.
        </p>
      </div>
    </section>
  );
}

export default AdminReports;
