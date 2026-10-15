
import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function PlacementHistory() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedUser = sessionStorage.getItem("studentUser");

        if (!savedUser) {
          throw new Error("Please log in again.");
        }

        const user = JSON.parse(savedUser);

        // Find the logged-in student's database record.
        const studentResponse = await fetch(`${API}/api/students`);

        if (!studentResponse.ok) {
          throw new Error("Unable to load student information.");
        }

        const studentData = await studentResponse.json();

        const students = Array.isArray(studentData)
          ? studentData
          : Array.isArray(studentData?.students)
          ? studentData.students
          : [];

        const student = students.find(
          (item) =>
            item.email?.trim().toLowerCase() ===
            user.email?.trim().toLowerCase()
        );

        if (!student?.id) {
          throw new Error(
            "Student profile not found. Please contact your administrator."
          );
        }

        // Fetch this student's submitted applications.
        const response = await fetch(
          `${API}/api/placement-applications/student/${student.id}`
        );

        if (!response.ok) {
          throw new Error("Unable to load placement history.");
        }

        const data = await response.json();

        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Placement history error:", err);
        setError(err.message || "Unable to load placement history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h2>Placement History</h2>
          <p>View and track your placement applications.</p>
        </div>
      </div>

      {loading && (
        <div className="content-card">
          <p>Loading placement history...</p>
        </div>
      )}

      {error && (
        <div className="content-card" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="content-card">
          <h3>No applications found</h3>
          <p>
            Your placement applications will appear here after you apply.
          </p>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="dashboard-cards">
          {applications.map((application) => (
            <div className="content-card" key={application.id}>
              <h3>{application.companyName || "Company"}</h3>

              <h4>
                {application.driveName || "Placement Drive"}
              </h4>

              <p>
                <strong>Roll Number:</strong>{" "}
                {application.rollNumber || "Not available"}
              </p>

              <p>
                <strong>Applied On:</strong>{" "}
                {application.appliedAt
                  ? new Date(application.appliedAt).toLocaleDateString()
                  : "Not available"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {application.status || "Pending"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlacementHistory;
