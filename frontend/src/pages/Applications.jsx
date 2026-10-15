
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/placement-applications";
const APPLICATIONS_API = "http://localhost:8080/api/applications";

const STATUSES = [
  "Applied",
  "Shortlisted",
  "Selected",
  "Rejected",
];

const getStatus = (status) => status || "Applied";

function mapApplication(app) {
  return {
    id: app.id,
    student: app.studentName || "Not provided",
    studentId: app.studentId,
    company: app.companyName || "Not provided",
    role: app.driveName || "Not provided",
    date: app.appliedAt
      ? app.appliedAt.split("T")[0]
      : "Not provided",
    status: getStatus(app.status),
  };
}

function Applications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch data without synchronously changing loading state.
  const fetchApplications = useCallback(async (signal) => {
    setError("");

    try {
      const response = await fetch(API_URL, { signal });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid applications response.");
      }

      if (!signal?.aborted) {
        setApplications(data.map(mapApplication));
      }
    } catch (err) {
      if (err.name !== "AbortError" && !signal?.aborted) {
        console.error("Fetch applications:", err);
        setError(
          "Unable to load applications. Check that Spring Boot is running and the endpoint is available."
        );
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Initial loading. No synchronous setState call from the effect.
  useEffect(() => {
    const controller = new AbortController();

    fetchApplications(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchApplications]);

  // Refresh from the button.
  const handleRefresh = () => {
    setLoading(true);
    fetchApplications();
  };

  // Update application status.
  const updateStatus = async (id, status) => {
    setSavingId(id);
    setError("");

    try {
      // This endpoint updates records managed by ApplicationController.
      const response = await fetch(
        `${APPLICATIONS_API}/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Status update failed: ${response.status}`);
      }

      // Update the displayed row after the backend confirms success.
      setApplications((previous) =>
        previous.map((app) =>
          app.id === id ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error("Update application status:", err);
      setError(
        "Unable to save the status. The backend must support updating this application record."
      );
    } finally {
      setSavingId(null);
    }
  };

  // Delete application.
  const deleteApplication = async (id) => {
    const application = applications.find((app) => app.id === id);

    if (!application) return;

    const confirmed = window.confirm(
      `Delete the application of ${
        application.student || "this student"
      }?`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      // This endpoint belongs to ApplicationController.
      const response = await fetch(
        `${APPLICATIONS_API}/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      setApplications((previous) =>
        previous.filter((app) => app.id !== id)
      );
    } catch (err) {
      console.error("Delete application:", err);
      setError(
        "Unable to delete this application. The backend must support deleting this record."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Search and filter.
  const searchText = search.trim().toLowerCase();

  const filteredApplications = applications.filter((app) => {
    const searchableValues = [
      app.student,
      app.company,
      app.role,
      app.studentId,
      app.id,
    ];

    const matchesSearch = searchableValues.some((value) =>
      String(value ?? "").toLowerCase().includes(searchText)
    );

    const matchesStatus =
      filterStatus === "All" ||
      getStatus(app.status) === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const countStatus = (status) =>
    applications.filter(
      (app) => status === "All" || getStatus(app.status) === status
    ).length;

  return (
    <div className="applications-page">
      <style>{`
        .applications-page {
          padding: 28px;
          color: #1e293b;
          font-family: Arial, sans-serif;
        }

        .applications-page * {
          box-sizing: border-box;
        }

        .applications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .applications-header h2 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .applications-header p {
          margin: 0;
          color: #64748b;
        }

        .applications-refresh,
        .applications-delete {
          border: none;
          border-radius: 7px;
          padding: 10px 14px;
          cursor: pointer;
          font-weight: 600;
        }

        .applications-refresh {
          color: white;
          background: #2563eb;
        }

        .applications-delete {
          color: #b91c1c;
          background: #fee2e2;
        }

        .applications-refresh:disabled,
        .applications-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .applications-stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(110px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .applications-stat {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px;
        }

        .applications-stat span {
          display: block;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .applications-stat strong {
          font-size: 25px;
        }

        .applications-toolbar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .applications-toolbar input,
        .applications-toolbar select,
        .applications-table select {
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          padding: 10px;
          background: white;
          color: #1e293b;
        }

        .applications-toolbar input {
          flex: 1;
          min-width: 180px;
        }

        .applications-table-wrapper {
          width: 100%;
          overflow-x: auto;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .applications-table th,
        .applications-table td {
          padding: 15px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .applications-table th {
          background: #f8fafc;
          color: #475569;
          font-size: 13px;
        }

        .applications-table td {
          font-size: 14px;
        }

        .applications-status {
          min-width: 130px;
        }

        .applications-message {
          margin: 12px 0;
          padding: 12px;
          border-radius: 7px;
          background: #fff7ed;
          color: #9a3412;
        }

        .applications-empty {
          text-align: center;
          padding: 35px !important;
          color: #64748b;
        }

        .applications-footer {
          margin-top: 16px;
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 1000px) {
          .applications-stats {
            grid-template-columns: repeat(2, minmax(110px, 1fr));
          }
        }

        @media (max-width: 600px) {
          .applications-page {
            padding: 16px;
          }

          .applications-header h2 {
            font-size: 23px;
          }
        }
      `}</style>

      <div className="applications-header">
        <div>
          <h2>Applications Management</h2>
          <p>
            Manage student placement applications and their status.
          </p>
        </div>

        <button
          type="button"
          className="applications-refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div className="applications-stats">
        {[
          { label: "Total Applications", value: countStatus("All") },
          { label: "Applied", value: countStatus("Applied") },
          { label: "Shortlisted", value: countStatus("Shortlisted") },
          { label: "Selected", value: countStatus("Selected") },
          { label: "Rejected", value: countStatus("Rejected") },
        ].map((stat) => (
          <div className="applications-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      {error && (
        <div className="applications-message" role="alert">
          {error}
        </div>
      )}

      <div className="applications-toolbar">
        <input
          type="text"
          placeholder="Search student, company, role or ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search applications"
        />

        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          aria-label="Filter applications by status"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="applications-table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Student ID</th>
              <th>Company</th>
              <th>Job Role / Drive</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="applications-empty">
                  Loading applications from the database...
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={8} className="applications-empty">
                  No applications found.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.student}</td>
                  <td>{app.studentId ?? "—"}</td>
                  <td>{app.company}</td>
                  <td>{app.role}</td>
                  <td>{app.date}</td>
                  <td>
                    <select
                      className="applications-status"
                      value={getStatus(app.status)}
                      disabled={
                        savingId === app.id ||
                        deletingId === app.id
                      }
                      onChange={(event) =>
                        updateStatus(app.id, event.target.value)
                      }
                      aria-label={`Status for ${app.student}`}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {savingId === app.id && <small> Saving...</small>}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="applications-delete"
                      disabled={
                        deletingId === app.id ||
                        savingId === app.id
                      }
                      onClick={() => deleteApplication(app.id)}
                    >
                      {deletingId === app.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="applications-footer">
        Showing {filteredApplications.length} of {applications.length} applications.
      </div>
    </div>
  );
}

export default Applications;
