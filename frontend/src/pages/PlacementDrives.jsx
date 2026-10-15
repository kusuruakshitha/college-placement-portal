
import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function PlacementDrives({ student }) {
  const [drives, setDrives] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchDrives() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/api/placement-drives`);

        if (!response.ok) {
          throw new Error("Unable to load placement drives.");
        }

        const data = await response.json();

        if (active) {
          setDrives(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Placement drives error:", err);

        if (active) {
          setError(
            "Could not load placement drives. Please check whether the backend is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchDrives();

    return () => {
      active = false;
    };
  }, []);

  async function applyToDrive(drive) {
    setError("");
    setMessage("");

    if (!student?.id) {
      setError("Please log in again to apply for this drive.");
      return;
    }

    if (!drive?.id) {
      setError("Invalid placement drive. Please refresh and try again.");
      return;
    }

    if (appliedIds.includes(drive.id)) {
      setError("You have already applied for this drive.");
      return;
    }

    if (applyingId !== null) {
      return;
    }

    try {
      setApplyingId(drive.id);

      const response = await fetch(
        `${API}/api/placement-applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: student.id,
            placementDriveId: drive.id,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            (typeof result === "string" ? result : null) ||
            "Unable to submit your application."
        );
      }

      setAppliedIds((previous) =>
        previous.includes(drive.id)
          ? previous
          : [...previous, drive.id]
      );

      setMessage(
        `Successfully applied for ${
          drive.companyName || drive.driveName || "this placement drive"
        }!`
      );
    } catch (err) {
      console.error("Application error:", err);
      setError(err.message || "Application failed. Please try again.");
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h2>Placement Drives</h2>
          <p>Explore campus recruitment opportunities.</p>
        </div>
      </div>

      {message && (
        <div className="content-card" role="status">
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="content-card" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="content-card">
          <p>Loading placement drives...</p>
        </div>
      )}

      {!loading && !error && drives.length === 0 && (
        <div className="content-card">
          <h3>No placement drives available</h3>
          <p>Please check again later for new opportunities.</p>
        </div>
      )}

      {!loading && drives.length > 0 && (
        <div className="dashboard-cards">
          {drives.map((drive) => {
            const isOpen =
              String(drive.status || "").toLowerCase() === "open";

            const alreadyApplied = appliedIds.includes(drive.id);

            return (
              <div className="content-card" key={drive.id}>
                <h3>{drive.companyName || "Company"}</h3>

                <h4>
                  {drive.driveName || "Campus Placement Drive"}
                </h4>

                <p>
                  <strong>Date:</strong>{" "}
                  {drive.driveDate || "Not announced"}
                </p>

                <p>
                  <strong>Venue:</strong>{" "}
                  {drive.venue || "Not announced"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {drive.status || "Not specified"}
                </p>

                {isOpen && (
                  <button
                    type="button"
                    disabled={
                      applyingId !== null || alreadyApplied
                    }
                    onClick={() => applyToDrive(drive)}
                  >
                    {applyingId === drive.id
                      ? "Applying..."
                      : alreadyApplied
                      ? "Applied"
                      : "Apply Now"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlacementDrives;
