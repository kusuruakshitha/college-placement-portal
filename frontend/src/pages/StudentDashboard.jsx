
import { useEffect, useState } from "react";

const DRIVES_API = "http://localhost:8080/api/placement-drives";
const STUDENTS_API = "http://localhost:8080/api/students";

function StudentDashboard({ user, student, onNavigate }) {
  const displayName =
    student?.name ||
    student?.fullName ||
    user?.username ||
    user?.name ||
    "Student";

  const [drives, setDrives] = useState([]);
  const [profile, setProfile] = useState(student || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [drivesResponse, studentsResponse] = await Promise.all([
          fetch(DRIVES_API, { signal: controller.signal }),
          fetch(STUDENTS_API, { signal: controller.signal }),
        ]);

        if (!drivesResponse.ok) {
          throw new Error(
            `Could not load placement drives (${drivesResponse.status}).`
          );
        }

        const drivesData = await drivesResponse.json();

        if (!Array.isArray(drivesData)) {
          throw new Error("Unexpected placement drives response.");
        }

        setDrives(drivesData);

        // Prefer the logged-in student's matching database record.
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();

          if (Array.isArray(studentsData)) {
            const identifier =
              student?.id ?? user?.studentId ?? user?.id;

            const email =
              student?.email ?? user?.email;

            const matchedStudent = studentsData.find((item) => {
              if (
                identifier != null &&
                item.id != null &&
                String(item.id) === String(identifier)
              ) {
                return true;
              }

              return (
                email &&
                item.email?.toLowerCase() === email.toLowerCase()
              );
            });

            if (matchedStudent) {
              setProfile(matchedStudent);
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [student?.id, student?.email, user?.id, user?.studentId, user?.email]);

  const menuItems = [
    {
      id: "profile",
      title: "My Profile",
      description: "View your academic and personal details.",
      icon: "👤",
    },
    {
      id: "resume",
      title: "Resume Upload",
      description: "Upload and preview your resume.",
      icon: "📄",
    },
    {
      id: "readiness",
      title: "Placement Readiness",
      description: "Review your preparation for placements.",
      icon: "🎯",
    },
    {
      id: "skills",
      title: "Skill Gap Analysis",
      description: "Explore skills to improve for your career.",
      icon: "📊",
    },
    {
      id: "drives",
      title: "Placement Drives",
      description: "View campus placement drives and apply.",
      icon: "🏢",
    },
    {
      id: "jobs",
      title: "Recommended Jobs",
      description: "Explore job opportunities relevant to you.",
      icon: "💼",
    },
    {
      id: "internships",
      title: "Internships",
      description: "Explore internship opportunities.",
      icon: "🎓",
    },
    {
      id: "history",
      title: "Placement History",
      description: "Review your placement progress and history.",
      icon: "📈",
    },
  ];

  const openDrives = drives.filter((drive) =>
    ["open", "upcoming"].includes(
      String(drive.status || "").toLowerCase()
    )
  );

  const cgpa = Number(profile?.cgpa);
  const hasCgpa =
    profile?.cgpa !== "" &&
    profile?.cgpa != null &&
    Number.isFinite(cgpa);

  const eligibleByCgpa = hasCgpa && cgpa >= 7;

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h2>Student Dashboard</h2>
          <p>Welcome back, {displayName}!</p>
        </div>
      </div>

      <div className="welcome-card">
        <div>
          <h2>Welcome to your Career Hub</h2>
          <p>
            Manage your profile, prepare for placements, improve your
            skills, and explore career opportunities in one place.
          </p>
        </div>
        <div className="welcome-icon" aria-hidden="true">
          🎓
        </div>
      </div>

      <section className="dashboard-section-heading">
        <h3>Placement Overview</h3>
        <p>Updates from the Placement Officer portal.</p>
      </section>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span className="dashboard-card-icon">🏢</span>
          <span className="dashboard-card-title">Available Drives</span>
          <span className="dashboard-card-description">
            {loading ? "Loading..." : openDrives.length}
            {" "}open or upcoming drives
          </span>
          <button
            type="button"
            className="dashboard-card-link"
            onClick={() => onNavigate("drives")}
          >
            View drives →
          </button>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-icon">🎯</span>
          <span className="dashboard-card-title">CGPA Eligibility</span>
          <span className="dashboard-card-description">
            {!profile || !hasCgpa
              ? "Add your CGPA to review eligibility."
              : eligibleByCgpa
                ? "Your CGPA meets the general 7.0 threshold."
                : "Your CGPA is below the general 7.0 threshold."}
          </span>
          <button
            type="button"
            className="dashboard-card-link"
            onClick={() => onNavigate("profile")}
          >
            View profile →
          </button>
        </div>

        <div className="dashboard-card">
          <span className="dashboard-card-icon">📄</span>
          <span className="dashboard-card-title">Resume Matching</span>
          <span className="dashboard-card-description">
            Upload your resume so we can match your skills with
            opportunities.
          </span>
          <button
            type="button"
            className="dashboard-card-link"
            onClick={() => onNavigate("resume")}
          >
            Upload resume →
          </button>
        </div>
      </div>

      <section className="dashboard-section-heading">
        <h3>Latest Placement Drives</h3>
        <p>
          Drives created or updated by your Placement Officer.
        </p>
      </section>

      {loading ? (
        <p>Loading placement drives...</p>
      ) : openDrives.length === 0 ? (
        <p>No open or upcoming placement drives are available right now.</p>
      ) : (
        <div className="dashboard-cards">
          {openDrives.slice(0, 6).map((drive) => {
            const driveCgpa = Number(
              drive.minimumCgpa ?? drive.minCgpa
            );

            const hasDriveCgpa =
              drive.minimumCgpa != null || drive.minCgpa != null;

            const meetsDriveCgpa =
              !hasDriveCgpa ||
              (hasCgpa && Number.isFinite(driveCgpa) && cgpa >= driveCgpa);

            return (
              <article className="dashboard-card" key={drive.id}>
                <span className="dashboard-card-icon">🏢</span>
                <span className="dashboard-card-title">
                  {drive.companyName || "Company"}
                </span>
                <span className="dashboard-card-description">
                  <strong>Role:</strong> {drive.driveName || "Not specified"}
                </span>
                <span className="dashboard-card-description">
                  <strong>Date:</strong> {drive.driveDate || "Not announced"}
                </span>
                <span className="dashboard-card-description">
                  <strong>Venue:</strong> {drive.venue || "Not announced"}
                </span>
                <span className="dashboard-card-description">
                  <strong>Status:</strong> {drive.status || "Open"}
                </span>

                {hasDriveCgpa && (
                  <span className="dashboard-card-description">
                    <strong>Minimum CGPA:</strong> {driveCgpa}
                    {" — "}
                    {meetsDriveCgpa
                      ? "Meets CGPA requirement"
                      : "Does not meet CGPA requirement"}
                  </span>
                )}

                <button
                  type="button"
                  className="dashboard-card-link"
                  onClick={() => onNavigate("drives")}
                >
                  View and apply →
                </button>
              </article>
            );
          })}
        </div>
      )}

      <section className="dashboard-section-heading">
        <h3>Career Management</h3>
        <p>Select a module to continue.</p>
      </section>

      <div className="dashboard-cards">
        {menuItems.map((item) => (
          <button
            type="button"
            className="dashboard-card"
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            <span className="dashboard-card-icon" aria-hidden="true">
              {item.icon}
            </span>

            <span className="dashboard-card-title">{item.title}</span>

            <span className="dashboard-card-description">
              {item.description}
            </span>

            <span className="dashboard-card-link">
              Open module →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;
