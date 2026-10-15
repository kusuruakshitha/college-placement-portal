
import { useCallback, useEffect, useMemo, useState } from "react";
import "./RecommendedJobs.css";

const API_URL = "/api/companies";
const SAVED_JOBS_KEY = "savedPlacementJobs";

function getField(object, ...keys) {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "";
}

function getStudentCgpa(student) {
  const value = getField(
    student,
    "cgpa",
    "CGPA",
    "currentCgpa",
    "currentCGPA",
    "cumulativeCgpa",
    "cumulativeCGPA"
  );

  if (value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function checkCgpaEligibility(criteria, cgpa) {
  if (cgpa === null || !criteria) {
    return {
      status: "review",
      message:
        cgpa === null
          ? "CGPA unavailable — verify eligibility"
          : "Eligibility criteria unavailable",
    };
  }

  const text = String(criteria).trim().toLowerCase();

  if (!/\bcgpa\b/.test(text)) {
    return {
      status: "review",
      message: "Check full eligibility criteria",
    };
  }

  const match = text.match(
    /\bcgpa\b\s*(>=|<=|>|<|=)?\s*(\d+(?:\.\d+)?)/i
  );

  if (!match) {
    return {
      status: "review",
      message: "Check full eligibility criteria",
    };
  }

  const operator = match[1] || ">=";
  const required = Number(match[2]);

  let eligible;

  switch (operator) {
    case ">":
      eligible = cgpa > required;
      break;
    case ">=":
      eligible = cgpa >= required;
      break;
    case "<":
      eligible = cgpa < required;
      break;
    case "<=":
      eligible = cgpa <= required;
      break;
    case "=":
      eligible = cgpa === required;
      break;
    default:
      return {
        status: "review",
        message: "Check full eligibility criteria",
      };
  }

  return eligible
    ? {
        status: "eligible",
        message: "Meets the stated CGPA criterion",
      }
    : {
        status: "not-eligible",
        message: "Does not meet the stated CGPA criterion",
      };
}

function formatPackage(value) {
  if (value === "" || value === null || value === undefined) {
    return "Not specified";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? `${number} LPA`
    : String(value);
}

function readSavedJobs() {
  try {
    const value = window.localStorage.getItem(SAVED_JOBS_KEY);
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function RecommendedJobs({ student }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedJobs, setSavedJobs] = useState(readSavedJobs);

  const cgpa = useMemo(() => getStudentCgpa(student), [student]);

  const loadCompanies = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        headers: { Accept: "application/json" },
        signal,
      });

      if (!response.ok) {
        throw new Error(`Unable to load companies (HTTP ${response.status}).`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The companies API did not return a JSON array.");
      }

      if (!signal.aborted) {
        setCompanies(data);
      }
    } catch (err) {
      if (err.name === "AbortError" || signal.aborted) return;

      console.error("Recommended Jobs error:", err);
      setError(
        "Could not load company roles. Check that Spring Boot is running and the Vite proxy is configured."
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCompanies(controller.signal);

    return () => controller.abort();
  }, [loadCompanies]);

  const handleRefresh = () => {
    if (loading) return;

    const controller = new AbortController();
    loadCompanies(controller.signal);
  };

  const toggleSave = (id) => {
    setSavedJobs((previous) => {
      const updated = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];

      try {
        window.localStorage.setItem(
          SAVED_JOBS_KEY,
          JSON.stringify(updated)
        );
      } catch (err) {
        console.error("Could not save job:", err);
      }

      return updated;
    });
  };

  const jobs = useMemo(
    () =>
      companies.map((company, index) => {
        const companyName = getField(company, "companyName", "name");
        const role = getField(company, "jobRole", "role", "jobTitle");
        const criteria = getField(
          company,
          "eligibilityCriteria",
          "eligibility",
          "criteria"
        );
        const id = getField(company, "id", "companyId");

        return {
          id: String(
            id !== ""
              ? id
              : `${companyName || "company"}-${role || "role"}-${index}`
          ),
          companyName: companyName || "Company name unavailable",
          role: role || "Role not specified",
          location:
            getField(company, "location", "jobLocation") ||
            "Location not specified",
          criteria: criteria || "Not specified",
          packageOffered: getField(
            company,
            "packageOffered",
            "package",
            "salary",
            "ctc"
          ),
          eligibility: checkCgpaEligibility(criteria, cgpa),
        };
      }),
    [companies, cgpa]
  );

  const recommendations = useMemo(() => {
    const rank = { eligible: 0, review: 1, "not-eligible": 2 };

    return [...jobs].sort(
      (a, b) => rank[a.eligibility.status] - rank[b.eligibility.status]
    );
  }, [jobs]);

  const eligibleCount = jobs.filter(
    (job) => job.eligibility.status === "eligible"
  ).length;

  const reviewCount = jobs.filter(
    (job) => job.eligibility.status === "review"
  ).length;

  return (
    <section className="recommended-jobs">
      <header className="jobs-heading">
        <div>
          <h2>Recommended Jobs</h2>
          <p>Explore company roles listed by your placement administrator.</p>
        </div>

        <button
          type="button"
          className="refresh-jobs"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <div className="jobs-notice">
        These records do not confirm that a vacancy is currently open.
        Verify hiring status and complete requirements with your placement cell.
      </div>

      {cgpa === null && (
        <div className="jobs-notice">
          Your CGPA was not found in your student profile. Eligibility
          cannot be confirmed until your CGPA is available.
        </div>
      )}

      {loading && (
        <p className="jobs-loading" role="status">
          Loading company opportunities...
        </p>
      )}

      {!loading && error && (
        <div className="jobs-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={handleRefresh}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="jobs-summary">
          <div className="jobs-summary-item">
            <strong>{jobs.length}</strong>
            <span>Company roles</span>
          </div>
          <div className="jobs-summary-item">
            <strong>{eligibleCount}</strong>
            <span>Meet stated CGPA criteria</span>
          </div>
          <div className="jobs-summary-item">
            <strong>{reviewCount}</strong>
            <span>Need eligibility review</span>
          </div>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="jobs-empty">
          <h3>No company roles available</h3>
          <p>Ask your placement administrator to add company roles.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="jobs-grid">
          {recommendations.map((job) => {
            const isSaved = savedJobs.includes(job.id);

            return (
              <article className="job-card" key={job.id}>
                <div className="job-card-heading">
                  <div>
                    <h3>{job.role}</h3>
                    <p className="job-company">{job.companyName}</p>
                  </div>
                  <span className="job-label">Admin listed</span>
                </div>

                <div className="job-details">
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Eligibility:</strong> {job.criteria}</p>
                  <p>
                    <strong>Package:</strong>{" "}
                    {formatPackage(job.packageOffered)}
                  </p>
                </div>

                <div className={`eligibility-status ${job.eligibility.status}`}>
                  {job.eligibility.message}
                </div>

                <p className="recommendation-reason">
                  {job.eligibility.status === "eligible"
                    ? "Meets the stated CGPA criterion. Verify all other requirements."
                    : job.eligibility.status === "not-eligible"
                      ? "Does not meet the stated CGPA criterion."
                      : "Verify the full eligibility requirements with your placement administrator."}
                </p>

                <button
                  type="button"
                  className={`save-job ${isSaved ? "saved" : ""}`}
                  onClick={() => toggleSave(job.id)}
                  aria-pressed={isSaved}
                >
                  {isSaved ? "★ Saved Job" : "☆ Save Job"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
