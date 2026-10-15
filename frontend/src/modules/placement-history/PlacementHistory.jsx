
import { useState } from "react";

const initialApplications = [
  {
    id: 1,
    company: "Sample Technology Company",
    role: "Software Engineer Trainee",
    date: "2026-09-10",
    status: "Applied",
  },
  {
    id: 2,
    company: "Sample Analytics Company",
    role: "Data Analyst",
    date: "2026-09-15",
    status: "Interview",
  },
];

function PlacementHistory() {
  const [applications, setApplications] = useState(initialApplications);
  const [filter, setFilter] = useState("All");

  const filteredApplications = applications.filter(
    (application) =>
      filter === "All" || application.status === filter
  );

  const updateStatus = (id, newStatus) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === id
          ? { ...application, status: newStatus }
          : application
      )
    );
  };

  const getStatusClass = (status) =>
    `status-badge status-${status.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <h2>Placement History</h2>
          <p>Track your job applications and recruitment progress.</p>
        </div>
      </div>

      <section className="history-summary">
        <div className="history-stat">
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
        </div>

        <div className="history-stat">
          <span>Interviews</span>
          <strong>
            {applications.filter((item) => item.status === "Interview").length}
          </strong>
        </div>

        <div className="history-stat">
          <span>Offers</span>
          <strong>
            {applications.filter((item) => item.status === "Offer").length}
          </strong>
        </div>
      </section>

      <section className="history-table-section">
        <div className="history-heading">
          <h3>Application Records</h3>

          <select
            aria-label="Filter applications by status"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Application Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.company}</td>
                    <td>{application.role}</td>
                    <td>{application.date}</td>
                    <td>
                      <span className={getStatusClass(application.status)}>
                        {application.status}
                      </span>
                    </td>
                    <td>
                      <select
                        aria-label={`Update status for ${application.company}`}
                        value={application.status}
                        onChange={(event) =>
                          updateStatus(application.id, event.target.value)
                        }
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No applications found</h3>
            <p>There are no records matching this status.</p>
          </div>
        )}
      </section>

      <p className="info-message">
        The displayed records are sample data. Status changes are temporary
        and will reset when you refresh the page. Real placement history
        will require backend integration.
      </p>
    </div>
  );
}

export default PlacementHistory;