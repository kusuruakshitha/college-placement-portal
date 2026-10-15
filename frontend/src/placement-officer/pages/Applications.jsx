
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/applications";

const STATUSES = ["Applied", "Shortlisted", "Selected", "Rejected"];

function Applications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load real applications from the backend.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadApplications() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load applications.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        if (active) {
          setApplications(
            data.map((app) => ({
              ...app,
              student: app.student ?? "",
              company: app.company ?? "",
              role: app.role ?? "",
              date: app.date ?? "",
              status: app.status ?? "Applied",
            }))
          );
          setError("");
        }
      } catch (err) {
        if (active && err.name !== "AbortError") {
          setError(
            "Unable to load applications. Check that the backend is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshKey]);

  // Save status changes to the backend.
  const updateStatus = async (id, status) => {
    const previousApplications = applications;

    setApplications((current) =>
      current.map((app) =>
        app.id === id ? { ...app, status } : app
      )
    );

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Status update failed.");
      }

      setError("");
    } catch {
      setApplications(previousApplications);
      setError("Could not update status. Please try again.");
    }
  };

  // Delete an application from the database.
  const deleteApplication = async (id) => {
    const app = applications.find((item) => item.id === id);

    if (!app || !window.confirm(`Delete ${app.student}'s application?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed.");
      }

      setApplications((current) =>
        current.filter((item) => item.id !== id)
      );
      setError("");
    } catch {
      setError("Could not delete application. Please try again.");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const text =
      `${app.student} ${app.company} ${app.role}`.toLowerCase();

    const matchesSearch = text.includes(search.trim().toLowerCase());
    const matchesStatus =
      filterStatus === "All" || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="students-page">
      <div className="page-heading">
        <div>
          <h1>Applications</h1>
          <p>Review student applications and update recruitment status.</p>
        </div>
      </div>

      <div className="application-filters">
        <input
          className="search-input"
          type="search"
          placeholder="Search student, company, or role..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          aria-label="Filter applications by status"
        >
          <option value="All">All Applications</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="error-message">
          {error}
          {" "}
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRefreshKey((key) => key + 1);
            }}
          >
            Retry
          </button>
        </p>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Job Role</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Loading applications...</td>
              </tr>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.student || "—"}</td>
                  <td>{app.company || "—"}</td>
                  <td>{app.role || "—"}</td>
                  <td>{app.date || "—"}</td>
                  <td>
                    <select
                      aria-label={`Status for ${app.student}`}
                      value={STATUSES.includes(app.status) ? app.status : "Applied"}
                      onChange={(event) =>
                        updateStatus(app.id, event.target.value)
                      }
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => deleteApplication(app.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Applications;
